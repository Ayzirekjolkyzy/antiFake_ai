package kg.manas.backend.model;

import jakarta.persistence.*;
import kg.manas.backend.model.enums.DecisionStatus;
import kg.manas.backend.model.enums.Verdict;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name="verification_results")
@EntityListeners(AuditingEntityListener.class)
public class VerificationResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="result_id")
    private Long resultId;

    @OneToOne
    @JoinColumn(name="request_id", nullable = false)
    private VerificationRequest request;

    @Enumerated(EnumType.STRING)
    @Column(name="verdict", nullable = false)
    private Verdict verdict;

    @Column(name = "confidence_score")
    private Double confidenceScore;

    @Column(name = "barcode_match")
    private Boolean barcodeMatch;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @CreatedDate
    @Column(name="created_at", updatable = false)
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "decision_status", nullable = false)
    private DecisionStatus decisionStatus;

    @Column(name = "image_score")
    private Double imageScore;

    @Column(name = "barcode_score")
    private Double barcodeScore;

    @Column(name = "model_version")
    private String modelVersion;

    @Column(name = "admin_comment", columnDefinition = "TEXT")
    private String adminComment;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "selected_angle")
    private String selectedAngle;

    @Column(name = "detected_angle")
    private String detectedAngle;

    @Column(name = "ai_message", columnDefinition = "TEXT")
    private String aiMessage;

    @Column(name = "matched_reference_path", columnDefinition = "TEXT")
    private String matchedReferencePath;

    @Column(name="angle_mismatch")
    private boolean angleMismatch;
}
