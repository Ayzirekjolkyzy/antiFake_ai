package kg.manas.backend.dto.responses;

import kg.manas.backend.model.enums.ProductVolume;
import lombok.Builder;

@Builder
public record ProductAllResponse(
        Long productId,
        String name,
        String barcode,
        String brandName,
        String mainImageUrl,
        ProductVolume volume,
        Long countryId
) {
}
