package com.fudcyfoods.controller;

import com.fudcyfoods.entity.CustomerOrder;
import com.fudcyfoods.service.CustomerService;
import com.fudcyfoods.service.OrderService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final OrderService orderService;
    private final CustomerService customerService;

    public AdminController(OrderService orderService, CustomerService customerService) {
        this.orderService = orderService;
        this.customerService = customerService;
    }

    @GetMapping("/stats")
    public Map<String, Object> getDashboardStats() {
        return orderService.getAdminDashboardStats();
    }

    @GetMapping("/orders")
    public List<Map<String, Object>> getOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        return orderService.getAdminOrders(status, search);
    }

    @GetMapping("/orders/{id}")
    public Map<String, Object> getOrderById(@PathVariable Long id) {
        return orderService.getAdminOrder(id);
    }

    @PutMapping("/orders/{id}/status")
    public CustomerOrder updateOrderStatus(
            @PathVariable Long id,
            @RequestBody OrderController.UpdateOrderStatusRequest request) {
        return orderService.updateOrderStatus(id, request.getStatus());
    }

    @GetMapping("/customers")
    public List<Map<String, Object>> getCustomers(
            @RequestParam(required = false) String search) {
        return customerService.getAllCustomersForAdmin(search);
    }

    @GetMapping("/customers/{id}")
    public Map<String, Object> getCustomerById(@PathVariable Long id) {
        return customerService.getCustomerDetailsForAdmin(id);
    }

    @GetMapping("/customers/{id}/orders")
    public List<Map<String, Object>> getCustomerOrders(@PathVariable Long id) {
        return customerService.getCustomerOrdersForAdmin(id);
    }
}
