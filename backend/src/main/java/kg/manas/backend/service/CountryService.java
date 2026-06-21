package kg.manas.backend.service;

import kg.manas.backend.dto.responses.CountryResponse;
import kg.manas.backend.model.Country;

import java.util.List;

public interface CountryService {
    Country getCountryEntity(Long id);
    List<CountryResponse> getAllCountries();
    CountryResponse getCountryById(Long id);
}
