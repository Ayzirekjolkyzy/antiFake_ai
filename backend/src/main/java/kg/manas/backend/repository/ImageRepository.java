package kg.manas.backend.repository;

import kg.manas.backend.model.Image;
import kg.manas.backend.model.enums.ImageType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImageRepository extends JpaRepository<Image, Long> {
    List<Image> findByProduct_ProductIdAndType(Long productId, ImageType type);
    List<Image> findByProduct_ProductId(Long productId);
//    Optional<Image> findFirstByProduct_ProductIdAndType(Long productId, ImageType type);
    List<Image> findByVerificationRequest_RequestIdOrderByCreatedAtAsc(Long requestId);

}
