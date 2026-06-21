package kg.manas.backend.dto.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record BrandRequest(

        @NotBlank(message = "VALIDATION.BRAND.NAME.NOT_BLANK")
        String brandName,

        @NotNull(message = "VALIDATION.BRAND.COUNTRY_ID.NOT_NULL")
        Long countryId,

        String officialWebsite,

        String logoUrl,

        String description,

        Boolean isHighRisk
) {
}