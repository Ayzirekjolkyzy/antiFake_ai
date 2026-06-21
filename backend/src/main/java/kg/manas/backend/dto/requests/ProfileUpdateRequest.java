package kg.manas.backend.dto.requests;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;


public record ProfileUpdateRequest (

    @NotBlank(message = "VALIDATION.PROFILE_UPDATE.USERNAME.NOT_BLANK")
    @Size(
            min=5,
            max=50,
            message = "VALIDATION.PROFILE_UPDATE.USERNAME.SIZE"
    )
    @Pattern(
            regexp = "[\\p{L} '-]+$",
            message = "VALIDATION.PROFILE_UPDATE.USERNAME.PATTERN"
    )
    @Schema(example = "Aizirek")
    String username
) {
}
