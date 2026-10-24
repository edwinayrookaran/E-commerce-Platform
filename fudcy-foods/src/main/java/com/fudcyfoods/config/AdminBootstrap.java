package com.fudcyfoods.config;

import com.fudcyfoods.entity.Customer;
import com.fudcyfoods.repository.CustomerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminBootstrap implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;
    private final String adminName;

    public AdminBootstrap(
            CustomerRepository customerRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin.email:}") String adminEmail,
            @Value("${app.admin.password:}") String adminPassword,
            @Value("${app.admin.name:Fudcy Admin}") String adminName) {
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
        this.adminName = adminName;
    }

    @Override
    public void run(String... args) {
        if (adminEmail == null || adminEmail.isBlank() || adminPassword == null || adminPassword.isBlank()) {
            log.info("ADMIN_EMAIL/ADMIN_PASSWORD are not set; no admin account will be bootstrapped.");
            return;
        }

        String email = adminEmail.trim().toLowerCase();
        Customer customer = customerRepository.findByEmailIgnoreCase(email).orElseGet(Customer::new);
        boolean created = customer.getId() == null;
        customer.setName(adminName == null || adminName.isBlank() ? "Fudcy Admin" : adminName.trim());
        customer.setEmail(email);
        customer.setPasswordHash(passwordEncoder.encode(adminPassword));
        customer.setRole("ADMIN");
        customerRepository.save(customer);
        log.info(created ? "Bootstrapped administrator account." : "Updated administrator account role.");
    }
}
