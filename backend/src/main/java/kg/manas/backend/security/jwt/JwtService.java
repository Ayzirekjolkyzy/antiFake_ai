package kg.manas.backend.security.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import kg.manas.backend.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.PrivateKey;
import java.security.PublicKey;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    @Value("${jwt.access-token-expiration}")
    private long accessTokenExpiration;
    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;

    private static final String TOKEN_TYPE="token_type";
    private final PrivateKey privateKey;
    private final PublicKey publicKey;

    public JwtService() throws Exception {
        this.privateKey = KeyUtils.loadPrivateKey("keys/local-only/private_key.pem");
        this.publicKey = KeyUtils.loadPublicKey("keys/local-only/public_key.pem");
    }

    public String generateAccessToken(final User user) {
        final Map<String, Object> claims = Map.of(
                TOKEN_TYPE, "ACCESS_TOKEN",
                "role", user.getRole().getRoleName()
        );

        return buildToken(
                user.getEmail(),
                claims,
                this.accessTokenExpiration
        );
    }

    public String generateRefreshToken(final User user) {

        final Map<String, Object> claims = Map.of(
                TOKEN_TYPE, "REFRESH_TOKEN",
                "role", user.getRole().getRoleName()
        );

        return buildToken(
                user.getEmail(),
                claims,
                this.refreshTokenExpiration
        );
    }

    public String buildToken(final String username, final Map<String, Object> claims, final long expiration) {
        return Jwts.builder()
                .claims(claims)
                .subject(username)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis()+expiration))
                .signWith(this.privateKey)
                .compact();
    }

    public boolean isTokenValid(final String token, final String expectedUsername) {
        final String username = extractUsername(token);
        return username.equals(expectedUsername)&&!isTokenExpired(token);
    }

    private boolean isTokenExpired(final String token) {
        return extractClaims(token)
                .getExpiration()
                .before(new Date());
    }

    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    private Claims extractClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(publicKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        }catch (final JwtException e) {
            throw new RuntimeException("Invalid JWT token", e);
        }
    }

    public boolean isAccessToken(String token) {
        final Claims claims = extractClaims(token);
        return "ACCESS_TOKEN".equals(claims.get("token_type"));
    }

    public String refreshAccessToken(final String refreshToken) {

        final Claims claims = extractClaims(refreshToken);

        if(!"REFRESH_TOKEN".equals(claims.get(TOKEN_TYPE))) {
            throw new RuntimeException("Invalid token type");
        }

        if(isTokenExpired(refreshToken)) {
            throw new RuntimeException("Refresh Token expired");
        }

        final String username = claims.getSubject();
        final String role = claims.get("role", String.class);

        return generateAccessToken(username, role);
    }
    private String generateAccessToken(
            final String username,
            final String role
    ) {

        final Map<String, Object> claims = Map.of(
                TOKEN_TYPE, "ACCESS_TOKEN",
                "role", role
        );

        return buildToken(
                username,
                claims,
                this.accessTokenExpiration
        );
    }

}
