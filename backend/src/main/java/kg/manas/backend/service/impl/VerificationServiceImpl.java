package kg.manas.backend.service.impl;

import jakarta.transaction.Transactional;
import kg.manas.backend.dto.responses.ImageResponse;
import kg.manas.backend.dto.responses.VerificationHistoryResponse;
import kg.manas.backend.exceptions.BusinessException;
import kg.manas.backend.exceptions.ErrorCode;
import kg.manas.backend.model.Image;
import kg.manas.backend.model.Product;
import kg.manas.backend.model.User;
import kg.manas.backend.model.VerificationRequest;
import kg.manas.backend.model.VerificationResult;
import kg.manas.backend.model.enums.DecisionStatus;
import kg.manas.backend.model.enums.ImageAngle;
import kg.manas.backend.model.enums.ImageType;
import kg.manas.backend.model.enums.RequestStatus;
import kg.manas.backend.model.enums.Verdict;
import kg.manas.backend.repository.ImageRepository;
import kg.manas.backend.repository.ProductRepository;
import kg.manas.backend.repository.UserRepository;
import kg.manas.backend.repository.VerificationRequestRepository;
import kg.manas.backend.repository.VerificationResultRepository;
import kg.manas.backend.service.AiVerificationClient;
import kg.manas.backend.service.ImageService;
import kg.manas.backend.service.ImageStorageService;
import kg.manas.backend.service.VerificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import kg.manas.backend.dto.responses.AiVerifyResponse;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class VerificationServiceImpl implements VerificationService {

    private final VerificationRequestRepository requestRepository;
    private final VerificationResultRepository resultRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ImageRepository imageRepository;
    private final ImageStorageService imageStorageService;
    private final ImageService imageService;
    private final AiVerificationClient aiVerificationClient;


    @Override
    public List<VerificationHistoryResponse> getUserHistory(Long userId) {
        log.info(
                "Fetching verification history for user with id = {}",
                userId
        );
        return requestRepository
                .findByUser_UserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToHistory)
                .toList();
    }

//    @Transactional
//    @Override
//    public VerificationHistoryResponse verifyProduct(
//            Long userId,
//            Long productId,
//            String barcodeInput,
//            MultipartFile frontImage,
//            MultipartFile backImage
//    ) {
//        if (userId == null) {
//            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
//        }
//        if (productId == null) {
//            throw new BusinessException(ErrorCode.PRODUCT_REQUIRED);
//        }
//        if (frontImage == null || frontImage.isEmpty()) {
//            throw new BusinessException(ErrorCode.FILE_REQUIRED);
//        }
//
//        User user = userRepository.findById(userId)
//                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
//
//        Product product = productRepository.findById(productId)
//                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));
//
//        Image userImage = uploadUserImage(product, frontImage, ImageAngle.FRONT);
//
//        VerificationRequest request = VerificationRequest.builder()
//                .user(user)
//                .product(product)
//                .userImage(userImage)
//                .barcodeInput(normalize(barcodeInput))
//                .status(RequestStatus.PENDING)
//                .build();
//        requestRepository.save(request);
//
//        Boolean barcodeMatch = calculateBarcodeMatch(product.getBarcode(), barcodeInput);
//        VerificationResult result = VerificationResult.builder()
//                .request(request)
//                .verdict(Verdict.UNKNOWN)
//                .confidenceScore(0.0)
//                .barcodeMatch(barcodeMatch)
//                .reason(buildInitialReason(barcodeMatch))
//                .decisionStatus(DecisionStatus.NEEDS_REVIEW)
//                .imageScore(0.0)
//                .barcodeScore(Boolean.TRUE.equals(barcodeMatch) ? 1.0 : 0.0)
//                .modelVersion("manual-review-v1")
//                .build();
//        resultRepository.save(result);
//
//        if (backImage != null && !backImage.isEmpty()) {
//            uploadUserImage(product, backImage, ImageAngle.BACK);
//        }
//
//        log.info("Created verification request id={} for userId={} productId={}", request.getRequestId(), userId, productId);
//        return mapToHistory(request);
//    }

