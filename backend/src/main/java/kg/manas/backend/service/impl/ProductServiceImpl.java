package kg.manas.backend.service.impl;

import kg.manas.backend.dto.responses.*;
import kg.manas.backend.model.Country;
import kg.manas.backend.model.enums.ProductVolume;
import kg.manas.backend.service.CountryService;
import kg.manas.backend.service.ImageStorageService;
import org.springframework.transaction.annotation.Transactional;
import kg.manas.backend.dto.requests.ProductRequest;
import kg.manas.backend.dto.requests.UpdateProductRequest;
import kg.manas.backend.exceptions.BusinessException;
import kg.manas.backend.exceptions.ErrorCode;
import kg.manas.backend.model.Brand;
import kg.manas.backend.model.Product;
import kg.manas.backend.repository.ProductRepository;
import kg.manas.backend.service.BrandService;
import kg.manas.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final BrandService brandService;
    private final ImageStorageService imageStorageService;
    private final CountryService countryService;


    @Transactional(readOnly = true)
    @Override
    public ProductResponse getProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));
        log.info("Get product with id={}", id);
        return mapToProductResponse(product);
    }

    @Transactional(readOnly = true)
    @Override
    public List<ProductAllResponse> getAllProducts() {
        log.info(
                "Fetched {} products",
                productRepository.count()
        );
        return productRepository.findAll().stream()
                .map(this::mapToProductAllResponse)
                .toList();
    }
    @Transactional
    @Override
    public SimpleResponse createProduct(ProductRequest request, MultipartFile mainImage, ProductVolume productVolume) {
        if(productRepository.existsByBarcode(request.barcode())) {
            throw new BusinessException(ErrorCode.PRODUCT_ALREADY_EXISTS);
        }
        if(request.brand_id()==null) throw new BusinessException(ErrorCode.BRAND_REQUIRED);
        if(request.countryId()==null) {
            throw  new BusinessException(ErrorCode.COUNTRY_REQUIRED);
        }
        Country country = countryService.getCountryEntity(request.countryId());
        if (mainImage == null || mainImage.isEmpty()) {
            throw new BusinessException(
                    ErrorCode.FILE_REQUIRED
            );
        }
        Brand brand = brandService.getBrandEntity(request.brand_id());

        Product product = Product.builder()
                .productName(request.productName())
                .barcode(request.barcode())
                .description(request.description())
                .brand(brand)
                .country(country)
                .volume(productVolume).build();
        productRepository.save(product);
        CloudinaryUploadResult uploadResult =
                imageStorageService.uploadFile(
                        mainImage,
                        product.getProductId(),
                        null
                );

        product.setMainImageUrl(
                uploadResult.imageUrl()
        );

        product.setMainImagePublicId(
                uploadResult.publicId()
        );

        productRepository.save(product);
        log.info("Created product with id={}", product.getProductId());
        return SimpleResponse.builder()
                .httpStatus(HttpStatus.CREATED)
                .message(
                        "Product with id = " + product.getProductId() +
                                " and barcode = " + product.getBarcode() +
                                " was successfully created"
                )
                .build();
    }
    @Transactional
    @Override
    public SimpleResponse updateProduct(Long id, UpdateProductRequest request, ProductVolume productVolume) {
        Product product=productRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));
        if(request.productName()!=null&&!request.productName().isBlank()) {
            product.setProductName(request.productName());
        }
        if(request.barcode()!=null&&!request.barcode().isBlank()&&!request.barcode().equals(product.getBarcode())) {
            if(productRepository.existsByBarcode(request.barcode())) {
                throw new BusinessException(ErrorCode.PRODUCT_ALREADY_EXISTS);
            }
            product.setBarcode(request.barcode());
        }

        if(request.description()!=null&&!request.description().isBlank()) {
            product.setDescription(request.description());
        }
        if(request.brand_id()!=null) {
            Brand brand=brandService.getBrandEntity(request.brand_id());
            product.setBrand(brand);
        }
        if(request.countryId()!=null) {
            Country country = countryService.getCountryEntity(request.countryId());
            product.setCountry(country);
        }
        if(productVolume!=null){
            product.setVolume(productVolume);
        }
        log.info("Updating product with id={}", id);
        productRepository.save(product);
        return SimpleResponse.builder()
                .httpStatus(HttpStatus.OK)
                .message(
                        "Product with id = " + product.getProductId() +
                                " was successfully updated"
                )
                .build();
    }
    @Transactional
    @Override
    public SimpleResponse deleteProduct(Long id) {
        Product product=productRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));

        if (product.getMainImagePublicId() != null) {

            imageStorageService.deleteFile(
                    product.getMainImagePublicId()
            );
        }
        log.info("Deleting product with id={}", id);
        productRepository.deleteById(id);
        return SimpleResponse.builder()
                .httpStatus(HttpStatus.OK)
                .message(
                        "Product with id = " +
                                id +
                                " was successfully deleted"
                )
                .build();
    }
    @Transactional
    @Override
    public SimpleResponse updateMainImage(
            Long id,
            MultipartFile mainImage
    ) {

        Product product =
                productRepository.findById(id)
                        .orElseThrow(() ->
                                new BusinessException(
                                        ErrorCode.PRODUCT_NOT_FOUND
                                ));

        if (mainImage == null || mainImage.isEmpty()) {
            throw new BusinessException(
                    ErrorCode.FILE_REQUIRED
            );
        }

        if (product.getMainImagePublicId() != null) {

            imageStorageService.deleteFile(
                    product.getMainImagePublicId()
            );
        }

        CloudinaryUploadResult uploadResult =
                imageStorageService.uploadFile(
                        mainImage,
                        product.getProductId(),
                        null
                );

        product.setMainImageUrl(
                uploadResult.imageUrl()
        );

        product.setMainImagePublicId(
                uploadResult.publicId()
        );

        productRepository.save(product);

        return SimpleResponse.builder()
                .httpStatus(HttpStatus.OK)
                .message(
                        "Main image was successfully updated for product with id = " +
                                product.getProductId()
                )
                .build();
    }

    @Override
    public List<ProductAllResponse> getProductByBrand(Long brandId) {
        if(brandId==null) throw new BusinessException(ErrorCode.BRAND_REQUIRED);
        brandService.getBrandEntity(brandId);
        log.info("Get product by brand with id={}", brandId);
        return productRepository.findByBrand_brandId(brandId).stream()
                .map(this::mapToProductAllResponse)
                .toList();
    }

    @Override
    public ProductResponse getProductByBarcode(String barcode) {
        if(barcode==null||barcode.isBlank()) throw new BusinessException(ErrorCode.BARCODE_REQUIRED);
        log.info("Searching product with barcode={}", barcode);
        Product product = productRepository.findByBarcode(barcode)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));
        return mapToProductResponse(product);
    }

    @Override
    public List<ProductAllResponse> findByProductNameOrBrandName(String query) {
        if(query==null||query.isBlank()) throw new BusinessException(ErrorCode.QUERY_REQUIRED);
        log.info("Searching products with query={}", query);
        return productRepository.findByBrand_BrandNameContainingIgnoreCaseOrProductNameContainingIgnoreCase(query,query)
                .stream()
                .map(this::mapToProductAllResponse)
                .toList();
    }
    @Override
    public List<ProductAllResponse> findByCountry(Long countryId) {
        if(countryId==null) throw new BusinessException(ErrorCode.COUNTRY_REQUIRED);
        countryService.getCountryEntity(countryId);
        return productRepository.findByCountry_CountryId(countryId).stream()
                .map(this::mapToProductAllResponse)
                .toList();
    }

    private ProductAllResponse mapToProductAllResponse(Product product) {

        return ProductAllResponse.builder()
                .productId(product.getProductId())
                .name(product.getProductName())
                .barcode(product.getBarcode())
                .brandName(product.getBrand().getBrandName())
                .mainImageUrl(product.getMainImageUrl())
                .volume(product.getVolume())
                .countryId(product.getCountry().getCountryId())
                .build();
    }

    private ProductResponse mapToProductResponse(Product product) {

        BrandResponse brandResponse = BrandResponse.builder()
                .brandId(product.getBrand().getBrandId())
                .name(product.getBrand().getBrandName())
                .countryId(
                        product.getBrand()
                                .getCountry()
                                .getCountryId()
                )
                .build();

        return ProductResponse.builder()
                .productId(product.getProductId())
                .name(product.getProductName())
                .barcode(product.getBarcode())
                .description(product.getDescription())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .brandResponse(brandResponse)
                .volume(product.getVolume())
                .countryId(product.getCountry().getCountryId())
                .mainImageUrl(product.getMainImageUrl())
                .build();
    }
}
