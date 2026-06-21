package kg.manas.backend.service.impl;

import jakarta.transaction.Transactional;
import kg.manas.backend.dto.requests.UpdateImageRequest;
import kg.manas.backend.dto.responses.CloudinaryUploadResult;
import kg.manas.backend.dto.responses.ImageResponse;
import kg.manas.backend.dto.responses.SimpleResponse;
import kg.manas.backend.exceptions.BusinessException;
import kg.manas.backend.exceptions.ErrorCode;
import kg.manas.backend.model.Image;
import kg.manas.backend.model.Product;
import kg.manas.backend.model.VerificationRequest;
import kg.manas.backend.model.enums.ImageAngle;
import kg.manas.backend.model.enums.ImageType;
import kg.manas.backend.repository.ImageRepository;
import kg.manas.backend.repository.ProductRepository;
import kg.manas.backend.service.ImageService;
import kg.manas.backend.service.ImageStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImageServiceImpl implements ImageService {

    private final ProductRepository productRepository;
    private final ImageRepository imageRepository;
    private final ImageStorageService imageStorageService;

    @Override
    public SimpleResponse updateImage(
            Long id,
            UpdateImageRequest request
    ) {

        Image image = imageRepository.findById(id)
                .orElseThrow(() ->
                        new BusinessException(
                                ErrorCode.IMAGE_NOT_FOUND
                        ));

        if (
                request.productId() != null &&
                        !request.productId().equals(
                                image.getProduct().getProductId()
                        )
        ) {

            Product newProduct =
                    productRepository.findById(
                                    request.productId()
                            )
                            .orElseThrow(() ->
                                    new BusinessException(
                                            ErrorCode.PRODUCT_NOT_FOUND
                                    ));

            image.setProduct(newProduct);
        }

        if (request.angle() != null) {
            image.setAngle(request.angle());
        }

        imageRepository.save(image);

        return SimpleResponse.builder()
                .httpStatus(HttpStatus.OK)
                .message(
                        "Image with id = " + image.getImageId() +
                                " was successfully updated for product with id = " +
                                image.getProduct().getProductId()
                )
                .build();
    }

    @Transactional
    @Override
    public SimpleResponse deleteImage(Long id) {

        Image image = imageRepository.findById(id)
                .orElseThrow(() ->
                        new BusinessException(
                                ErrorCode.IMAGE_NOT_FOUND
                        ));

        imageStorageService.deleteFile(
                image.getPublicId()
        );

        imageRepository.delete(image);

        return SimpleResponse.builder()
                .httpStatus(HttpStatus.OK)
                .message(
                        "Image with id = " + image.getImageId() +
                                " was successfully deleted from product with id = " +
                                image.getProduct().getProductId()
                )
                .build();
    }

    @Transactional
    @Override
    public ImageResponse uploadImage(
            Long productId,
            MultipartFile file,
            ImageType type,
            ImageAngle angle
    ) {

        if (productId == null) {
            throw new BusinessException(
                    ErrorCode.PRODUCT_REQUIRED
            );
        }

        if (file == null || file.isEmpty()) {
            throw new BusinessException(
                    ErrorCode.FILE_REQUIRED
            );
        }

        if (type == null) {
            throw new BusinessException(
                    ErrorCode.TYPE_REQUIRED
            );
        }

        Product product =
                productRepository.findById(productId)
                        .orElseThrow(() ->
                                new BusinessException(
                                        ErrorCode.PRODUCT_NOT_FOUND
                                ));



        CloudinaryUploadResult uploadResult =
                imageStorageService.uploadFile(
                        file,
                        productId,
                        type
                );

        Image image = Image.builder()
                .product(product)
                .imageUrl(uploadResult.imageUrl())
                .publicId(uploadResult.publicId())
                .type(type)
                .angle(
                        angle != null
                                ? angle
                                : ImageAngle.UNKNOWN
                )
                .build();

        imageRepository.save(image);

        log.info(
                "Uploaded image with id = {} for product with id = {} and type = {}",
                image.getImageId(),
                productId,
                type
        );

        return mapToResponse(image);
    }

    @Override
    public SimpleResponse uploadImages(Long productId, List<MultipartFile> files, ImageType type, ImageAngle angle) {
        if (files == null || files.isEmpty()) {
            throw new BusinessException(
                    ErrorCode.FILE_REQUIRED
            );
        }

        files.forEach(file ->
                uploadImage(
                        productId,
                        file,
                        type,
                        angle
                )
        );
        log.info(
                "Uploaded {} images for product with id = {}",
                files.size(),
                productId
        );
        return SimpleResponse.builder()
                .httpStatus(HttpStatus.OK)
                .message(
                        "Successfully uploaded " + files.size() +
                                " images for product with id = " + productId
                )
                .build();
    }

    @Override
    @Transactional
    public ImageResponse uploadImage(
            Product product,
            VerificationRequest request,
            MultipartFile file,
            ImageType type,
            ImageAngle angle
    ) {

        if (product == null) {
            throw new BusinessException(
                    ErrorCode.PRODUCT_REQUIRED
            );
        }

        if (request == null) {
            throw new BusinessException(
                    ErrorCode.VERIFICATION_REQUEST_NOT_FOUND
            );
        }

        if (file == null || file.isEmpty()) {
            throw new BusinessException(
                    ErrorCode.FILE_REQUIRED
            );
        }

        CloudinaryUploadResult uploadResult =
                imageStorageService.uploadFile(
                        file,
                        product.getProductId(),
                        type
                );

        Image image = Image.builder()
                .product(product)
                .verificationRequest(request)
                .imageUrl(uploadResult.imageUrl())
                .publicId(uploadResult.publicId())
                .type(type)
                .angle(
                        angle != null
                                ? angle
                                : ImageAngle.UNKNOWN
                )
                .build();

        imageRepository.save(image);

        return mapToResponse(image);
    }

//    private void deleteOldMainImages(Long productId) {
//
//        imageRepository
//                .findByProduct_ProductIdAndType(
//                        productId,
//                        ImageType.MAIN
//                )
//                .forEach(image -> {
//
//                    imageStorageService.deleteFile(
//                            image.getPublicId()
//                    );
//
//                    imageRepository.delete(image);
//                });
//    }

    @Override
    public List<ImageResponse> getDatasetImages(
            Long productId
    ) {

        return imageRepository
                .findByProduct_ProductIdAndType(
                        productId,
                        ImageType.DATASET
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<ImageResponse> getUserUploadImages(
            Long productId
    ) {

        return imageRepository
                .findByProduct_ProductIdAndType(
                        productId,
                        ImageType.USER_UPLOAD
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public Image uploadImageEntity(
            Product product,
            VerificationRequest request,
            MultipartFile file,
            ImageType type,
            ImageAngle angle
    ) {
        if (product == null) {
            throw new BusinessException(ErrorCode.PRODUCT_REQUIRED);
        }

        if (request == null) {
            throw new BusinessException(ErrorCode.VERIFICATION_REQUEST_NOT_FOUND);
        }

        if (file == null || file.isEmpty()) {
            throw new BusinessException(ErrorCode.FILE_REQUIRED);
        }

        if (type == null) {
            throw new BusinessException(ErrorCode.TYPE_REQUIRED);
        }

        CloudinaryUploadResult uploadResult =
                imageStorageService.uploadFile(
                        file,
                        product.getProductId(),
                        type
                );

        Image image = Image.builder()
                .product(product)
                .verificationRequest(request)
                .imageUrl(uploadResult.imageUrl())
                .publicId(uploadResult.publicId())
                .type(type)
                .angle(angle != null ? angle : ImageAngle.UNKNOWN)
                .build();

        return imageRepository.save(image);
    }

//    @Override
//    public ImageResponse getMainImage(Long productId) {
//
//        Image image =
//                imageRepository
//                        .findFirstByProduct_ProductIdAndType(
//                                productId,
//                                ImageType.MAIN
//                        )
//                        .orElseThrow(() ->
//                                new BusinessException(
//                                        ErrorCode.IMAGE_NOT_FOUND
//                                ));
//
//        return mapToResponse(image);
//    }

    private ImageResponse mapToResponse(Image image) {

        return ImageResponse.builder()
                .imageId(image.getImageId())
                .productId(image.getProduct().getProductId())
                .productName(image.getProduct().getProductName())
                .brandName(image.getProduct().getBrand().getBrandName())
                .barcode(image.getProduct().getBarcode())
                .imageUrl(image.getImageUrl())
                .publicId(image.getPublicId())
                .type(image.getType())
                .angle(image.getAngle())
                .createdAt(image.getCreatedAt())
                .updatedAt(image.getUpdatedAt())
                .build();
    }
}