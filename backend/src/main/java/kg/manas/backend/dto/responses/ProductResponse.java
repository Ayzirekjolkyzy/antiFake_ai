package kg.manas.backend.dto.responses;
import kg.manas.backend.model.enums.ProductVolume;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record ProductResponse (
    Long productId,
    String name,
    String barcode,
    String description,
    ProductVolume volume,
    String mainImageUrl,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    BrandResponse brandResponse,
    Long countryId
){
}
