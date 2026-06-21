package kg.manas.backend.security.auth;

import kg.manas.backend.dto.responses.SimpleResponse;
import kg.manas.backend.security.dto.request.AuthenticationRequest;
import kg.manas.backend.security.dto.request.RefreshRequest;
import kg.manas.backend.security.dto.request.RegistrationRequest;
import kg.manas.backend.security.dto.response.AuthenticationResponse;

public interface AuthenticationService {

    AuthenticationResponse login(AuthenticationRequest request);
    SimpleResponse register(RegistrationRequest request);
    AuthenticationResponse refreshToken(RefreshRequest request);

}
