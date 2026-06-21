package kg.manas.backend.service.impl;

import kg.manas.backend.dto.requests.ChangePasswordRequest;
import kg.manas.backend.dto.requests.ProfileUpdateRequest;
import kg.manas.backend.dto.responses.SimpleResponse;
import kg.manas.backend.dto.responses.UserResponse;
import kg.manas.backend.exceptions.BusinessException;
import kg.manas.backend.exceptions.ErrorCode;
import kg.manas.backend.model.User;
import kg.manas.backend.repository.UserRepository;
import kg.manas.backend.security.user.UserMapper;
import kg.manas.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    @Override
    public SimpleResponse updateProfileInfo(ProfileUpdateRequest request, Long userId) {
        final User savedUser = this.userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, userId));

        this.userMapper.mergeUserInfo(savedUser, request);
        this.userRepository.save(savedUser);
        log.info("Updated user with id={}", userId);
        return SimpleResponse.builder()
                .httpStatus(HttpStatus.OK)
                .message(
                        "User profile with id = " + savedUser.getUserId() +
                                " was successfully updated"
                )
                .build();
    }

    @Override
    public SimpleResponse changePassword(final ChangePasswordRequest request, final Long userId) {
        if(!request.newPassword().equals(request.confirmNewPassword())) {
            throw new BusinessException(ErrorCode.CHANGE_PASSWORD_MISMATCH);
        }

        final User savedUser = this.userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, userId));

        if(!this.passwordEncoder.matches(request.currentPassword(), savedUser.getPassword())) {
            throw new BusinessException(ErrorCode.INVALID_CURRENT_PASSWORD);
        }

        final String encoded = this.passwordEncoder.encode(request.newPassword());
        savedUser.setPassword(encoded);
        this.userRepository.save(savedUser);
        log.info("Changed password of user with id={}", userId);
        return SimpleResponse.builder()
                .httpStatus(HttpStatus.OK)
                .message(
                        "Password was successfully changed for user with id = " +
                                savedUser.getUserId()
                )
                .build();
    }

    @Override
    public SimpleResponse blockAccount(Long userId) {
        final User user = this.userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        if(user.isBlocked()) {
            throw new BusinessException(ErrorCode.ACCOUNT_ALREADY_DEACTIVATED);
        }

        user.setBlocked(true);
        this.userRepository.save(user);
        log.info("Blocked account with id={}", userId);
        return SimpleResponse.builder()
                .httpStatus(HttpStatus.OK)
                .message(
                        "Account with id = " + user.getUserId() +
                                " was successfully blocked"
                )
                .build();
    }

    @Override
    public SimpleResponse unblockAccount(Long userId) {
        final User user = this.userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        if(!user.isBlocked()) {
            throw new BusinessException(ErrorCode.ACCOUNT_ALREADY_ACTIVATED);
        }

        user.setBlocked(false);
        this.userRepository.save(user);
        log.info("Unblocked account with id={}", userId);
        return SimpleResponse.builder()
                .httpStatus(HttpStatus.OK)
                .message(
                        "Account with id = " + user.getUserId() +
                                " was successfully unblocked"
                )
                .build();
    }

    @Override
    public SimpleResponse deleteAccount(Long userId) {
        this.userRepository.deleteById(userId);
        log.info("Deleted account with id={}", userId);
        return SimpleResponse.builder()
                .httpStatus(HttpStatus.OK)
                .message(
                        "Account with id = " + userId +
                                " was successfully deleted"
                )
                .build();
    }

    @Transactional(readOnly = true)
    @Override
    public UserResponse getUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        log.info("Get user with id={}", id);
        return mapToUserResponse(user);
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .blocked(user.isBlocked())
                .isEmailVerified(user.isEmailVerified())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    @Override
    public List<UserResponse> getAllUsers() {
        log.info("Fetching all users:");

        return userRepository.findAllByRole_RoleName("ROLE_USER")
                .stream()
                .map(this::mapToUserResponse)
                .toList();
    }
}
