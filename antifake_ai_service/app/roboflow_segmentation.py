import base64
import os
import tempfile
from pathlib import Path

import cv2
import numpy as np
import requests
from dotenv import load_dotenv
from inference_sdk import InferenceHTTPClient

load_dotenv()

client = InferenceHTTPClient(
    api_url=os.getenv("ROBOFLOW_API_URL", "https://serverless.roboflow.com"),
    api_key=os.getenv("ROBOFLOW_API_KEY"),
)

MODEL_ID = os.getenv("ROBOFLOW_MODEL_ID", "antifakeai-segmentation/4")


def download_image_to_temp(image_url: str) -> str:
    response = requests.get(image_url, timeout=30)
    response.raise_for_status()

    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
    temp_file.write(response.content)
    temp_file.close()

    return temp_file.name


def read_image_cv2(image_path: str):
    image = cv2.imdecode(
        np.fromfile(image_path, dtype=np.uint8),
        cv2.IMREAD_COLOR,
    )

    if image is None:
        raise RuntimeError(f"Не удалось открыть изображение: {image_path}")

    return image


def crop_product_from_path(image_path: str):
    result = client.infer(
        image_path,
        model_id=MODEL_ID,
    )

    image = read_image_cv2(image_path)
    predictions = result.get("predictions", [])

    if not predictions:
        return cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    best = max(
        predictions,
        key=lambda p: p.get("width", 0) * p.get("height", 0),
    )

    x = int(best["x"])
    y = int(best["y"])
    w = int(best["width"])
    h = int(best["height"])

    padding = int(max(w, h) * 0.08)

    x1 = max(x - w // 2 - padding, 0)
    y1 = max(y - h // 2 - padding, 0)
    x2 = min(x + w // 2 + padding, image.shape[1])
    y2 = min(y + h // 2 + padding, image.shape[0])

    cropped = image[y1:y2, x1:x2]

    return cv2.cvtColor(cropped, cv2.COLOR_BGR2RGB)


def crop_product_by_roboflow(image_url: str):
    image_path = download_image_to_temp(image_url)

    try:
        return crop_product_from_path(image_path)
    finally:
        try:
            Path(image_path).unlink(missing_ok=True)
        except Exception:
            pass


def crop_product_preview_base64(image_url: str) -> str:
    cropped_rgb = crop_product_by_roboflow(image_url)
    cropped_bgr = cv2.cvtColor(cropped_rgb, cv2.COLOR_RGB2BGR)

    success, buffer = cv2.imencode(".jpg", cropped_bgr)

    if not success:
        raise RuntimeError("Не удалось закодировать cropped image")

    return base64.b64encode(buffer).decode("utf-8")