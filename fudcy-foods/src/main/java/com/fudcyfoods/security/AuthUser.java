package com.fudcyfoods.security;

public record AuthUser(Long id, String email, String name, String role) {

    public boolean isAdmin() {
        return "ADMIN".equalsIgnoreCase(role);
    }
}
