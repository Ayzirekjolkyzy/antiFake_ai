package kg.manas.backend.dto.responses;

import kg.manas.backend.model.enums.ImageAngle;
import kg.manas.backend.model.enums.ImageType;
import lombok.Builder;

import java.time.LocalDateTime;
@Builder
public record ImageResponse(
        Long imageId,
        Long productId,
        String productName,
        String brandName,
        String barcode,
        String imageUrl,
        String publicId,
        ImageType type,
        ImageAngle angle,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
