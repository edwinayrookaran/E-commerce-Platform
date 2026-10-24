package com.fudcyfoods;

import com.fudcyfoods.entity.Product;
import com.fudcyfoods.repository.ProductRepository;
import com.fudcyfoods.security.AuthUser;
import com.fudcyfoods.service.OrderService;
import com.fudcyfoods.service.OrderService.OrderRequestItem;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class InventoryConcurrencyTest {

    @Autowired
    private OrderService orderService;

    @Autowired
    private ProductRepository productRepository;

    @Test
    void concurrentOrdersCannotOversellLastUnit() throws Exception {
        Product product = new Product();
        product.setName("Limited Stock Meal");
        product.setDescription("Concurrency fixture");
        product.setPrice(new BigDecimal("100.00"));
        product.setStockQuantity(1);
        product.setCategory("VEG");
        product.setListed(true);
        product = productRepository.save(product);
        Long productId = product.getId();

        CountDownLatch start = new CountDownLatch(1);
        CountDownLatch done = new CountDownLatch(2);
        AtomicInteger successes = new AtomicInteger();
        AtomicInteger failures = new AtomicInteger();

        Runnable buyer = () -> {
            try {
                start.await();
                OrderRequestItem item = new OrderRequestItem();
                item.setProductId(productId);
                item.setQuantity(1);
                orderService.createOrder(
                        "Buyer",
                        "9876511111",
                        "buyer@test.com",
                        "Concurrency Street",
                        List.of(item),
                        new AuthUser(null, "buyer@test.com", "Buyer", "CUSTOMER")
                );
                successes.incrementAndGet();
            } catch (ResponseStatusException | InterruptedException ex) {
                failures.incrementAndGet();
            } finally {
                done.countDown();
            }
        };

        Thread t1 = new Thread(buyer);
        Thread t2 = new Thread(buyer);
        t1.start();
        t2.start();
        start.countDown();
        done.await();

        Product remaining = productRepository.findById(productId).orElseThrow();
        assertEquals(1, successes.get());
        assertEquals(1, failures.get());
        assertEquals(0, remaining.getStockQuantity());
        assertTrue(remaining.getStockQuantity() >= 0);
    }
}
