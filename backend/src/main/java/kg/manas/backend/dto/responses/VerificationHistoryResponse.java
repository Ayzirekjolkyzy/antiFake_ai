package kg.manas.backend.dto.responses;

import kg.manas.backend.model.enums.DecisionStatus;
import kg.manas.backend.model.enums.RequestStatus;
import kg.manas.backend.model.enums.Verdict;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;
@Builder
public record VerificationHistoryResponse(
        Long requestId,
        Long productId,
        String productName,
        List<ImageResponse> images,
        String barcodeInput,
        RequestStatus status,
        DecisionStatus decisionStatus,
        Verdict verdict,
        Double confidenceScore,
        Double imageScore,
        Double barcodeScore,
        Boolean barcodeMatch,
        String selectedAngle,
        String detectedAngle,
        boolean angleMismatch,
        String aiMessage,
        String aiModel,
        String matchedReferencePath,
        String reason,
        String adminComment,
        LocalDateTime requestedAt,
        LocalDateTime reviewedAt
) {
}