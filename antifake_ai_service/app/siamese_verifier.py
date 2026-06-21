import os
from pathlib import Path

import torch
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image
from torchvision import models, transforms

from app.roboflow_segmentation import crop_product_by_roboflow
from app.visual_explainer import analyze_visual_differences

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = Path(
    os.getenv(
        "SIAMESE_MODEL_PATH",
        str(BASE_DIR / "models" / "siamese_model.pt"),
    )
)

ANGLE_DATASET_DIR = Path(
    os.getenv(
        "ANGLE_DATASET_DIR",
        str(BASE_DIR / "dataset_cropped" / "train"),
    )
)

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
EMBEDDING_SIZE = 256
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

ALL_ANGLES = [
    "front",
    "back",
    "side_left",
    "side_right",
    "top_with_cap",
    "top_without_cap",
    "box_front",
    "box_back",
    "box_side_left",
    "box_side_right",
    "box_top",
    "logo",
    "ingredients",
    "barcode",
    "text",
    "box_text",
    "cap",
]


class SiameseNetwork(nn.Module):
    def __init__(self, embedding_size=256):
        super().__init__()

        backbone = models.resnet18(weights=None)

        self.feature_extractor = nn.Sequential(
            *list(backbone.children())[:-1]
        )

        self.embedding = nn.Sequential(
            nn.Linear(512, embedding_size),
            nn.ReLU(),
            nn.Linear(embedding_size, embedding_size),
        )

    def forward_once(self, x):
        features = self.feature_extractor(x)
        features = features.view(features.size(0), -1)

        embedding = self.embedding(features)
        embedding = F.normalize(embedding, p=2, dim=1)

        return embedding


transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])


def load_model():
    if not MODEL_PATH.exists():
        raise RuntimeError(
            f"Файл модели не найден: {MODEL_PATH}. "
            f"Укажите SIAMESE_MODEL_PATH в .env"
        )

    checkpoint = torch.load(MODEL_PATH, map_location=DEVICE)

    loaded_model = SiameseNetwork(
        embedding_size=checkpoint.get("embedding_size", EMBEDDING_SIZE)
    )

    loaded_model.load_state_dict(checkpoint["model_state_dict"])
    loaded_model.to(DEVICE)
    loaded_model.eval()

    return loaded_model


model = load_model()


def image_to_tensor(image: Image.Image):
    return transform(image).unsqueeze(0).to(DEVICE)


def get_embedding_from_user_url(image_url: str):
    cropped = crop_product_by_roboflow(image_url)
    image = Image.fromarray(cropped).convert("RGB")
    tensor = image_to_tensor(image)

    with torch.no_grad():
        return model.forward_once(tensor)


def get_embedding_from_local_path(image_path: Path):
    image = Image.open(image_path).convert("RGB")
    tensor = image_to_tensor(image)

    with torch.no_grad():
        return model.forward_once(tensor)


def get_reference_images_by_angle(product_id: int, angle: str):
    folder = ANGLE_DATASET_DIR / f"product_{product_id}" / angle.lower()

    if not folder.exists():
        raise RuntimeError(f"Папка эталонных изображений не найдена: {folder}")

    images = [
        path for path in folder.iterdir()
        if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS
    ]

    if not images:
        raise RuntimeError(f"В папке нет эталонных изображений: {folder}")

    return images


def compare_with_angle(product_id: int, angle: str, user_embedding):
    references = get_reference_images_by_angle(product_id, angle)

    best_similarity = -1.0
    best_reference = None

    for ref_path in references:
        ref_embedding = get_embedding_from_local_path(ref_path)

        similarity = F.cosine_similarity(
            user_embedding,
            ref_embedding,
        ).item()

        if similarity > best_similarity:
            best_similarity = similarity
            best_reference = ref_path

    return best_similarity, best_reference


def detect_best_angle(product_id: int, user_embedding):
    results = []

    for angle in ALL_ANGLES:
        try:
            score, ref_path = compare_with_angle(
                product_id,
                angle,
                user_embedding,
            )
            results.append((angle, score, ref_path))
        except Exception:
            continue

    if not results:
        raise RuntimeError(f"Не удалось определить ракурс для product_{product_id}")

    results.sort(key=lambda item: item[1], reverse=True)

    return results[0]


