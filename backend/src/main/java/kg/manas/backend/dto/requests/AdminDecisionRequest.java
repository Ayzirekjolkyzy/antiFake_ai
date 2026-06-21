package kg.manas.backend.dto.requests;

import jakarta.validation.constraints.Size;

public record AdminDecisionRequest(
        @Size(max = 1000)
        String adminComment
) {
}