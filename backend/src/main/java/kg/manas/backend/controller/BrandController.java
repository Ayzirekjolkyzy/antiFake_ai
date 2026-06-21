package kg.manas.backend.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import kg.manas.backend.dto.requests.BrandRequest;
import kg.manas.backend.dto.responses.BrandResponse;
import kg.manas.backend.dto.responses.SimpleResponse;
import kg.manas.backend.service.BrandService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/brands")
@RequiredArgsConstructor
@Tag(name = "Brand", description = "Brand api")
public class BrandController {

    private final BrandService brandService;

    @GetMapping
    public List<BrandResponse> getAllBrands() {
        return brandService.getAllBrands();
    }

    @GetMapping("/{id}")
    public BrandResponse getBrandById(@PathVariable Long id) {
        return brandService.getBrandById(id);
    }

    @GetMapping("/by-country/{id}")
    public List<BrandResponse> getBrandByCountry(@PathVariable Long id) {
        return brandService.findByCountry(id);
    }

    @GetMapping("/search")
    public List<BrandResponse> getBrandByName(@RequestParam String name) {
        return brandService.findByBrandName(name);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public SimpleResponse createBrand(
            @RequestBody
            @Valid
            BrandRequest request
    ) {
        return brandService.createBrand(request);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}")
    public SimpleResponse updateBrand(
            @PathVariable Long id,
            @RequestBody BrandRequest request
    ) {
        return brandService.updateBrand(id, request);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public SimpleResponse deleteBrand(
            @PathVariable Long id
    ) {
        return brandService.deleteBrand(id);
    }
}