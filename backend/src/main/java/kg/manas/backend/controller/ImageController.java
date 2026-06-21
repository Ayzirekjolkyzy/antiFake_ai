package kg.manas.backend.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import kg.manas.backend.dto.requests.UpdateImageRequest;
import kg.manas.backend.dto.responses.ImageResponse;
import kg.manas.backend.dto.responses.SimpleResponse;
import kg.manas.backend.model.enums.ImageAngle;
import kg.manas.backend.model.enums.ImageType;
import kg.manas.backend.service.ImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/images")
@RequiredArgsConstructor
@Tag(name="Image", description = "Image api")
public class ImageController {
    private final ImageService imageService;

//    @PreAuthorize("hasRole('ADMIN')")
//    @PostMapping(value="/dataset/{productId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
//     public ImageResponse uploadDatasetImage(
//            @PathVariable Long productId,
//            @RequestParam MultipartFile file,
//            @RequestParam(value = "angle", defaultValue = "UNKNOWN")ImageAngle angle) {
//         return imageService.uploadImage(productId, file, ImageType.DATASET ,angle);
//     }
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(
            value = "/dataset/{productId}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public SimpleResponse uploadDatasetImages(
            @PathVariable Long productId,
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam(value = "angle", defaultValue = "UNKNOWN") ImageAngle angle
    ) {
        return imageService.uploadImages(
                productId,
                files,
                ImageType.DATASET,
                angle
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/dataset/{productId}")
    public List<ImageResponse> getDatasetImagesByProduct(
            @PathVariable Long productId) {
        return imageService.getDatasetImages(productId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/user-upload/{productId}")
    public List<ImageResponse> getUserUploadImagesByProduct(
            @PathVariable Long productId) {
        return imageService.getUserUploadImages(productId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/dataset/{id}")
    public SimpleResponse updateImage(
            @PathVariable Long id,
            @RequestBody UpdateImageRequest request) {
        return imageService.updateImage(id,request);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public SimpleResponse deleteImage(
            @PathVariable Long id) {
        return imageService.deleteImage(id);
    }





}
