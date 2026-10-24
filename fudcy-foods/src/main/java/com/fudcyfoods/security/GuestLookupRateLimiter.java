package com.fudcyfoods.security;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class GuestLookupRateLimiter {

    private static final int MAX_ATTEMPTS = 10;
    private static final long WINDOW_SECONDS = 600;

    private final Map<String, Deque<Instant>> attempts = new ConcurrentHashMap<>();

    public void check(String clientKey) {
        String key = clientKey == null || clientKey.isBlank() ? "unknown" : clientKey;
        Instant cutoff = Instant.now().minusSeconds(WINDOW_SECONDS);
        Deque<Instant> stamps = attempts.computeIfAbsent(key, ignored -> new ArrayDeque<>());
        synchronized (stamps) {
            while (!stamps.isEmpty() && stamps.peekFirst().isBefore(cutoff)) {
                stamps.removeFirst();
            }
            if (stamps.size() >= MAX_ATTEMPTS) {
                throw new ResponseStatusException(
                        HttpStatus.TOO_MANY_REQUESTS,
                        "Too many lookup attempts. Please try again later."
                );
            }
            stamps.addLast(Instant.now());
        }
    }
}
