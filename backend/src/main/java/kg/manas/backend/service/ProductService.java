package kg.manas.backend.service;

import kg.manas.backend.dto.requests.ProductRequest;
import kg.manas.backend.dto.requests.UpdateProductRequest;
import kg.manas.backend.dto.responses.ProductAllResponse;
import kg.manas.backend.dto.responses.ProductResponse;
import kg.manas.backend.dto.responses.SimpleResponse;
import kg.manas.backend.model.enums.ProductVolume;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProductService {

//    SimpleResponse createProduct(ProductRequest request, ProductVolume volume);
SimpleResponse createProduct(
        ProductRequest request,
        MultipartFile mainImage,
        ProductVolume volume
);
    SimpleResponse updateProduct(Long id, UpdateProductRequest request, ProductVolume volume);
    SimpleResponse deleteProduct(Long id);
    ProductResponse getProduct(Long id);
    List<ProductAllResponse> getAllProducts();

    @Transactional
    SimpleResponse updateMainImage(
            Long id,
            MultipartFile mainImage
    );

    List<ProductAllResponse> getProductByBrand(Long branId);
    List<ProductAllResponse> findByProductNameOrBrandName(String query);
    ProductResponse getProductByBarcode(String barcode);
    List<ProductAllResponse> findByCountry(Long countryId);


}
