package kg.manas.backend.security.user;

import kg.manas.backend.dto.requests.ProfileUpdateRequest;
import kg.manas.backend.model.User;
import kg.manas.backend.security.dto.request.RegistrationRequest;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserMapper {

    private final PasswordEncoder passwordEncoder;

    public void mergeUserInfo(final User user, final ProfileUpdateRequest request) {
        if(StringUtils.isNoneBlank(request.username())&&!user.getUsername().equals(request.username())) {
            user.setUsername(request.username());
        }
    }

    public User toUser(final RegistrationRequest request) {
        return User.builder()
                .username(request.username())
                .email(request.email())
                .password(this.passwordEncoder.encode(request.password()))
//                .enabled(true)
                .blocked(false)
//                .expired(false)
                .isEmailVerified(false)
                .build();
    }
}