//    @Transactional
//    @Override
//    public VerificationHistoryResponse verifyProduct(
//            Long userId,
//            Long productId,
//            String barcodeInput,
//            MultipartFile frontImage,
//            MultipartFile backImage,
//            MultipartFile boxFrontImage,
//            MultipartFile boxBackImage,
//            MultipartFile sideImage
//    ) {
//        if (userId == null) {
//            throw new BusinessException(ErrorCode.USER_REQUIRED);
//        }
//        if (productId == null) {
//            throw new BusinessException(ErrorCode.PRODUCT_REQUIRED);
//        }
//        if (frontImage == null || frontImage.isEmpty()) {
//            throw new BusinessException(ErrorCode.FILE_REQUIRED);
//        }
//
//        User user = userRepository.findById(userId)
//                .orElseThrow(() ->
//                        new BusinessException(ErrorCode.USER_NOT_FOUND));
//
//        Product product = productRepository.findById(productId)
//                .orElseThrow(() ->
//                        new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));
//
//        VerificationRequest request = VerificationRequest.builder()
//                .user(user)
//                .product(product)
//                .barcodeInput(normalize(barcodeInput))
//                .status(RequestStatus.PENDING)
//                .build();
//
//        requestRepository.save(request);
//
//        uploadIfPresent(product, request, frontImage, ImageAngle.FRONT);
//        uploadIfPresent(product, request, backImage, ImageAngle.BACK);
//        uploadIfPresent(product, request, boxFrontImage, ImageAngle.BOX_FRONT);
//        uploadIfPresent(product, request, boxBackImage, ImageAngle.BOX_BACK);
//        uploadIfPresent(product, request, sideImage, ImageAngle.SIDE);
//
//        Boolean barcodeMatch =
//                calculateBarcodeMatch(
//                        product.getBarcode(),
//                        barcodeInput
//                );
//
//        VerificationResult result =
//                VerificationResult.builder()
//                        .request(request)
//                        .verdict(Verdict.UNKNOWN)
//                        .confidenceScore(0.0)
//                        .barcodeMatch(barcodeMatch)
//                        .reason(buildInitialReason(barcodeMatch))
//                        .decisionStatus(DecisionStatus.NEEDS_REVIEW)
//                        .imageScore(0.0)
//                        .barcodeScore(
//                                Boolean.TRUE.equals(barcodeMatch)
//                                        ? 1.0
//                                        : 0.0
//                        )
//                        .modelVersion("manual-review-v1")
//                        .build();
//
//        resultRepository.save(result);
//        log.info(
//                "Created verification request with id = {} for user with id = {} and product with id = {}",
//                request.getRequestId(),
//                userId,
//                productId
//        );
//        return mapToHistory(request);
//    }

    @Transactional
    @Override
    public VerificationHistoryResponse verifyProduct(
            Long userId,
            Long productId,
            ImageAngle imageAngle,
            String barcodeInput,
            MultipartFile image
    ) {
        if (userId == null) {
            throw new BusinessException(ErrorCode.USER_REQUIRED);
        }

        if (productId == null) {
            throw new BusinessException(ErrorCode.PRODUCT_REQUIRED);
        }

        if (imageAngle == null) {
            throw new BusinessException(ErrorCode.TYPE_REQUIRED);
        }

        if (image == null || image.isEmpty()) {
            throw new BusinessException(ErrorCode.FILE_REQUIRED);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));

        VerificationRequest request = VerificationRequest.builder()
                .user(user)
                .product(product)
                .barcodeInput(normalize(barcodeInput))
                .status(RequestStatus.PENDING)
                .build();

        requestRepository.save(request);

        Image uploadedImage = uploadUserImage(
                product,
                request,
                image,
                imageAngle
        );

        Boolean barcodeMatch = calculateBarcodeMatch(
                product.getBarcode(),
                barcodeInput
        );

        AiVerifyResponse aiResponse = aiVerificationClient.verify(
                product.getProductId(),
                imageAngle.name(),
                uploadedImage.getImageUrl()
        );

        String finalDecision = aiResponse.decision();

        if (barcodeMatch != null && !barcodeMatch) {
            finalDecision = "NEEDS_REVIEW";
        }
        VerificationResult result = VerificationResult.builder()
                .request(request)
                .verdict(mapVerdict(finalDecision))
                .confidenceScore(aiResponse.similarity())
                .barcodeMatch(barcodeMatch)
                .reason(buildAiReason(aiResponse, barcodeMatch))
                .decisionStatus(mapDecisionStatus(finalDecision))
                .imageScore(aiResponse.similarity())
                .barcodeScore(
                        barcodeMatch == null
                                ? null
                                : Boolean.TRUE.equals(barcodeMatch) ? 1.0 : 0.0
                )
                .modelVersion(aiResponse.modelName())
                .selectedAngle(aiResponse.selectedAngle())
                .detectedAngle(aiResponse.detectedAngle())
                .aiMessage(aiResponse.message())
                .matchedReferencePath(aiResponse.matchedReferencePath())
                .build();

        resultRepository.save(result);

        return mapToHistory(request);
    }

    @Override
    public List<VerificationHistoryResponse> getMyHistory(Long userId) {
        return getUserHistory(userId);
    }

    @Override
    public List<VerificationHistoryResponse> getReviewQueue() {
        log.info("Fetching verification review queue");
        return requestRepository.findByStatusOrderByCreatedAtDesc(RequestStatus.PENDING)
                .stream()
                .map(this::mapToHistory)
                .toList();
    }

    @Transactional
    @Override
    public VerificationHistoryResponse confirmOriginal(Long requestId, String adminComment) {
        return makeAdminDecision(
                requestId,
                Verdict.ORIGINAL,
                DecisionStatus.ADMIN_CONFIRMED_ORIGINAL,
                adminComment,
                RequestStatus.COMPLETED
        );
    }

    @Transactional
    @Override
    public VerificationHistoryResponse confirmFake(Long requestId, String adminComment) {
        return makeAdminDecision(
                requestId,
                Verdict.FAKE,
                DecisionStatus.ADMIN_CONFIRMED_FAKE,
                adminComment,
                RequestStatus.COMPLETED
        );
    }

    @Transactional
    @Override
    public VerificationHistoryResponse reject(Long requestId, String adminComment) {
        return makeAdminDecision(
                requestId,
                Verdict.UNKNOWN,
                DecisionStatus.ADMIN_REJECTED,
                adminComment,
                RequestStatus.FAILED
        );
    }

    private VerificationHistoryResponse makeAdminDecision(
            Long requestId,
            Verdict verdict,
            DecisionStatus decisionStatus,
            String adminComment,
            RequestStatus requestStatus
    ) {
        VerificationRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new BusinessException(ErrorCode.VERIFICATION_REQUEST_NOT_FOUND));

        VerificationResult result = resultRepository.findByRequest_RequestId(requestId)
                .orElseGet(() -> VerificationResult.builder()
                        .request(request)
                        .confidenceScore(0.0)
                        .imageScore(0.0)
                        .barcodeScore(0.0)
                        .barcodeMatch(null)
                        .reason("Created by admin decision")
                        .modelVersion("manual-review-v1")
                        .build());

        request.setStatus(requestStatus);
        result.setVerdict(verdict);
        result.setDecisionStatus(decisionStatus);
        result.setAdminComment(normalize(adminComment));
        result.setReviewedAt(LocalDateTime.now());
        result.setConfidenceScore(1.0);

        requestRepository.save(request);
        resultRepository.save(result);

        log.info(
                "Admin reviewed verification request with id = {} and set decision status = {}",
                requestId,
                decisionStatus
        );
        return mapToHistory(request);
    }
    @Override
    public List<VerificationHistoryResponse> getAllRequests() {
        log.info("Fetching all verification requests");
        return requestRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToHistory)
                .toList();
    }

