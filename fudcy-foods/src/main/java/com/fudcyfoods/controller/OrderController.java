package com.fudcyfoods.controller;

import com.fudcyfoods.entity.CustomerOrder;
import com.fudcyfoods.entity.OrderItem;
import com.fudcyfoods.security.AuthUser;
import com.fudcyfoods.service.CustomerService;
import com.fudcyfoods.service.OrderService;
import com.fudcyfoods.service.OrderService.OrderRequestItem;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CustomerOrder createOrder(@RequestBody CreateOrderRequest request) {
        AuthUser actor = CustomerService.currentUserOrNull();
        return orderService.createOrder(
                request.getCustomerName(),
                request.getPhone(),
                request.getEmail(),
                request.getDeliveryAddress(),
                request.getItems(),
                actor
        );
    }

    @GetMapping
    public List<CustomerOrder> getAllOrders() {
        return orderService.getAllOrders();
    }

    @GetMapping("/{orderId}")
    public Map<String, Object> getOrderById(
            @PathVariable Long orderId,
            @RequestParam(required = false) String phone,
            HttpServletRequest httpRequest) {
        return orderService.getOrderDetails(
                orderId,
                phone,
                CustomerService.currentUserOrNull(),
                clientKey(httpRequest)
        );
    }

    @GetMapping("/my-orders")
    public List<Map<String, Object>> getMyOrders() {
        return orderService.getMyOrders(CustomerService.requireUser());
    }

    @PostMapping("/guest-lookup")
    public Map<String, Object> guestLookup(
            @RequestBody GuestLookupRequest request,
            HttpServletRequest httpRequest) {
        return orderService.guestLookup(
                request.getOrderId(),
                request.getPhone(),
                clientKey(httpRequest)
        );
    }

    @GetMapping("/{orderId}/items")
    public List<OrderItem> getOrderItems(@PathVariable Long orderId) {
        return orderService.getOrderItems(orderId);
    }

    @PutMapping("/{orderId}/status")
    public CustomerOrder updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody UpdateOrderStatusRequest request) {
        return orderService.updateOrderStatus(orderId, request.getStatus());
    }

    @GetMapping("/{orderId}/track")
    public Map<String, Object> trackOrder(
            @PathVariable Long orderId,
            @RequestParam(required = false) String phone,
            HttpServletRequest httpRequest) {
        return orderService.trackOrder(
                orderId,
                phone,
                CustomerService.currentUserOrNull(),
                clientKey(httpRequest)
        );
    }

    @PutMapping("/{orderId}/cancel")
    public CustomerOrder cancelCustomerOrder(
            @PathVariable Long orderId,
            @RequestParam(required = false) String phone,
            HttpServletRequest httpRequest) {
        return orderService.cancelCustomerOrder(
                orderId,
                phone,
                CustomerService.currentUserOrNull(),
                clientKey(httpRequest)
        );
    }

    private String clientKey(HttpServletRequest request) {
        return request.getRemoteAddr();
    }

    public static class UpdateOrderStatusRequest {
        private String status;

        public UpdateOrderStatusRequest() {
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }

    public static class GuestLookupRequest {
        @NotNull
        private Long orderId;
        @NotBlank
        private String phone;

        public GuestLookupRequest() {
        }

        public Long getOrderId() {
            return orderId;
        }

        public void setOrderId(Long orderId) {
            this.orderId = orderId;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }
    }

    public static class CreateOrderRequest {
        private String customerName;
        private String phone;
        private String email;
        private String deliveryAddress;
        private String streetAddress;
        private String city;
        private String state;
        private String postalCode;
        private List<OrderRequestItem> items;

        public CreateOrderRequest() {
        }

        public String getCustomerName() {
            return customerName;
        }

        public void setCustomerName(String customerName) {
            this.customerName = customerName;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getDeliveryAddress() {
            if (deliveryAddress != null && !deliveryAddress.isBlank()) {
                return deliveryAddress.trim();
            }
            if (streetAddress != null && !streetAddress.isBlank()) {
                StringBuilder sb = new StringBuilder(streetAddress.trim());
                if (city != null && !city.isBlank()) sb.append(", ").append(city.trim());
                if (state != null && !state.isBlank()) sb.append(", ").append(state.trim());
                if (postalCode != null && !postalCode.isBlank()) sb.append(" - ").append(postalCode.trim());
                return sb.toString();
            }
            return null;
        }

        public void setDeliveryAddress(String deliveryAddress) {
            this.deliveryAddress = deliveryAddress;
        }

        public String getStreetAddress() {
            return streetAddress;
        }

        public void setStreetAddress(String streetAddress) {
            this.streetAddress = streetAddress;
        }

        public String getCity() {
            return city;
        }

        public void setCity(String city) {
            this.city = city;
        }

        public String getState() {
            return state;
        }

        public void setState(String state) {
            this.state = state;
        }

        public String getPostalCode() {
            return postalCode;
        }

        public void setPostalCode(String postalCode) {
            this.postalCode = postalCode;
        }

        public List<OrderRequestItem> getItems() {
            return items;
        }

        public void setItems(List<OrderRequestItem> items) {
            this.items = items;
        }
    }
}
