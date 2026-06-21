package kg.manas.backend.service.impl;

import kg.manas.backend.dto.requests.BrandRequest;
import kg.manas.backend.dto.responses.BrandResponse;
import kg.manas.backend.dto.responses.SimpleResponse;
import kg.manas.backend.exceptions.BusinessException;
import kg.manas.backend.exceptions.ErrorCode;
import kg.manas.backend.model.Brand;
import kg.manas.backend.model.Country;
import kg.manas.backend.repository.BrandRepository;
import kg.manas.backend.repository.ProductRepository;
import kg.manas.backend.service.BrandService;
import kg.manas.backend.service.CountryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepository;
    private final CountryService countryService;
    private final ProductRepository productRepository;

    @Transactional
    @Override
    public SimpleResponse createBrand(BrandRequest request) {
        if (brandRepository.existsByBrandNameIgnoreCase(request.brandName())) {
            throw new BusinessException(ErrorCode.BRAND_ALREADY_EXISTS);
        }

        if (request.countryId() == null) {
            throw new BusinessException(ErrorCode.COUNTRY_REQUIRED);
        }

        Country country = countryService.getCountryEntity(request.countryId());

        Brand brand = Brand.builder()
                .brandName(request.brandName())
                .country(country)
                .officialWebsite(request.officialWebsite())
                .logoUrl(request.logoUrl())
                .description(request.description())
                .isHighRisk(request.isHighRisk() != null ? request.isHighRisk() : false)
                .build();

        brandRepository.save(brand);

        log.info("Created brand with id={}", brand.getBrandId());

        return SimpleResponse.builder()
                .httpStatus(HttpStatus.CREATED)
                .message(
                        "Brand with id = " + brand.getBrandId() +
                                " and name = " + brand.getBrandName() +
                                " was successfully created"
                )
                .build();
    }

    @Transactional
    @Override
    public SimpleResponse updateBrand(Long id, BrandRequest request) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.BRAND_NOT_FOUND));

        if (request.brandName() != null && !request.brandName().isBlank()) {
            brand.setBrandName(request.brandName());
        }

        if (request.countryId() != null) {
            Country country = countryService.getCountryEntity(request.countryId());
            brand.setCountry(country);
        }

        if (request.officialWebsite() != null) {
            brand.setOfficialWebsite(request.officialWebsite());
        }

        if (request.logoUrl() != null) {
            brand.setLogoUrl(request.logoUrl());
        }

        if (request.description() != null) {
            brand.setDescription(request.description());
        }

        if (request.isHighRisk() != null) {
            brand.setIsHighRisk(request.isHighRisk());
        }

        brandRepository.save(brand);

        log.info("Updated brand with id={}", id);

        return SimpleResponse.builder()
                .httpStatus(HttpStatus.OK)
                .message(
                        "Brand with id = " + brand.getBrandId() +
                                " was successfully updated"
                )
                .build();
    }

    @Transactional
    @Override
    public SimpleResponse deleteBrand(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.BRAND_NOT_FOUND));

        boolean exists = productRepository.existsByBrand_BrandId(id);

        if (exists) {
            throw new BusinessException(ErrorCode.BRAND_HAS_PRODUCTS);
        }

        brandRepository.delete(brand);

        log.info("Deleted brand with id={}", id);

        return SimpleResponse.builder()
                .httpStatus(HttpStatus.OK)
                .message(
                        "Brand with id = " +
                                brand.getBrandId() +
                                " was successfully deleted"
                )
                .build();
    }

    @Transactional(readOnly = true)
    @Override
    public BrandResponse getBrandById(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.BRAND_NOT_FOUND));

        log.info("Fetching brand with id = {}", id);

        return mapToBrandResponse(brand);
    }

    @Transactional(readOnly = true)
    @Override
    public List<BrandResponse> getAllBrands() {
        log.info("Fetching all brands");

        return brandRepository.findAll()
                .stream()
                .map(this::mapToBrandResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public List<BrandResponse> findByCountry(Long countryId) {
        if (countryId == null) {
            throw new BusinessException(ErrorCode.COUNTRY_REQUIRED);
        }

        countryService.getCountryEntity(countryId);

        log.info("Fetching brands by country with id = {}", countryId);

        return brandRepository.findByCountry_CountryId(countryId)
                .stream()
                .map(this::mapToBrandResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public List<BrandResponse> findByBrandName(String brandName) {
        if (brandName == null || brandName.isBlank()) {
            throw new BusinessException(ErrorCode.QUERY_REQUIRED);
        }

        log.info("Searching brands with name = {}", brandName);

        return brandRepository.findByBrandNameContainingIgnoreCase(brandName)
                .stream()
                .map(this::mapToBrandResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public Brand getBrandEntity(Long id) {
        return brandRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.BRAND_NOT_FOUND));
    }

    private BrandResponse mapToBrandResponse(Brand brand) {
        return BrandResponse.builder()
                .brandId(brand.getBrandId())
                .name(brand.getBrandName())
                .countryId(brand.getCountry().getCountryId())
                .officialWebsite(brand.getOfficialWebsite())
                .logoUrl(brand.getLogoUrl())
                .description(brand.getDescription())
                .isHighRisk(brand.getIsHighRisk())
                .createdAt(brand.getCreatedAt())
                .updatedAt(brand.getUpdatedAt())
                .build();
    }
}