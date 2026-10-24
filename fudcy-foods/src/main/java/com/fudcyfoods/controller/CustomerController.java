package com.fudcyfoods.controller;

import com.fudcyfoods.entity.Customer;
import com.fudcyfoods.service.CustomerService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auth")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return AuthResponse.from(customerService.register(
                request.getName(),
                request.getEmail(),
                request.getPassword()
        ));
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return AuthResponse.from(customerService.login(
                request.getEmail(),
                request.getPassword()
        ));
    }

    @GetMapping("/me")
    public AuthResponse getProfile() {
        Customer customer = customerService.getCurrentCustomer();
        return AuthResponse.from(new CustomerService.AuthSession(null, null, customer));
    }

    @PostMapping("/refresh")
    public AuthResponse refresh() {
        return AuthResponse.from(customerService.refreshCurrentSession());
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout() {
        customerService.logout();
    }

    public static class RegisterRequest {
        @NotBlank(message = "Name is required")
        @Size(max = 100)
        private String name;

        @NotBlank(message = "Email is required")
        @Email(message = "Must be a valid email")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, max = 72, message = "Password must be 6 to 72 characters")
        private String password;

        public RegisterRequest() {}

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;

        public LoginRequest() {}

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    public static class AuthResponse {
        private String token;
        private Instant expiresAt;
        private CustomerResponse user;

        public AuthResponse() {}

        public static AuthResponse from(CustomerService.AuthSession session) {
            AuthResponse response = new AuthResponse();
            response.token = session.token();
            response.expiresAt = session.expiresAt();
            response.user = CustomerResponse.from(session.customer());
            return response;
        }

        public String getToken() {
            return token;
        }

        public Instant getExpiresAt() {
            return expiresAt;
        }

        public CustomerResponse getUser() {
            return user;
        }
    }

    public static class CustomerResponse {
        private Long id;
        private String name;
        private String email;
        private String role;
        private LocalDateTime createdAt;

        public CustomerResponse() {}

        public CustomerResponse(Long id, String name, String email, String role, LocalDateTime createdAt) {
            this.id = id;
            this.name = name;
            this.email = email;
            this.role = role;
            this.createdAt = createdAt;
        }

        public static CustomerResponse from(Customer customer) {
            return new CustomerResponse(
                    customer.getId(),
                    customer.getName(),
                    customer.getEmail(),
                    customer.getRole(),
                    customer.getCreatedAt()
            );
        }

        public Long getId() {
            return id;
        }

        public String getName() {
            return name;
        }

        public String getEmail() {
            return email;
        }

        public String getRole() {
            return role;
        }

        public LocalDateTime getCreatedAt() {
            return createdAt;
        }
    }
}
