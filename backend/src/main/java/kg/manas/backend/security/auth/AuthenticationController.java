package kg.manas.backend.security.auth;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import kg.manas.backend.dto.responses.SimpleResponse;
import kg.manas.backend.security.dto.request.AuthenticationRequest;
import kg.manas.backend.security.dto.request.RefreshRequest;
import kg.manas.backend.security.dto.request.RegistrationRequest;
import kg.manas.backend.security.dto.response.AuthenticationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication API")
public class AuthenticationController {
    private final AuthenticationService authenticationService;

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(
            @Valid
            @RequestBody
            final AuthenticationRequest request
    ) {
        return ResponseEntity.ok(this.authenticationService.login(request));
    }

    @PostMapping("/register")
    public SimpleResponse register(
            @Valid
            @RequestBody
            final RegistrationRequest request
    ) {
        return authenticationService.register(request);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthenticationResponse> refresh (
            @RequestBody
            final RefreshRequest request
    ) {
        return ResponseEntity.ok(this.authenticationService.refreshToken(request));
    }
}
