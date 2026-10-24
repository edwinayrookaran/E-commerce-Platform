package com.fudcyfoods;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import com.fudcyfoods.entity.Product;
import com.fudcyfoods.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;


import java.math.BigDecimal;
import java.util.UUID;

import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ApiSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JsonMapper objectMapper;

    @Autowired
    private ProductRepository productRepository;

    private Long productId;

    @BeforeEach
    void seedProduct() {
        if (productRepository.findByListedTrue().isEmpty()) {
            Product product = new Product();
            product.setName("Pepper Chicken Masala 200g");
            product.setDescription("Test meal");
            product.setPrice(new BigDecimal("224.00"));
            product.setStockQuantity(20);
            product.setCategory("CHICKEN");
            product.setListed(true);
            productRepository.save(product);
        }
        productId = productRepository.findByListedTrue().get(0).getId();
    }

    @Test
    void unauthenticatedAdminRequestsAreRejected() throws Exception {
        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Hack","description":"x","price":10,"stockQuantity":1}
                                """))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/orders"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(put("/api/orders/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"SHIPPED\"}"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(delete("/api/products/" + productId))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void customerCannotCallAdminEndpoints() throws Exception {
        String token = registerAndLogin("cust-" + UUID.randomUUID() + "@fudcy.test", "secret1");

        mockMvc.perform(post("/api/products")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Hack","description":"x","price":10,"stockQuantity":1}
                                """))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/orders")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    void customerCannotReadAnotherCustomersOrder() throws Exception {
        String aliceToken = registerAndLogin("alice-" + UUID.randomUUID() + "@fudcy.test", "secret1");
        String bobToken = registerAndLogin("bob-" + UUID.randomUUID() + "@fudcy.test", "secret1");

        MvcResult created = mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(orderJson("Alice", "9876543210")))
                .andExpect(status().isCreated())
                .andReturn();

        long orderId = objectMapper.readTree(created.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(get("/api/orders/" + orderId + "/track")
                        .header("Authorization", "Bearer " + bobToken))
                .andExpect(status().isNotFound());

        mockMvc.perform(put("/api/orders/" + orderId + "/cancel")
                        .header("Authorization", "Bearer " + bobToken))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/orders/my-orders")
                        .header("Authorization", "Bearer " + bobToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.orderId == " + orderId + ")]").doesNotExist());
    }

    @Test
    void guestLookupRequiresMatchingPhoneAndDoesNotExposeOthers() throws Exception {
        MvcResult created = mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(orderJson("Guest", "9876500001")))
                .andExpect(status().isCreated())
                .andReturn();
        long orderId = objectMapper.readTree(created.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(post("/api/orders/guest-lookup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"orderId\":" + orderId + ",\"phone\":\"9876500002\"}"))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/orders/" + orderId + "/track?phone=9876500002"))
                .andExpect(status().isNotFound());

        mockMvc.perform(post("/api/orders/guest-lookup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"orderId\":" + orderId + ",\"phone\":\"9876500001\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").value(orderId))
                .andExpect(jsonPath("$.phone").doesNotExist())
                .andExpect(jsonPath("$.deliveryAddress").doesNotExist());
    }

    @Test
    void orderCreationIgnoresClientPricesAndRejectsInvalidQuantities() throws Exception {
        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "customerName":"Price Hack",
                                  "phone":"9876500003",
                                  "email":"hack@test.com",
                                  "deliveryAddress":"1 Test Street",
                                  "items":[{"productId":%d,"quantity":1,"unitPrice":1,"total":1}],
                                  "totalAmount":1
                                }
                                """.formatted(productId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.totalAmount").value(not(1)));

        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "customerName":"Bad Qty",
                                  "phone":"9876500004",
                                  "deliveryAddress":"1 Test Street",
                                  "items":[{"productId":%d,"quantity":0}]
                                }
                                """.formatted(productId)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void registrationValidatesInputAndHidesPasswordHash() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"A","email":"not-an-email","password":"secret1"}
                                """))
                .andExpect(status().isBadRequest());

        String email = "ok-" + UUID.randomUUID() + "@fudcy.test";
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Ok User","email":"%s","password":"secret1"}
                                """.formatted(email)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.user.email").value(email))
                .andExpect(jsonPath("$.user.passwordHash").doesNotExist())
                .andExpect(jsonPath("$.user.password").doesNotExist());

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Ok User","email":"%s","password":"secret1"}
                                """.formatted(email)))
                .andExpect(status().isConflict());
    }

    @Test
    void expiredOrMissingTokenCannotAccessProtectedEndpoints() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer not-a-token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void duplicateCancelDoesNotFailAfterFirstCancel() throws Exception {
        String token = registerAndLogin("cancel-" + UUID.randomUUID() + "@fudcy.test", "secret1");
        MvcResult created = mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(orderJson("Cancel User", "9876500005")))
                .andExpect(status().isCreated())
                .andReturn();
        long orderId = objectMapper.readTree(created.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(put("/api/orders/" + orderId + "/cancel")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        mockMvc.perform(put("/api/orders/" + orderId + "/cancel")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest());
    }

    @Test
    void adminCanManageCatalogWithToken() throws Exception {
        String adminToken = login("admin@fudcy.test", "AdminPass1");

        mockMvc.perform(get("/api/admin/products")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    private String orderJson(String name, String phone) {
        return """
                {
                  "customerName":"%s",
                  "phone":"%s",
                  "email":"%s@orders.test",
                  "deliveryAddress":"12 Test Lane, Kochi",
                  "items":[{"productId":%d,"quantity":1}]
                }
                """.formatted(name, phone, name.replace(" ", "").toLowerCase(), productId);
    }

    private String registerAndLogin(String email, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Test User","email":"%s","password":"%s"}
                                """.formatted(email, password)))
                .andExpect(status().isCreated())
                .andReturn();
        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
        return body.get("token").asText();
    }

    private String login(String email, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"%s"}
                                """.formatted(email, password)))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();
    }
}
