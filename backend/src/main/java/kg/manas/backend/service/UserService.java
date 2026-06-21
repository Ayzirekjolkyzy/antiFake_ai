package kg.manas.backend.service;

import kg.manas.backend.dto.requests.ChangePasswordRequest;
import kg.manas.backend.dto.requests.ProfileUpdateRequest;
import kg.manas.backend.dto.responses.SimpleResponse;
import kg.manas.backend.dto.responses.UserResponse;

import java.util.List;

public interface UserService {

    SimpleResponse updateProfileInfo(ProfileUpdateRequest request, Long userId);
    SimpleResponse changePassword(ChangePasswordRequest request, Long userId);
    SimpleResponse blockAccount(Long userId);
    SimpleResponse unblockAccount(Long userId);
    SimpleResponse deleteAccount(Long userId);
    List<UserResponse> getAllUsers();
    UserResponse getUser(Long id);

}
