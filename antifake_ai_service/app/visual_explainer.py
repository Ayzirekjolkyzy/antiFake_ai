import json
import os
import re
import tempfile
from pathlib import Path

import requests
from google import genai
from google.genai import types

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def _empty_visual_result() -> dict:
    return {
        "visualDifferences": [],
        "suspiciousElements": [],
        "authenticityRisk": None,
        "explanation": None,
        "recommendation": None,
    }


def _download_image_to_temp(image_url: str) -> Path:
    response = requests.get(image_url, timeout=30)
    response.raise_for_status()

    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
    temp_file.write(response.content)
    temp_file.close()

    return Path(temp_file.name)


def _extract_json(text: str) -> dict:
    if not text:
        return _empty_visual_result()

    text = text.strip()
    text = text.replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(text)
    except Exception:
        match = re.search(r"\{.*\}", text, re.DOTALL)

        if not match:
            return _empty_visual_result()

        try:
            return json.loads(match.group(0))
        except Exception:
            return _empty_visual_result()


def analyze_visual_differences(
        reference_image_path: str,
        user_image_url: str,
        similarity_percent: float,
        siamese_decision: str,
        selected_angle: str,
):
    if not os.getenv("GEMINI_API_KEY"):
        return _empty_visual_result()

    user_temp_path = None

    try:
        user_temp_path = _download_image_to_temp(user_image_url)

        reference_file = client.files.upload(file=reference_image_path)
        user_file = client.files.upload(file=str(user_temp_path))

        prompt = f"""
Ты специалист по проверке оригинальности косметической продукции.

Сравни эталонное изображение (1-е изображение) и изображение пользователя (2-е изображение).
Игнорируй фон, освещение, тени, качество камеры и небольшой угол съемки.

Оцени только сам товар:
- форму упаковки;
- крышку;
- логотип;
- название продукта;
- орфографию;
- шрифт;
- расположение текста;
- цвет;
- штрих-код;
- элементы дизайна.

Контекст системы:
- Siamese similarity: {similarity_percent}%
- Siamese decision: {siamese_decision}
- selected angle: {selected_angle}

Правила:
1. Не меняй similarity.
2. Если есть грубая ошибка в названии продукта, recommendation должен быть FAKE.
3. Если отличий нет, recommendation должен быть ORIGINAL.
4. Если есть небольшие сомнения, recommendation должен быть NEEDS_REVIEW.
5. Отвечай только на русском языке.
6. Верни только JSON без markdown.

Формат JSON:
{{
  "visualDifferences": [],
  "suspiciousElements": [],
  "authenticityRisk": "LOW | MEDIUM | HIGH",
  "explanation": "",
  "recommendation": "ORIGINAL | FAKE | NEEDS_REVIEW"
}}
"""

        response = client.models.generate_content(
            model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
            contents=[
                prompt,
                reference_file,
                user_file,
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.1,
            ),
        )

        return _extract_json(response.text)

    except Exception as e:
        print("VISUAL EXPLAINER WARNING:", repr(e))
        return _empty_visual_result()

    finally:
        if user_temp_path:
            try:
                user_temp_path.unlink(missing_ok=True)
            except Exception:
                pass