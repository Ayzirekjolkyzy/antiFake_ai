package kg.manas.backend.service.impl;

import kg.manas.backend.dto.requests.AiVerifyRequest;
import kg.manas.backend.dto.responses.AiVerifyResponse;
import kg.manas.backend.service.AiVerificationClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
@RequiredArgsConstructor
public class AiVerificationClientImpl implements AiVerificationClient {

    private final RestClient aiRestClient;

    @Override
    public AiVerifyResponse verify(
            Long productId,
            String imageAngle,
            String userImageUrl
    ) {
        return aiRestClient.post()
                .uri("/api/v1/verify/angle-similarity")
                .body(AiVerifyRequest.builder()
                        .productId(productId)
                        .imageAngle(imageAngle)
                        .userImageUrl(userImageUrl)
                        .build())
                .retrieve()
                .body(AiVerifyResponse.class);
    }
}