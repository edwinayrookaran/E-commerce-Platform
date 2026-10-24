package com.fudcyfoods.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationMs;

    public JwtService(
            @Value("${app.jwt.secret:}") String secret,
            @Value("${app.jwt.expiration-ms:1800000}") long expirationMs) {
        this.expirationMs = expirationMs;
        this.key = Keys.hmacShaKeyFor(normalizeSecret(secret));
    }

    public IssuedToken issue(AuthUser user) {
        Instant now = Instant.now();
        Instant expiresAt = now.plusMillis(expirationMs);
        String jti = UUID.randomUUID().toString();
        String token = Jwts.builder()
                .id(jti)
                .subject(user.email())
                .claim("uid", user.id())
                .claim("name", user.name())
                .claim("role", user.role())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiresAt))
                .signWith(key)
                .compact();
        return new IssuedToken(token, jti, expiresAt);
    }

    public Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public long getExpirationMs() {
        return expirationMs;
    }

    private static byte[] normalizeSecret(String secret) {
        String material = (secret == null || secret.isBlank())
                ? UUID.randomUUID() + "local-ephemeral-jwt-secret"
                : secret;
        try {
            return MessageDigest.getInstance("SHA-256")
                    .digest(material.getBytes(StandardCharsets.UTF_8));
        } catch (Exception ex) {
            return material.repeat(4).getBytes(StandardCharsets.UTF_8);
        }
    }

    public record IssuedToken(String token, String jti, Instant expiresAt) {
    }
}
