package kg.manas.backend.repository;

import kg.manas.backend.model.Brand;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BrandRepository extends JpaRepository<Brand, Long> {
    List<Brand> findByCountry_CountryId(Long countryId);
    List<Brand> findByBrandNameContainingIgnoreCase(String brandName);

    boolean existsByBrandNameIgnoreCase(String brandName);
}
