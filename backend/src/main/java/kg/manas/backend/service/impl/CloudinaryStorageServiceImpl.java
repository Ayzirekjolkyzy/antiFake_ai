package kg.manas.backend.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import kg.manas.backend.dto.responses.CloudinaryUploadResult;
import kg.manas.backend.model.enums.ImageType;
import kg.manas.backend.service.ImageStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryStorageServiceImpl implements ImageStorageService {

    private final Cloudinary cloudinary;

    private static final long MAX_FILE_SIZE = 10_000_000;

    private static final List<String> ALLOWED_TYPES = List.of(
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/webp"
    );

    @Override
    public CloudinaryUploadResult uploadFile(
            MultipartFile file,
            Long productId,
            ImageType type
    ) {

        validateFile(file);

        try {

            String folder = buildFolder(productId, type);

            String fileName =
                    UUID.randomUUID() +
                            "_" +
                            file.getOriginalFilename();

            Map<?, ?> result =
                    cloudinary.uploader().upload(
                            file.getBytes(),
                            ObjectUtils.asMap(
                                    "folder", folder,
                                    "public_id", fileName,
                                    "resource_type", "image"
                            )
                    );

            String imageUrl =
                    result.get("secure_url").toString();

            String publicId =
                    result.get("public_id").toString();

            log.info("Uploaded image: {}", publicId);

            return CloudinaryUploadResult.builder()
                    .imageUrl(imageUrl)
                    .publicId(publicId)
                    .build();

        } catch (IOException e) {

            log.error("Cloudinary upload failed", e);

            throw new RuntimeException(
                    "Cloudinary upload failed"
            );
        }
    }

    @Override
    public void deleteFile(String publicId) {

        try {

            cloudinary.uploader().destroy(
                    publicId,
                    ObjectUtils.emptyMap()
            );

            log.info("Deleted image: {}", publicId);

        } catch (IOException e) {

            log.error("Cloudinary delete failed", e);

            throw new RuntimeException(
                    "Cloudinary delete failed"
            );
        }
    }

    private String buildFolder(
            Long productId,
            ImageType type
    ) {

        if (type == null) {
            return "products/main/" + productId;
        }

        return switch (type) {

            case DATASET ->
                    "products/dataset/" + productId;

            case USER_UPLOAD ->
                    "products/user_upload/" + productId;
        };

    }

//    private void validateFile(MultipartFile file) {
//
//        if (file.isEmpty()) {
//            throw new RuntimeException("File is empty");
//        }
//
//        if (file.getSize() > MAX_FILE_SIZE) {
//            throw new RuntimeException("File too large");
//        }
//
//        if (!ALLOWED_TYPES.contains(file.getContentType())) {
//            throw new RuntimeException("Invalid file type");
//        }
//    }
private void validateFile(MultipartFile file) {

    if (file == null || file.isEmpty()) {
        throw new RuntimeException("File is empty");
    }

    String fileName = file.getOriginalFilename();

    if (fileName == null) {
        throw new RuntimeException("File name is missing");
    }

    String lowerName = fileName.toLowerCase();

    boolean validExtension =
            lowerName.endsWith(".jpg") ||
                    lowerName.endsWith(".jpeg") ||
                    lowerName.endsWith(".png") ||
                    lowerName.endsWith(".webp");

    if (!validExtension) {
        throw new RuntimeException("Invalid file extension");
    }
}
}