def make_final_decision(similarity: float) -> str:
    if similarity >= 0.95:
        return "AUTO_ORIGINAL"

    if similarity >= 0.80:
        return "NEEDS_REVIEW"

    return "AUTO_FAKE"


def build_similarity_message(decision: str, similarity: float) -> str:
    percent = round(similarity * 100, 2)

    if decision == "AUTO_ORIGINAL":
        return (
            f"Изображение имеет высокое сходство с эталонными изображениями. "
            f"Сходство: {percent}%."
        )

    if decision == "NEEDS_REVIEW":
        return (
            f"Изображение похоже на эталон, но находится в зоне неопределённости. "
            f"Требуется проверка администратора. Сходство: {percent}%."
        )

    return (
        f"Изображение имеет низкое сходство с эталонными изображениями товара. "
        f"Возможна подделка. Сходство: {percent}%."
    )


def verify_product_with_angle(
        product_id: int,
        selected_angle: str,
        user_image_url: str,
):
    selected_angle = selected_angle.lower()

    user_embedding = get_embedding_from_user_url(user_image_url)

    selected_score, selected_reference = compare_with_angle(
        product_id,
        selected_angle,
        user_embedding,
    )

    detected_angle, detected_score, _ = detect_best_angle(
        product_id,
        user_embedding,
    )

    decision = make_final_decision(selected_score)

    visual_result = analyze_visual_differences(
        reference_image_path=str(selected_reference),
        user_image_url=user_image_url,
        similarity_percent=round(float(selected_score) * 100, 2),
        siamese_decision=decision,
        selected_angle=selected_angle.upper(),
    )

    visual_recommendation = visual_result.get("recommendation")
    authenticity_risk = visual_result.get("authenticityRisk")
    visual_differences = visual_result.get("visualDifferences", [])
    suspicious_elements = visual_result.get("suspiciousElements", [])
    ai_explanation = visual_result.get("explanation")

    if visual_recommendation == "FAKE" or authenticity_risk == "HIGH":
        decision = "NEEDS_REVIEW"
        message = (
            f"Изображение похоже на эталон, однако у товара обнаружены подозрительные признаки. "
            f"Сходство: {round(float(selected_score) * 100, 2)}%. "
            f"{ai_explanation or ''}"
        ).strip()

    elif visual_recommendation == "NEEDS_REVIEW" or authenticity_risk == "MEDIUM":
        decision = "NEEDS_REVIEW"
        message = (
            f"Изображение похоже на эталон, однако при дополнительной визуальной проверке "
            f"были выявлены сомнительные признаки. "
            f"Сходство: {round(float(selected_score) * 100, 2)}%. "
            f"{ai_explanation or ''}"
        ).strip()

    else:
        message = build_similarity_message(decision, selected_score)

    angle_mismatch = (
        detected_angle != selected_angle
        and detected_score - selected_score >= 0.05
    )

    if angle_mismatch:
        decision = "NEEDS_REVIEW"
        message = (
            f"Выбранный ракурс {selected_angle.upper()} не совпадает с изображением. "
            f"Изображение больше похоже на {detected_angle.upper()}. "
            f"Оценка сходства рассчитана по выбранному ракурсу: "
            f"{round(float(selected_score) * 100, 2)}%. "
            f"{ai_explanation or ''}"
        ).strip()

    return {
        "productId": product_id,
        "selectedAngle": selected_angle.upper(),
        "detectedAngle": detected_angle.upper(),
        "similarity": round(float(selected_score), 4),
        "confidencePercent": round(float(selected_score) * 100, 2),
        "decision": decision,
        "message": message,
        "matchedReferencePath": str(selected_reference),
        "modelName": "Siamese ResNet18 AntiFakeAI",
        "visualDifferences": visual_differences,
        "suspiciousElements": suspicious_elements,
        "authenticityRisk": authenticity_risk,
        "aiExplanation": ai_explanation,
        "visualRecommendation": visual_recommendation,
        "angleMismatch": angle_mismatch,
    }