package kg.manas.backend.dto.responses;

import lombok.Builder;

@Builder
public record AiVerifyResponse(

        Long productId,

        String selectedAngle,

        String detectedAngle,

        boolean angleMismatch,

        Double similarity,

        Double confidencePercent,

        String decision,

        String message,

        String matchedReferencePath,

        String modelName

) {
}