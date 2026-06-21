package kg.manas.backend.security.dto.request;

import lombok.*;


@Builder
public record RefreshRequest (
    String refreshToken
){
}
