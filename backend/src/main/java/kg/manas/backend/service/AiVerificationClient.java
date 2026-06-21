package kg.manas.backend.service;

import kg.manas.backend.dto.responses.AiVerifyResponse;

public interface AiVerificationClient {

    AiVerifyResponse verify(
            Long productId,
            String imageAngle,
            String userImageUrl
    );
}