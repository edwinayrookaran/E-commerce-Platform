package com.fudcyfoods.security;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class TokenBlacklist {

    private final Map<String, Instant> revokedEffectiveAfter = new ConcurrentHashMap<>();
    private final Map<String, Instant> revokedUntil = new ConcurrentHashMap<>();

    public void revoke(String jti, Instant expiresAt) {
        revokeWithGrace(jti, expiresAt, 0);
    }

    public void revokeWithGrace(String jti, Instant expiresAt, int graceSeconds) {
        if (jti == null || jti.isBlank()) {
            return;
        }
        Instant effectiveAfter = (graceSeconds > 0)
                ? Instant.now().plusSeconds(graceSeconds)
                : Instant.now();
        revokedEffectiveAfter.put(jti, effectiveAfter);
        revokedUntil.put(jti, expiresAt == null ? Instant.now().plusSeconds(1800) : expiresAt);
        purgeExpired();
    }

    public boolean isRevoked(String jti) {
        if (jti == null) {
            return false;
        }
        Instant effectiveAfter = revokedEffectiveAfter.get(jti);
        if (effectiveAfter != null && Instant.now().isBefore(effectiveAfter)) {
            // Still in grace period for in-flight requests during session renewal
            return false;
        }
        Instant until = revokedUntil.get(jti);
        if (until == null) {
            return false;
        }
        if (until.isBefore(Instant.now())) {
            revokedUntil.remove(jti);
            revokedEffectiveAfter.remove(jti);
            return false;
        }
        return true;
    }

    private void purgeExpired() {
        Instant now = Instant.now();
        revokedUntil.entrySet().removeIf(entry -> {
            if (entry.getValue().isBefore(now)) {
                revokedEffectiveAfter.remove(entry.getKey());
                return true;
            }
            return false;
        });
    }
}
