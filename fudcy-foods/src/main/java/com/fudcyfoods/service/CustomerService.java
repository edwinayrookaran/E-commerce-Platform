package com.fudcyfoods.service;

import com.fudcyfoods.entity.Customer;
import com.fudcyfoods.entity.CustomerOrder;
import com.fudcyfoods.entity.OrderItem;
import com.fudcyfoods.repository.CustomerOrderRepository;
import com.fudcyfoods.repository.CustomerRepository;
import com.fudcyfoods.repository.OrderItemRepository;
import com.fudcyfoods.security.AuthUser;
import com.fudcyfoods.security.JwtService;
import com.fudcyfoods.security.TokenBlacklist;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Pattern;

@Service
public class CustomerService {

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    private final CustomerRepository customerRepository;
    private final CustomerOrderRepository customerOrderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TokenBlacklist tokenBlacklist;

    public CustomerService(
            CustomerRepository customerRepository,
            CustomerOrderRepository customerOrderRepository,
            OrderItemRepository orderItemRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            TokenBlacklist tokenBlacklist) {
        this.customerRepository = customerRepository;
        this.customerOrderRepository = customerOrderRepository;
        this.orderItemRepository = orderItemRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.tokenBlacklist = tokenBlacklist;
    }

    public AuthSession register(String name, String email, String password) {
        return register(name, email, password, null);
    }

    public AuthSession register(String name, String email, String password, String phone) {
        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Full name is required.");
        }

        if (name.trim().length() > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Name cannot exceed 100 characters.");
        }

