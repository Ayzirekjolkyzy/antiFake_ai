package kg.manas.backend.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import kg.manas.backend.dto.requests.ChangePasswordRequest;
import kg.manas.backend.dto.requests.ProfileUpdateRequest;
import kg.manas.backend.dto.responses.SimpleResponse;
import kg.manas.backend.dto.responses.UserResponse;
import kg.manas.backend.security.user.PersonDetails;
import kg.manas.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/v1/users")
@RequiredArgsConstructor
@Tag(name="User", description = "User api")
public class UserController {


    private final UserService userService;

    @GetMapping("/me")
    public UserResponse getMe(Authentication principal) {
        return userService.getUser(getUserId(principal));
    }

    @PatchMapping("/me")
    @ResponseStatus(code= HttpStatus.NO_CONTENT)
    public SimpleResponse updateProfileInfo(
            @RequestBody
            @Valid
            final ProfileUpdateRequest request,
            final Authentication principal) {
        return userService.updateProfileInfo(request, getUserId(principal));
    }


    @PostMapping("/me/password")
    @ResponseStatus(code=HttpStatus.NO_CONTENT)
    public SimpleResponse changePassword(
            @RequestBody
            @Valid
            final ChangePasswordRequest request,
            final Authentication principal
            ) {
        return userService.changePassword(request, getUserId(principal));
    }


    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/admin/deactivate/{id}")
    @ResponseStatus(code=HttpStatus.NO_CONTENT)
    public SimpleResponse deactivateAccount(@PathVariable("id") Long userId) {
        return userService.blockAccount(userId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/admin/reactivate/{id}")
    @ResponseStatus(code=HttpStatus.NO_CONTENT)
    public SimpleResponse reactivateAccount(@PathVariable("id") Long userId) {
        return userService.unblockAccount(userId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/admin/{id}")
    @ResponseStatus(code=HttpStatus.NO_CONTENT)
    public SimpleResponse deleteAccount(@PathVariable("id") Long userId) {
        return userService.deleteAccount(userId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/{id}")
    public UserResponse getUser(@PathVariable("id") Long userId) {
        return userService.getUser(userId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin")
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    private Long getUserId(final Authentication principal) {
        return ((PersonDetails) principal.getPrincipal()).getUser().getUserId();
    }
}
