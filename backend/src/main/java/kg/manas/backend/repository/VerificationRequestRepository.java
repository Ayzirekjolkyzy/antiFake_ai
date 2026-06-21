package kg.manas.backend.repository;

import kg.manas.backend.model.VerificationRequest;
import kg.manas.backend.model.enums.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VerificationRequestRepository extends JpaRepository<VerificationRequest, Long> {
    List<VerificationRequest> findByUser_UserIdOrderByCreatedAtDesc(Long userId);
    List<VerificationRequest> findByStatusOrderByCreatedAtDesc(RequestStatus status);
    List<VerificationRequest> findAllByOrderByCreatedAtDesc();
}
