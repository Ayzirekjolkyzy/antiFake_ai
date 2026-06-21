package kg.manas.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "brands")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)

public class Brand {

    @Id
    @Column(name = "brand_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long brandId;

    @Column(name = "brand_name", nullable = false, unique = true)
    private String brandName;

    @Column(name = "official_website")
    private String officialWebsite;

    @Column(columnDefinition = "TEXT", name = "logo_url")
    private String logoUrl;

    @Column(columnDefinition = "TEXT", name = "description")
    private String description;

    @Column(name = "is_high_risk")
    private Boolean isHighRisk;

    @ManyToOne
    @JoinColumn(name = "country_id")
    private Country country;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}