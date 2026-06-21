package kg.manas.backend.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import kg.manas.backend.dto.requests.AdminDecisionRequest;
import kg.manas.backend.dto.responses.VerificationHistoryResponse;
import kg.manas.backend.model.enums.ImageAngle;
import kg.manas.backend.security.user.PersonDetails;
import kg.manas.backend.service.VerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/verifications")
@RequiredArgsConstructor
@Tag(name = "Verification", description = "Verification api")
public class VerificationController {

    private final VerificationService verificationService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/history/{userId}")
    public List<VerificationHistoryResponse> getUserHistory(
            @PathVariable Long userId) {
        return verificationService.getUserHistory(userId);
    }

//    @PostMapping(value = "/verify",
//            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
//    @PreAuthorize("hasRole('USER')")
//    public VerificationHistoryResponse verifyProduct(
//            @RequestParam Long productId,
//            @RequestParam(required = false) String barcodeInput,
//
//            @RequestPart MultipartFile frontImage,
//            @RequestPart(required = false) MultipartFile backImage,
//            @RequestPart(required = false) MultipartFile boxFrontImage,
//            @RequestPart(required = false) MultipartFile boxBackImage,
//            @RequestPart(required = false) MultipartFile sideImage,
//
//            final Authentication principal
//    ) {
//        return verificationService.verifyProduct(
//                getUserId(principal),
//                productId,
//                barcodeInput,
//                frontImage,
//                backImage,
//                boxFrontImage,
//                boxBackImage,
//                sideImage
//        );
//    }
@PostMapping(value = "/verify", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
@PreAuthorize("hasRole('USER')")
public VerificationHistoryResponse verifyProduct(
        @RequestParam Long productId,
        @RequestParam ImageAngle imageAngle,
        @RequestParam(required = false) String barcodeInput,
        @RequestPart MultipartFile image,
        final Authentication principal
) {
    return verificationService.verifyProduct(
            getUserId(principal),
            productId,
            imageAngle,
            barcodeInput,
            image
    );
}

    @GetMapping("/my-history")
    @PreAuthorize("hasRole('USER')")
    public List<VerificationHistoryResponse> getMyHistory(
            final Authentication principal) {
        return verificationService.getMyHistory(getUserId(principal));
    }

    @GetMapping("/admin/review")
    @PreAuthorize("hasRole('ADMIN')")
    public List<VerificationHistoryResponse> getReviewQueue() {
        return verificationService.getReviewQueue();
    }

    @PatchMapping("/admin/{requestId}/confirm-original")
    @PreAuthorize("hasRole('ADMIN')")
    public VerificationHistoryResponse confirmOriginal(
            @PathVariable Long requestId,
            @RequestBody(required = false) @Valid AdminDecisionRequest request
    ) {
        return verificationService.confirmOriginal(
                requestId,
                request != null ? request.adminComment() : null
        );
    }

    @PatchMapping("/admin/{requestId}/confirm-fake")
    @PreAuthorize("hasRole('ADMIN')")
    public VerificationHistoryResponse confirmFake(
            @PathVariable Long requestId,
            @RequestBody(required = false) @Valid AdminDecisionRequest request
    ) {
        return verificationService.confirmFake(
                requestId,
                request != null ? request.adminComment() : null
        );
    }

    @PatchMapping("/admin/{requestId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public VerificationHistoryResponse reject(
            @PathVariable Long requestId,
            @RequestBody(required = false) @Valid AdminDecisionRequest request
    ) {
        return verificationService.reject(
                requestId,
                request != null ? request.adminComment() : null
        );
    }
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public List<VerificationHistoryResponse> getAllRequests() {
        return verificationService.getAllRequests();
    }

    private Long getUserId(final Authentication principal) {
        return ((PersonDetails) principal.getPrincipal()).getUser().getUserId();
    }
}
