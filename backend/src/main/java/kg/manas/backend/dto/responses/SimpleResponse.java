package kg.manas.backend.dto.responses;

import lombok.Builder;
import org.springframework.http.HttpStatus;

@Builder
public record SimpleResponse (
        HttpStatus httpStatus,
        String message
){
}
