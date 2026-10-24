package com.fudcyfoods.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final TokenBlacklist tokenBlacklist;

    public JwtAuthFilter(JwtService jwtService, TokenBlacklist tokenBlacklist) {
        this.jwtService = jwtService;
        this.tokenBlacklist = tokenBlacklist;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null || header.isBlank()) {
            filterChain.doFilter(request, response);
            return;
        }

        if (!header.startsWith("Bearer ")) {
            unauthorized(response, "Invalid authorization header");
            return;
        }

        String token = header.substring(7).trim();
        try {
            Claims claims = jwtService.parse(token);
            String jti = claims.getId();
            if (tokenBlacklist.isRevoked(jti)) {
                unauthorized(response, "Session expired");
                return;
            }

            Object uidClaim = claims.get("uid");
            Long uid = uidClaim instanceof Number number
                    ? number.longValue()
                    : Long.parseLong(String.valueOf(uidClaim));

            AuthUser user = new AuthUser(
                    uid,
                    claims.getSubject(),
                    String.valueOf(claims.get("name")),
                    String.valueOf(claims.get("role"))
            );

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            user,
                            token,
                            List.of(new SimpleGrantedAuthority("ROLE_" + user.role()))
                    );
            authentication.setDetails(jti);
            SecurityContextHolder.getContext().setAuthentication(authentication);
            filterChain.doFilter(request, response);
        } catch (JwtException | IllegalArgumentException ex) {
            unauthorized(response, "Session expired");
        }
    }

    private void unauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("{\"message\":\"" + message + "\"}");
    }
}
