package kg.manas.backend.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import kg.manas.backend.dto.requests.ProductRequest;
import kg.manas.backend.dto.requests.UpdateProductRequest;
import kg.manas.backend.dto.responses.ProductAllResponse;
import kg.manas.backend.dto.responses.ProductResponse;
import kg.manas.backend.dto.responses.SimpleResponse;
import kg.manas.backend.model.enums.ProductVolume;
import kg.manas.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Tag(name="Product", description = "Product api")

public class ProductController {

    private final ProductService productService;

    @GetMapping
    public List<ProductAllResponse> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/{id}")
    public ProductResponse getProductById(@PathVariable Long id) {
        return productService.getProduct(id);
    }

    @GetMapping("/by-brand/{id}")
    public List<ProductAllResponse> getProductByBrand(@PathVariable Long id) {
        return productService.getProductByBrand(id);
    }

    @GetMapping("/barcode")
    public ProductResponse getProductByBarcode(@RequestParam String barcode) {
        return productService.getProductByBarcode(barcode);
    }

    @GetMapping("/search")
    public List<ProductAllResponse> getProductByNameOrBrandName(@RequestParam String query) {
        return productService.findByProductNameOrBrandName(query);
    }

//    @PreAuthorize("hasRole('ADMIN')")
//    @PostMapping
//    public SimpleResponse createProduct(
//            @RequestBody
//            @Valid
//            ProductRequest request,
//            @RequestParam(value = "volume", defaultValue = "ML_50") ProductVolume volume) {
//        return productService.createProduct(request, volume);
//    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public SimpleResponse createProduct(
                                        @RequestParam String productName,
                                        @RequestParam String barcode,
                                        @RequestParam(required = false)
                                        String description,
                                        @RequestParam Long brandId,
                                        @RequestParam Long countryId,
                                        @RequestParam(
                                                defaultValue = "ML_50"
                                        )
                                        ProductVolume volume,
                                        @RequestParam("mainImage")
                                        MultipartFile mainImage
    ) {
        ProductRequest request =
                                    new ProductRequest(
                                            productName,
                                            barcode,
                                            description,
                                            brandId,
                                            countryId
                                    );

        return productService.createProduct(
                request,
                mainImage,
                volume
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}")
    public SimpleResponse updateProduct(
            @PathVariable
            Long id,
            @RequestBody
            UpdateProductRequest request,
            @RequestParam(value = "volume") ProductVolume volume) {
        return productService.updateProduct(id, request, volume);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping(
            value = "/{id}/main-image",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public SimpleResponse updateMainImage(

            @PathVariable Long id,

            @RequestPart("mainImage")
            MultipartFile mainImage
    ) {

        return productService.updateMainImage(
                id,
                mainImage
        );
    }

    @GetMapping("/by-country/{id}")
    public List<ProductAllResponse> getProductByCountry(@PathVariable Long id) {
        return productService.findByCountry(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public SimpleResponse deleteProduct(
            @PathVariable Long id) {
        return productService.deleteProduct(id);
    }



}
