package kg.manas.backend.dto.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ProductRequest(

        @NotBlank(message = "VALIDATION.PRODUCT.NAME.NOT_BLANK")
        String productName,
        @NotBlank(message = "VALIDATION.PRODUCT.BARCODE.NOT_BLANK")
        String barcode,
        String description,
        @NotNull(message = "VALIDATION.PRODUCT.BRAND_ID.NOT_NULL")
        Long brand_id,
        @NotNull(message = "VALIDATION.BRAND.COUNTRY_ID.NOT_NULL")
        Long countryId
//        @NotNull
//        ProductVolume volume

) {

}
