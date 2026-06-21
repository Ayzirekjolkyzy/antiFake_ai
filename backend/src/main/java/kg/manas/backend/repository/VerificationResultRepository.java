package kg.manas.backend.repository;

import kg.manas.backend.model.VerificationResult;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.Optional;

public interface VerificationResultRepository extends JpaRepository<VerificationResult, Long> {
    Optional<VerificationResult> findByRequest_RequestId(Long requestId);
}
