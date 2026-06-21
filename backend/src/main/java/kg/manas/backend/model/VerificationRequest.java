package kg.manas.backend.model;

import jakarta.persistence.*;
import kg.manas.backend.model.enums.RequestStatus;
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
@Table(name="verification_requests")
@EntityListeners(AuditingEntityListener.class)
public class VerificationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private Long requestId;

    @ManyToOne
    @JoinColumn(name="user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

//    @ManyToOne
//    @JoinColumn(name = "image_id")
//    private Image userImage;

    @Column(name = "barcode_input")
    private String barcodeInput;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private RequestStatus status;

    @CreatedDate
    @Column(name="created_at", updatable = false)
    private LocalDateTime createdAt;




}
