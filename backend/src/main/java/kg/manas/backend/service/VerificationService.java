package kg.manas.backend.service;

import kg.manas.backend.dto.responses.VerificationHistoryResponse;
import kg.manas.backend.model.enums.ImageAngle;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface VerificationService {
    List<VerificationHistoryResponse> getUserHistory(Long userId);

    VerificationHistoryResponse verifyProduct(
            Long userId,
            Long productId,
            ImageAngle imageAngle,
            String barcodeInput,
            MultipartFile image
    );

    List<VerificationHistoryResponse> getMyHistory(Long userId);

    List<VerificationHistoryResponse> getReviewQueue();

    VerificationHistoryResponse confirmOriginal(Long requestId, String adminComment);

    VerificationHistoryResponse confirmFake(Long requestId, String adminComment);

    VerificationHistoryResponse reject(Long requestId, String adminComment);
    List<VerificationHistoryResponse> getAllRequests();
}
