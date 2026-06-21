package kg.manas.backend.service;

import kg.manas.backend.dto.requests.BrandRequest;
import kg.manas.backend.dto.responses.BrandResponse;
import kg.manas.backend.dto.responses.SimpleResponse;
import kg.manas.backend.model.Brand;

import java.util.List;

public interface BrandService {
    SimpleResponse createBrand(BrandRequest request);
    SimpleResponse updateBrand(Long id, BrandRequest request);
    SimpleResponse deleteBrand(Long id);
    BrandResponse getBrandById(Long id);
    List<BrandResponse> getAllBrands();
    List<BrandResponse> findByCountry(Long countryId);
    List<BrandResponse> findByBrandName(String brandName);
    Brand getBrandEntity(Long id);
}
