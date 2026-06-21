package kg.manas.backend.dto.responses;

import lombok.Builder;

@Builder
public record CountryResponse (
        Long countryId,
        String countryName,
        String code
){
}
