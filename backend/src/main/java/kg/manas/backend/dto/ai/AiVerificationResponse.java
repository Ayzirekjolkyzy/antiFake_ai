package kg.manas.backend.dto.ai;

public record AiVerificationResponse(

        Long productId,

        String selectedAngle,

        String detectedAngle,

        Double similarity,

        Double confidencePercent,

        String decision,

        String message,

        String matchedReferencePath,

        String modelName,

        boolean angleMismatch
) {
}