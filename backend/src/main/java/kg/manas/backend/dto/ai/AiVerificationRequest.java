package kg.manas.backend.dto.ai;

public record AiVerificationRequest(
        Long productId,
        String imageAngle,
        String userImageUrl
) {
}