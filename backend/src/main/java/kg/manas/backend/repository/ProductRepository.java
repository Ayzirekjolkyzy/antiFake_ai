package kg.manas.backend.repository;

import kg.manas.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product>findByBrand_brandId(Long brandId);
    List<Product> findByBrand_BrandNameContainingIgnoreCaseOrProductNameContainingIgnoreCase(String brandName, String ProductName);
    Optional<Product> findByBarcode(String barcode);
    boolean existsByBrand_BrandId(Long brandId);
    boolean existsByBarcode(String barcode);
    List<Product>findByCountry_CountryId(Long countryId);
}

