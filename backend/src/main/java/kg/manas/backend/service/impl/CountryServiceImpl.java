package kg.manas.backend.service.impl;

import kg.manas.backend.dto.responses.CountryResponse;
import kg.manas.backend.exceptions.BusinessException;
import kg.manas.backend.exceptions.ErrorCode;
import kg.manas.backend.model.Country;
import kg.manas.backend.repository.CountryRepository;
import kg.manas.backend.service.CountryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CountryServiceImpl implements CountryService {

    private final CountryRepository countryRepository;
    @Override
    public Country getCountryEntity(Long id) {
        log.info(
                "Fetching country entity with id = {}",
                id
        );
        return countryRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.COUNTRY_NOT_FOUND));
    }

    @Override
    public List<CountryResponse> getAllCountries() {
        log.info("Fetching all countries");
        return countryRepository.findAll()
                .stream()
                .map(country -> CountryResponse.builder()
                        .countryId(country.getCountryId())
                        .countryName(country.getCountryName())
                        .code(country.getCode()).build()
                )
                .toList();
    }

    @Override
    public CountryResponse getCountryById(Long id) {
        Country country = countryRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.COUNTRY_NOT_FOUND));
        log.info(
                "Fetching country with id = {}",
                id
        );
        return CountryResponse.builder()
                .countryId(country.getCountryId())
                .countryName(country.getCountryName())
                .code(country.getCode()).build();
    }


}