        validateEmail(email);
        validatePassword(password);

        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);

        if (customerRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "An account with this email already exists.");
        }

        Customer customer = new Customer();
        customer.setName(name.trim());
        customer.setEmail(normalizedEmail);
        customer.setPasswordHash(passwordEncoder.encode(password));
        customer.setRole("CUSTOMER");
        if (phone != null && !phone.isBlank()) {
            customer.setPhone(phone.trim());
        }

        return issueSession(customerRepository.save(customer));
    }

    public AuthSession login(String email, String password) {
        if (email == null || email.isBlank()
                || password == null || password.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Email and password are required.");
        }

        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);

        Customer customer = customerRepository
                .findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Invalid email or password."));

        if (!passwordEncoder.matches(password, customer.getPasswordHash())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Invalid email or password.");
        }

        return issueSession(customer);
    }

    public AuthSession refreshCurrentSession() {
        AuthUser user = requireUser();
        revokeCurrentToken();

        Customer customer = customerRepository.findById(user.id())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Session expired"));

        return issueSession(customer);
    }

    public void logout() {
        revokeCurrentToken();
    }

    public Customer getCurrentCustomer() {
        AuthUser user = requireUser();

        return customerRepository.findById(user.id())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Session expired"));
    }

    public List<Map<String, Object>> getAllCustomersForAdmin(String search) {
        List<Customer> customers = customerRepository.findAll();

        if (search != null && !search.isBlank()) {
            String query = search.trim().toLowerCase(Locale.ROOT);
            customers = customers.stream().filter(c ->
                    String.valueOf(c.getId()).contains(query)
                            || (c.getName() != null && c.getName().toLowerCase().contains(query))
                            || (c.getEmail() != null && c.getEmail().toLowerCase().contains(query))
                            || (c.getPhone() != null && c.getPhone().contains(query))
            ).toList();
        }

        return customers.stream().map(c -> {
            List<CustomerOrder> orders = customerOrderRepository.findAllByCustomerOrEmail(c.getId(), c.getEmail());
            BigDecimal totalSpent = BigDecimal.ZERO;
            LocalDateTime latestOrderDate = null;
            String phone = c.getPhone();

            for (CustomerOrder o : orders) {
                if (latestOrderDate == null || (o.getCreatedAt() != null && o.getCreatedAt().isAfter(latestOrderDate))) {
                    latestOrderDate = o.getCreatedAt();
                }
                if (phone == null && o.getPhone() != null && !o.getPhone().isBlank()) {
                    phone = o.getPhone();
                }
                if (!"CANCELLED".equalsIgnoreCase(o.getStatus()) && o.getTotalAmount() != null) {
                    totalSpent = totalSpent.add(o.getTotalAmount());
                }
            }

            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", c.getId());
            map.put("name", c.getName());
            map.put("email", c.getEmail());
            map.put("phone", phone);
            map.put("role", c.getRole());
            map.put("createdAt", c.getCreatedAt());
            map.put("orderCount", orders.size());
            map.put("totalSpent", totalSpent);
            map.put("status", "ACTIVE");
            map.put("latestOrderDate", latestOrderDate);
            return map;
        }).toList();
    }

    public Map<String, Object> getCustomerDetailsForAdmin(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found: " + customerId));

        List<CustomerOrder> orders = customerOrderRepository.findAllByCustomerOrEmail(customer.getId(), customer.getEmail());
        BigDecimal totalSpent = BigDecimal.ZERO;
        LocalDateTime latestOrderDate = null;
        String phone = customer.getPhone();

        List<Map<String, Object>> orderSummaries = new ArrayList<>();
        for (CustomerOrder o : orders) {
            if (latestOrderDate == null || (o.getCreatedAt() != null && o.getCreatedAt().isAfter(latestOrderDate))) {
                latestOrderDate = o.getCreatedAt();
            }
            if (phone == null && o.getPhone() != null && !o.getPhone().isBlank()) {
                phone = o.getPhone();
            }
            if (!"CANCELLED".equalsIgnoreCase(o.getStatus()) && o.getTotalAmount() != null) {
                totalSpent = totalSpent.add(o.getTotalAmount());
            }

            List<OrderItem> items = orderItemRepository.findByCustomerOrderId(o.getId());
            Map<String, Object> orderMap = new LinkedHashMap<>();
            orderMap.put("id", o.getId());
            orderMap.put("orderId", o.getId());
            orderMap.put("createdAt", o.getCreatedAt());
            orderMap.put("totalAmount", o.getTotalAmount());
            orderMap.put("paymentMethod", o.getPaymentMethod());
            orderMap.put("status", o.getStatus());
            orderMap.put("deliveryAddress", o.getDeliveryAddress());
            orderMap.put("items", items.stream().map(it -> Map.of(
                    "productId", it.getProductId(),
                    "productName", it.getProductName(),
                    "quantity", it.getQuantity(),
                    "unitPrice", it.getUnitPrice()
            )).toList());
            orderSummaries.add(orderMap);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", customer.getId());
        result.put("name", customer.getName());
        result.put("email", customer.getEmail());
        result.put("phone", phone);
        result.put("role", customer.getRole());
        result.put("createdAt", customer.getCreatedAt());
        result.put("status", "ACTIVE");
        result.put("totalOrders", orders.size());
        result.put("totalSpent", totalSpent);
        result.put("mostRecentOrderDate", latestOrderDate);
        result.put("orders", orderSummaries);
        return result;
    }

    public List<Map<String, Object>> getCustomerOrdersForAdmin(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found: " + customerId));

        List<CustomerOrder> orders = customerOrderRepository.findAllByCustomerOrEmail(customer.getId(), customer.getEmail());
        return orders.stream().map(o -> {
            List<OrderItem> items = orderItemRepository.findByCustomerOrderId(o.getId());
            Map<String, Object> orderMap = new LinkedHashMap<>();
            orderMap.put("id", o.getId());
            orderMap.put("orderId", o.getId());
            orderMap.put("createdAt", o.getCreatedAt());
            orderMap.put("totalAmount", o.getTotalAmount());
            orderMap.put("paymentMethod", o.getPaymentMethod());
            orderMap.put("status", o.getStatus());
            orderMap.put("items", items.stream().map(it -> Map.of(
                    "productId", it.getProductId(),
                    "productName", it.getProductName(),
                    "quantity", it.getQuantity(),
                    "unitPrice", it.getUnitPrice()
            )).toList());
            return orderMap;
        }).toList();
    }

    public static AuthUser requireUser() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !(authentication.getPrincipal() instanceof AuthUser user)) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Authentication required");
        }

        return user;
    }

    public static AuthUser currentUserOrNull() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null
                && authentication.getPrincipal() instanceof AuthUser user) {
            return user;
        }

        return null;
    }

    private void revokeCurrentToken() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null) {
            return;
        }

        Object details = authentication.getDetails();

        if (details instanceof String jti) {
            tokenBlacklist.revoke(
                    jti, Instant.now().plusMillis(jwtService.getExpirationMs()));
        }

        if (authentication.getCredentials() instanceof String token) {
            try {
                tokenBlacklist.revoke(
                        jwtService.parse(token).getId(),
                        Instant.now().plusMillis(jwtService.getExpirationMs()));
            } catch (Exception ignored) {
                // Token is already unusable.
            }
        }
    }

    private AuthSession issueSession(Customer customer) {
        String role = customer.getRole();

        if (role == null || role.isBlank()) {
            role = "CUSTOMER";
        } else {
            role = role.trim().toUpperCase(Locale.ROOT);
        }

        AuthUser user = new AuthUser(
                customer.getId(),
                customer.getEmail(),
                customer.getName(),
                role
        );

        JwtService.IssuedToken issued = jwtService.issue(user);

        return new AuthSession(
                issued.token(),
                issued.expiresAt(),
                customer
        );
    }

    private void validateEmail(String email) {
        if (email == null || email.isBlank()
                || !EMAIL_PATTERN.matcher(email.trim()).matches()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "A valid email address is required.");
        }
    }

    private void validatePassword(String password) {
        if (password == null || password.length() < 6) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Password must be at least 6 characters.");
        }

        if (password.length() > 72) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Password cannot exceed 72 characters.");
        }
    }

    public record AuthSession(
            String token,
            Instant expiresAt,
            Customer customer) {
    }
}
