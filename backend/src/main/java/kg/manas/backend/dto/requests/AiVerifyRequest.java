package kg.manas.backend.dto.requests;

import lombok.Builder;

@Builder
public record AiVerifyRequest(

        Long productId,

        String imageAngle,

        String userImageUrl

) {
}