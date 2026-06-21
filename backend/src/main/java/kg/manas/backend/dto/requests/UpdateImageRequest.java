package kg.manas.backend.dto.requests;

import kg.manas.backend.model.enums.ImageAngle;

public record UpdateImageRequest(

        Long productId,
        ImageAngle angle
) {
}
