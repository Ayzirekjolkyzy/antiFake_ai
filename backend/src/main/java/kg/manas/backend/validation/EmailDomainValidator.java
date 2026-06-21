package kg.manas.backend.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class EmailDomainValidator implements ConstraintValidator<NonDisposableEmail, String> {

    private final Set<String> blocked;


    public EmailDomainValidator(
            @Value("${app.security.disposable-email}")
            final List<String> domains)
    {
        this.blocked = domains.stream()
                .map(String::toLowerCase)
                .collect(Collectors.toSet());
    }


    @Override
    public boolean isValid(final String email, final ConstraintValidatorContext constraintValidatorContext) {
        if(email==null||!email.contains("@")) {
            return true;
        }
        final int atIndex = email.indexOf("@")+1;
        final int doIndex = email.lastIndexOf(".");
        final String domain = email.substring(atIndex, doIndex);
        return !this.blocked.contains(domain);
    }
}
