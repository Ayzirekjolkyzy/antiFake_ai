from typing import List

from pydantic import BaseModel


class AngleVerificationRequest(BaseModel):
    productId: int
    imageAngle: str
    userImageUrl: str


class AngleVerificationResponse(BaseModel):
    productId: int
    selectedAngle: str
    detectedAngle: str | None
    similarity: float
    confidencePercent: float
    decision: str
    message: str
    matchedReferencePath: str | None
    modelName: str

    visualDifferences: List[str] = []
    suspiciousElements: List[str] = []
    authenticityRisk: str | None = None
    aiExplanation: str | None = None
    visualRecommendation: str | None = None
    angleMismatch: bool = False


class CropPreviewRequest(BaseModel):
    imageUrl: str


class CropPreviewResponse(BaseModel):
    croppedImageBase64: str
    message: str