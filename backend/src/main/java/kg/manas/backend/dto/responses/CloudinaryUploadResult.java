package kg.manas.backend.dto.responses;

import lombok.Builder;

@Builder
public record CloudinaryUploadResult(

        String imageUrl,
        String publicId

) {
}