//    private Image uploadUserImage(Product product, MultipartFile file, ImageAngle angle) {
//        CloudinaryUploadResult uploadResult = imageStorageService.uploadFile(
//                file,
//                product.getProductId(),
//                ImageType.USER_UPLOAD
//        );
//
//        Image image = Image.builder()
//                .product(product)
//                .imageUrl(uploadResult.imageUrl())
//                .publicId(uploadResult.publicId())
//                .type(ImageType.USER_UPLOAD)
//                .angle(angle)
//                .build();
//
//        return imageRepository.save(image);
//    }

private Image uploadUserImage(
        Product product,
        VerificationRequest request,
        MultipartFile file,
        ImageAngle angle
) {
    return imageService.uploadImageEntity(
            product,
            request,
            file,
            ImageType.USER_UPLOAD,
            angle
    );
}

    private Boolean calculateBarcodeMatch(String productBarcode, String barcodeInput) {
        if (barcodeInput == null || barcodeInput.isBlank()) {
            return null;
        }
        return barcodeInput.trim().equals(productBarcode);
    }

    private String buildInitialReason(Boolean barcodeMatch) {
        if (barcodeMatch == null) {
            return "Штрих-код не был предоставлен. Запрос требует проверки администратором.";
        }
        if (barcodeMatch) {
            return "Штрих-код соответствует выбранному продукту. Изображение всё равно требует проверки администратором.";
        }
        return "Штрих-код не соответствует выбранному продукту. Запрос требует проверки администратором.";
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private VerificationHistoryResponse mapToHistory(VerificationRequest request) {
        VerificationResult result = resultRepository
                .findByRequest_RequestId(request.getRequestId())
                .orElse(null);
        List<ImageResponse> images = imageRepository
                .findByVerificationRequest_RequestIdOrderByCreatedAtAsc(
                        request.getRequestId()
                )
                .stream()
                .map(this::mapImageToResponse)
                .toList();

        return VerificationHistoryResponse.builder()
                .requestId(request.getRequestId())
                .productId(request.getProduct().getProductId())
                .productName(request.getProduct().getProductName())
                .images(images)
                .barcodeInput(request.getBarcodeInput())
                .status(request.getStatus())
                .decisionStatus(result != null ? result.getDecisionStatus() : null)
                .verdict(result != null ? result.getVerdict() : null)
                .confidenceScore(result != null ? result.getConfidenceScore() : null)
                .imageScore(result != null ? result.getImageScore() : null)
                .barcodeScore(result != null ? result.getBarcodeScore() : null)
                .barcodeMatch(result != null ? result.getBarcodeMatch() : null)
                .reason(result != null ? result.getReason() : null)
                .adminComment(result != null ? result.getAdminComment() : null)
                .requestedAt(request.getCreatedAt())
                .reviewedAt(result != null ? result.getReviewedAt() : null)
                .selectedAngle(result != null ? result.getSelectedAngle() : null)
                .detectedAngle(result != null ? result.getDetectedAngle() : null)
                .aiMessage(result != null ? result.getAiMessage() : null)
                .aiModel(result != null ? result.getModelVersion() : null)
                .matchedReferencePath(result != null ? result.getMatchedReferencePath() : null)
                .build();
    }
    private ImageResponse mapImageToResponse(Image image) {

        return ImageResponse.builder()
                .imageId(image.getImageId())
                .productId(image.getProduct().getProductId())
                .imageUrl(image.getImageUrl())
                .publicId(image.getPublicId())
                .type(image.getType())
                .angle(image.getAngle())
                .createdAt(image.getCreatedAt())
                .updatedAt(image.getUpdatedAt())
                .build();
    }
        private DecisionStatus mapDecisionStatus(String aiDecision) {
            if (aiDecision == null) {
                return DecisionStatus.NEEDS_REVIEW;
            }

            return switch (aiDecision) {
                case "AUTO_ORIGINAL" -> DecisionStatus.AUTO_ORIGINAL;
                case "AUTO_FAKE" -> DecisionStatus.AUTO_FAKE;
                case "NEEDS_REVIEW", "WRONG_ANGLE" -> DecisionStatus.NEEDS_REVIEW;
                default -> DecisionStatus.NEEDS_REVIEW;
            };
        }

        private Verdict mapVerdict(String aiDecision) {
            if (aiDecision == null) {
                return Verdict.UNKNOWN;
            }

            return switch (aiDecision) {
                case "AUTO_ORIGINAL" -> Verdict.ORIGINAL;
                case "AUTO_FAKE" -> Verdict.FAKE;
                default -> Verdict.UNKNOWN;
            };
        }

    private String buildAiReason(
            AiVerifyResponse aiResponse,
            Boolean barcodeMatch
    ) {

        StringBuilder reason = new StringBuilder();

        reason.append(aiResponse.message());

//        if (
//                aiResponse.selectedAngle() != null
//                        && aiResponse.detectedAngle() != null
//                        && !aiResponse.selectedAngle()
//                        .equalsIgnoreCase(aiResponse.detectedAngle())
//        ) {
        if (Boolean.TRUE.equals(aiResponse.angleMismatch()))
        {

            reason.append(" ");

            reason.append(
                            "Выбран ракурс ")
                    .append(aiResponse.selectedAngle())
                    .append(", однако AI определил ")
                    .append(aiResponse.detectedAngle())
                    .append(". Результат может быть неточным.");
        }

        if (barcodeMatch == null) {

            reason.append(" Штрих-код не был предоставлен.");

        } else if (barcodeMatch) {

            reason.append(" Штрих-код соответствует выбранному продукту.");

        } else {

            reason.append(" Штрих-код не соответствует выбранному продукту.");
        }

        reason.append(
                " Окончательное решение принимает администратор."
        );

        return reason.toString();
    }
}
