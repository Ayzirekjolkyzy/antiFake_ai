package kg.manas.backend.dto.responses;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record BrandResponse(
        Long brandId,
        String name,
        Long countryId,
        String officialWebsite,
        String logoUrl,
        String description,
        Boolean isHighRisk,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}