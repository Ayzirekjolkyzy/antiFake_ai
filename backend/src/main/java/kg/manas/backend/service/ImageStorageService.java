package kg.manas.backend.service;

import kg.manas.backend.dto.responses.CloudinaryUploadResult;
import kg.manas.backend.model.enums.ImageType;
import org.springframework.web.multipart.MultipartFile;

public interface ImageStorageService {

    CloudinaryUploadResult uploadFile(
            MultipartFile file,
            Long productId,
            ImageType type
    );

    void deleteFile(String publicId);
}