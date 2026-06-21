package kg.manas.backend.security.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import kg.manas.backend.validation.NonDisposableEmail;
import lombok.*;


@Builder
public record RegistrationRequest (

    @NotBlank(message = "VALIDATION.REGISTRATION.USERNAME.NOT_BLANK")
    @Size(
            min=5,
            max=50,
            message = "VALIDATION.REGISTRATION.USERNAME.SIZE"
    )
    @Pattern(
            regexp = "[\\p{L} '-]+$",
            message = "VALIDATION.REGISTRATION.USERNAME.PATTERN"
    )
    @Schema(example = "Aizirek")
    String username,

    @NotBlank(message = "VALIDATION.REGISTRATION.EMAIL.NOT_BLANK")
    @Email(message = "VALIDATION.REGISTRATION.EMAIL.FORMAT")
    @Schema(example = "aizirek@gmail.com")
    @NonDisposableEmail(message="VALIDATION.REGISTRATION.EMAIL.DISPOSABLE")
    String email,

    @NotBlank(message = "VALIDATION.REGISTRATION.PASSWORD.NOT_BLANK")
    @Size(
            min=8,
            max=50,
            message = "VALIDATION.REGISTRATION.PASSWORD.SIZE"
    )
    @Pattern(
            regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*\\W).*$",
            message = "VALIDATION.REGISTRATION.PASSWORD.WEAK"
    )
    @Schema(example = "<PASSWORD>")
    String password,

    @NotBlank(message = "VALIDATION.REGISTRATION.CONFIRM_PASSWORD.NOT_BLANK")
    @Size(
            min=8,
            max=50,
            message = "VALIDATION.REGISTRATION.CONFIRM_PASSWORD.SIZE"
    )

    @Schema(example = "<PASSWORD>")
    String confirmPassword
    ){
}
