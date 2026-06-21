package kg.manas.backend.security.auth;

import jakarta.transaction.Transactional;
import kg.manas.backend.dto.responses.SimpleResponse;
import kg.manas.backend.exceptions.BusinessException;
import kg.manas.backend.exceptions.ErrorCode;
import kg.manas.backend.model.Role;
import kg.manas.backend.model.User;
import kg.manas.backend.repository.RoleRepository;
import kg.manas.backend.repository.UserRepository;
import kg.manas.backend.security.dto.request.AuthenticationRequest;
import kg.manas.backend.security.dto.request.RefreshRequest;
import kg.manas.backend.security.dto.request.RegistrationRequest;
import kg.manas.backend.security.dto.response.AuthenticationResponse;
import kg.manas.backend.security.jwt.JwtService;
import kg.manas.backend.security.user.PersonDetails;
import kg.manas.backend.security.user.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationServiceImpl implements AuthenticationService{

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;


    @Override
    public AuthenticationResponse login(AuthenticationRequest request) {
        final Authentication auth = this.authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()
                )
        );

        final PersonDetails user = (PersonDetails) auth.getPrincipal();
        final String token = this.jwtService.generateAccessToken(user.getUser());
        final String refreshToken = this.jwtService.generateRefreshToken(user.getUser());
        final String tokenType = "Bearer";
        log.info("User {} successfully logged in", request.email());
        return AuthenticationResponse.builder()
                .accessToken(token)
                .refreshToken(refreshToken)
                .tokenType(tokenType)
                .build();
    }


    @Transactional
    @Override
    public SimpleResponse register(RegistrationRequest request) {
        checkUserEmail(request.email());
        checkPasswords(request.password(), request.confirmPassword());

        final Role userRole = this.roleRepository.findByRoleName("ROLE_USER")
                .orElseThrow(() -> new BusinessException(ErrorCode.ROLE_NOT_FOUND));

        final User user = this.userMapper.toUser(request);
        user.setRole(userRole);
        log.info("Registering user with email={}", request.email());
        this.userRepository.save(user);

        return SimpleResponse.builder()
                .httpStatus(HttpStatus.CREATED)
                .message("User successfully registered!")
                .build();
        
    }

    @Override
    public AuthenticationResponse refreshToken(RefreshRequest request) {
        final String newAccessToken = this.jwtService.refreshAccessToken(request.refreshToken());
        final String tokenType = "Bearer";

        return AuthenticationResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(request.refreshToken())
                .tokenType(tokenType)
                .build();
    }

    private void checkUserEmail(final String email) {
        final boolean emailExists = this.userRepository.existsByEmailIgnoreCase(email);
        if(emailExists) {
            throw new BusinessException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
    }

    private void checkPasswords(final String password, final String confirmPassword) {
        if(password==null||!password.equals(confirmPassword)) {
            throw new BusinessException(ErrorCode.PASSWORD_MISMATCH);
        }
    }
}
