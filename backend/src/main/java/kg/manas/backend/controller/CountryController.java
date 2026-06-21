package kg.manas.backend.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import kg.manas.backend.dto.responses.CountryResponse;
import kg.manas.backend.service.CountryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/countries")
@RequiredArgsConstructor

@Tag(name="Country", description = "Country api")
public class CountryController {

    private final CountryService countryService;

    @GetMapping
    public List<CountryResponse> getAllCountries(){
        return countryService.getAllCountries();
    }

    @GetMapping("/{id}")
    public CountryResponse getCountryById(@PathVariable("id") Long id) {
        return countryService.getCountryById(id);
    }
}
