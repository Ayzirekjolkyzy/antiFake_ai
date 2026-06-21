package kg.manas.backend.service;

import kg.manas.backend.dto.requests.UpdateImageRequest;
import kg.manas.backend.dto.responses.ImageResponse;
import kg.manas.backend.dto.responses.SimpleResponse;
import kg.manas.backend.model.Image;
import kg.manas.backend.model.Product;
import kg.manas.backend.model.VerificationRequest;
import kg.manas.backend.model.enums.ImageAngle;
import kg.manas.backend.model.enums.ImageType;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;


public interface ImageService {
    SimpleResponse updateImage(Long id,UpdateImageRequest request);
    SimpleResponse deleteImage(Long id);
    ImageResponse uploadImage(Long productId, MultipartFile file, ImageType type, ImageAngle angle);
    SimpleResponse uploadImages(
            Long productId,
            List<MultipartFile> files,
            ImageType type,
            ImageAngle angle
    );
    ImageResponse uploadImage(
            Product product,
            VerificationRequest request,
            MultipartFile file,
            ImageType type,
            ImageAngle angle);
    List<ImageResponse> getDatasetImages(Long productId);
    List<ImageResponse> getUserUploadImages(Long productId);
//    ImageResponse getMainImage(Long productId);
    Image uploadImageEntity(
            Product product,
            VerificationRequest request,
            MultipartFile file,
            ImageType type,
            ImageAngle angle
    );



}
