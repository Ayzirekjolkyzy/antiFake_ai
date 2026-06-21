package kg.manas.backend.exceptions;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    USER_NOT_FOUND("USER_NOT_FOUND", "User not found with id %s", HttpStatus.NOT_FOUND),
    CHANGE_PASSWORD_MISMATCH("CHANGE_PASSWORD_MISMATCH", "Current password and new password are not the same" , HttpStatus.BAD_REQUEST),
    INVALID_CURRENT_PASSWORD("INVALID_CURRENT_PASSWORD", "Current password is invalid", HttpStatus.BAD_REQUEST),
    ACCOUNT_ALREADY_DEACTIVATED("ACCOUNT_ALREADY_DEACTIVATED","Account is already deactivated" , HttpStatus.BAD_REQUEST ),
    ACCOUNT_ALREADY_ACTIVATED("ACCOUNT_ALREADY_ACTIVATED", "Account is already activated", HttpStatus.BAD_REQUEST),
    EMAIL_ALREADY_EXISTS("EMAIL_ALREADY_EXISTS", "Email already exists" , HttpStatus.BAD_REQUEST ),
    PASSWORD_MISMATCH("PASSWORD_MISMATCH","Password do not mismatch" , HttpStatus.BAD_REQUEST),
    ERR_USER_DISABLED("ERR_USER_DISABLED","User is disabled" , HttpStatus.UNAUTHORIZED),
    BAD_CREDENTIALS("BAD_CREDENTIALS","Username and / or password is incorrect" , HttpStatus.UNAUTHORIZED),
    USERNAME_NOT_FOUND("USERNAME_NOT_FOUND","Username not found" , HttpStatus.UNAUTHORIZED),
    INTERNAL_EXCEPTION("INTERNAL_EXCEPTION","Internal server error" , HttpStatus.INTERNAL_SERVER_ERROR),
    PRODUCT_NOT_FOUND("PRODUCT_NOT_FOUND", "Product not found with id %s", HttpStatus.NOT_FOUND),
    BRAND_NOT_FOUND("BRAND_NOT_FOUND", "Brand not found with id %s", HttpStatus.NOT_FOUND),
    PRODUCT_ALREADY_EXISTS("PRODUCT_ALREADY_EXISTS","Product with this barcode already exists" , HttpStatus.BAD_REQUEST),
    BRAND_REQUIRED("BRAND_REQUIRED","Brand required", HttpStatus.BAD_REQUEST ),
    COUNTRY_REQUIRED("COUNTRY_REQUIRED","Country is required", HttpStatus.BAD_REQUEST),
    COUNTRY_NOT_FOUND("COUNTRY_NOT_FOUND","Country not found" , HttpStatus.NOT_FOUND),
    QUERY_REQUIRED("QUERY_REQUIRED","Query is required", HttpStatus.BAD_REQUEST),
    BRAND_ALREADY_EXISTS("BRAND_ALREADY_EXISTS","Brand already exists",HttpStatus.BAD_REQUEST),
    BRAND_HAS_PRODUCTS("BRAND_HAS_PRODUCTS","Brand has products", HttpStatus.BAD_REQUEST ),
    BARCODE_REQUIRED("BARCODE_REQUIRED","Barcode is required", HttpStatus.BAD_REQUEST ),
    FILE_UPLOAD_FAILED("FILE_UPLOAD_FAILED", "File uploaded failed", HttpStatus.INTERNAL_SERVER_ERROR),
    PRODUCT_REQUIRED("PRODUCT_REQUIRED","Product is required", HttpStatus.BAD_REQUEST ),
    IMAGE_NOT_FOUND("IMAGE_NOT_FOUND","Image not found" ,HttpStatus.BAD_REQUEST ),
    FILE_REQUIRED("FILE_REQUIRED","File is required", HttpStatus.BAD_REQUEST ),
    TYPE_REQUIRED("TYPE_REQUIRED","Image type required" ,HttpStatus.BAD_REQUEST),
    FILE_UPDATE_FAILED("FILE_UPDATE_FAILED","File update failed" ,HttpStatus.INTERNAL_SERVER_ERROR),
    AI_ANALYSIS_FAILED("AI_ANALYSIS_FAILED","AI analysis failed, please try again", HttpStatus.SERVICE_UNAVAILABLE),
    VERIFICATION_REQUEST_NOT_FOUND("VERIFICATION_REQUEST_NOT_FOUND", "Verification request not found", HttpStatus.NOT_FOUND),
    USER_REQUIRED("USER_REQUIRED","User is required", HttpStatus.BAD_REQUEST ),
    ROLE_NOT_FOUND("ROLE_NOT_FOUND","Role not found",HttpStatus.NOT_FOUND );

    private final String code;
    private final String defaultMessage;
    private final HttpStatus status;

    ErrorCode(String code, String defaultMessage, HttpStatus status) {
        this.code = code;
        this.defaultMessage = defaultMessage;
        this.status = status;
    }
}
