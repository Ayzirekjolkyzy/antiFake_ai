from fastapi import FastAPI, HTTPException

from app.roboflow_segmentation import crop_product_preview_base64
from app.schemas import (
    AngleVerificationRequest,
    AngleVerificationResponse,
    CropPreviewRequest,
    CropPreviewResponse,
)
from app.siamese_verifier import verify_product_with_angle

app = FastAPI(
    title="AntiFakeAI AI Service",
    description="AI service for counterfeit cosmetic product verification",
    version="1.0.0",
)


@app.get("/")
def health_check():
    return {
        "status": "ok",
        "service": "AntiFakeAI AI Service",
    }


@app.post(
    "/api/v1/verify/angle-similarity",
    response_model=AngleVerificationResponse,
)
def verify_product_angle_similarity(request: AngleVerificationRequest):
    try:
        result = verify_product_with_angle(
            product_id=request.productId,
            selected_angle=request.imageAngle,
            user_image_url=request.userImageUrl,
        )

        return AngleVerificationResponse(**result)

    except Exception as e:
        print("ANGLE SIMILARITY ERROR:", repr(e))
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка проверки изображения по ракурсу: {repr(e)}",
        )


@app.post(
    "/api/v1/images/crop-preview",
    response_model=CropPreviewResponse,
)
def crop_preview(request: CropPreviewRequest):
    try:
        image_base64 = crop_product_preview_base64(request.imageUrl)

        return CropPreviewResponse(
            croppedImageBase64=image_base64,
            message="YOLO Segmentation успешно выделила объект",
        )

    except Exception as e:
        print("CROP PREVIEW ERROR:", repr(e))
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка сегментации изображения: {repr(e)}",
        )