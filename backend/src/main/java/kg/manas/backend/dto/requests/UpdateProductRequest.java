package kg.manas.backend.dto.requests;


public record UpdateProductRequest(
        String productName,
        String barcode,
        String description,
        Long brand_id,
        Long countryId
) {
}