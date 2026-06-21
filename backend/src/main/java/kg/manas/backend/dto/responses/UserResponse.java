package kg.manas.backend.dto.responses;

import lombok.Builder;

import java.time.LocalDateTime;
@Builder
public record UserResponse (
        Long userId,
        String username,
        String email,
        boolean blocked,
        boolean isEmailVerified,
        LocalDateTime createdAt,
        LocalDateTime  updatedAt
) {
}
