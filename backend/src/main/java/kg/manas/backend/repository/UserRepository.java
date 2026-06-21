package kg.manas.backend.repository;

import kg.manas.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmailIgnoreCase(String email);
    Optional<User> findByEmailIgnoreCase(String email);
    Optional<User> findByRole_RoleName(String roleName);
    List<User> findAllByRole_RoleName(String roleName);
}
