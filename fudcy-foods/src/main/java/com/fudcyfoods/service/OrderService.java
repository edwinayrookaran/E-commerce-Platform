package com.fudcyfoods.service;

import com.fudcyfoods.entity.CustomerOrder;
import com.fudcyfoods.entity.OrderItem;
import com.fudcyfoods.entity.Product;
import com.fudcyfoods.repository.CustomerOrderRepository;
import com.fudcyfoods.repository.CustomerRepository;
import com.fudcyfoods.repository.OrderItemRepository;
import com.fudcyfoods.repository.ProductRepository;
import com.fudcyfoods.security.AuthUser;
import com.fudcyfoods.security.GuestLookupRateLimiter;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.*;

@Service
public class OrderService {

    private static final int MAX_ITEMS = 40;
    private static final int MAX_QTY = 99;
    private static final Set<String> ADMIN_STATUSES = Set.of(
            "PLACED", "CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED", "CANCELLED"
    );
    private static final Set<String> CUSTOMER_CANCELLABLE = Set.of("PLACED", "CONFIRMED");

    private final CustomerOrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final GuestLookupRateLimiter guestLookupRateLimiter;

    public OrderService(
            CustomerOrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            ProductRepository productRepository,
            CustomerRepository customerRepository,
            GuestLookupRateLimiter guestLookupRateLimiter) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.guestLookupRateLimiter = guestLookupRateLimiter;
    }

    @Transactional
    public CustomerOrder createOrder(
            String customerName,
            String phone,
            String email,
            String deliveryAddress,
            List<OrderRequestItem> requestedItems,
            AuthUser actor) {

        if (customerName == null || customerName.isBlank()
                || phone == null || phone.isBlank()
                || deliveryAddress == null
                || deliveryAddress.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Name, phone, and delivery address are required."
            );
        }

        if (!phone.trim().matches("^[6-9]\\d{9}$")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Enter a valid 10-digit Indian mobile number."
            );
        }

        if (requestedItems == null || requestedItems.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Your order must contain at least one product."
            );
        }

        if (requestedItems.size() > MAX_ITEMS) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Orders cannot contain more than " + MAX_ITEMS + " line items."
            );
        }

        CustomerOrder order = new CustomerOrder();
        order.setCustomerName(customerName.trim());
        order.setPhone(phone.trim());

        String resolvedEmail;
        if (email != null && !email.isBlank()) {
            resolvedEmail = email.trim().toLowerCase(Locale.ROOT);
        } else if (actor != null && !"ADMIN".equalsIgnoreCase(actor.role())) {
            resolvedEmail = actor.email();
        } else {
            resolvedEmail = null;
        }

        if (resolvedEmail != null && !resolvedEmail.matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Please provide a valid email address or leave it empty."
            );
        }

        order.setEmail(resolvedEmail);
        order.setDeliveryAddress(deliveryAddress.trim());
        order.setPaymentMethod("COD");
        order.setStatus("PLACED");
        order.setStockRestored(false);
        if (actor != null && !"ADMIN".equalsIgnoreCase(actor.role())) {
            order.setCustomerId(actor.id());
        }

        order.setTotalAmount(BigDecimal.ZERO);
        order = orderRepository.save(order);

        List<OrderRequestItem> orderedRequests = requestedItems.stream()
                .sorted(Comparator.comparing(OrderRequestItem::getProductId, Comparator.nullsLast(Long::compareTo)))
                .toList();

        BigDecimal total = BigDecimal.ZERO;

        for (OrderRequestItem requestedItem : orderedRequests) {
            if (requestedItem.getProductId() == null
                    || requestedItem.getQuantity() == null
                    || requestedItem.getQuantity() <= 0
                    || requestedItem.getQuantity() > MAX_QTY) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Each product needs a valid ID and a quantity between 1 and " + MAX_QTY + "."
                );
            }

            Product product = productRepository
                    .findByIdForUpdate(requestedItem.getProductId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Product not found: " + requestedItem.getProductId()
                    ));

            if (!product.isListed()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Product is no longer available: " + product.getName()
                );
            }

            int quantity = requestedItem.getQuantity();

            if (product.getStockQuantity() == null
                    || product.getStockQuantity() < quantity) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Insufficient stock for: " + product.getName()
                );
            }

            BigDecimal unitPrice = product.getPrice();
            BigDecimal itemTotal = unitPrice.multiply(BigDecimal.valueOf(quantity));

            OrderItem item = new OrderItem();
            item.setCustomerOrder(order);
            item.setProductId(product.getId());
            item.setProductName(product.getName());
            item.setQuantity(quantity);
            item.setUnitPrice(unitPrice);
            orderItemRepository.save(item);

            product.setStockQuantity(product.getStockQuantity() - quantity);
            productRepository.save(product);

            total = total.add(itemTotal);
        }

        order.setTotalAmount(total);
        return orderRepository.save(order);
    }

    public List<CustomerOrder> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<OrderItem> getOrderItems(Long orderId) {
        if (!orderRepository.existsById(orderId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Order not found: " + orderId
            );
        }
        return orderItemRepository.findByCustomerOrderId(orderId);
    }

    public Map<String, Object> getOrderDetails(Long orderId, String phone, AuthUser actor, String clientKey) {
        CustomerOrder order = loadAccessibleOrder(orderId, phone, actor, clientKey, actor == null);
        Map<String, Object> details = toPublicView(order, true);
        details.put("customerName", order.getCustomerName());
        details.put("deliveryAddress", order.getDeliveryAddress());
        details.put("phone", order.getPhone());
        details.put("email", order.getEmail());
        return details;
    }

    public Map<String, Object> getAdminOrder(Long orderId) {
        CustomerOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Order not found: " + orderId
                ));
        Map<String, Object> view = toPublicView(order, true);
        view.put("customerName", order.getCustomerName());
        view.put("deliveryAddress", order.getDeliveryAddress());
        view.put("phone", order.getPhone());
        view.put("email", order.getEmail());
        view.put("customerId", order.getCustomerId());
        view.put("stockRestored", order.isStockRestored());
        return view;
    }

    public List<Map<String, Object>> getAdminOrders(String status, String search) {
        List<CustomerOrder> orders;
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            orders = orderRepository.findByStatusOrderByCreatedAtDesc(status.trim().toUpperCase());
        } else {
            orders = orderRepository.findAllByOrderByCreatedAtDesc();
        }

        if (search != null && !search.isBlank()) {
            String query = search.trim().toLowerCase();
            orders = orders.stream().filter(o ->
                    String.valueOf(o.getId()).contains(query)
                            || (o.getCustomerName() != null && o.getCustomerName().toLowerCase().contains(query))
                            || (o.getPhone() != null && o.getPhone().contains(query))
                            || (o.getEmail() != null && o.getEmail().toLowerCase().contains(query))
            ).toList();
        }

        return orders.stream().map(o -> {
            Map<String, Object> map = toPublicView(o, false);
            map.put("customerName", o.getCustomerName());
            map.put("deliveryAddress", o.getDeliveryAddress());
            map.put("phone", o.getPhone());
            map.put("email", o.getEmail());
            map.put("customerId", o.getCustomerId());
            map.put("stockRestored", o.isStockRestored());
            return map;
        }).toList();
    }

    @Transactional
    public CustomerOrder updateOrderStatus(Long orderId, String status) {
        CustomerOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Order not found: " + orderId
                ));

        if (status == null || status.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Order status is required"
            );
        }

        String newStatus = status.trim().toUpperCase();
        if (!ADMIN_STATUSES.contains(newStatus)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid order status: " + status
            );
        }

        if ("CANCELLED".equals(order.getStatus())) {
            if ("CANCELLED".equals(newStatus)) {
                return order;
            }
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A cancelled order cannot be changed to another status"
            );
        }

        if ("DELIVERED".equals(order.getStatus()) && !"DELIVERED".equals(newStatus)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A delivered order cannot be changed to another status"
            );
        }

        if ("CANCELLED".equals(newStatus)) {
            restoreStockOnce(order);
        }

        order.setStatus(newStatus);
        return orderRepository.save(order);
    }

    public Map<String, Object> trackOrder(Long orderId, String phone, AuthUser actor, String clientKey) {
        CustomerOrder order = loadAccessibleOrder(orderId, phone, actor, clientKey, true);
        return toPublicView(order, false);
    }

    public List<Map<String, Object>> getMyOrders(AuthUser actor) {
        if (actor == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }

        List<CustomerOrder> owned = new ArrayList<>(
                orderRepository.findByCustomerIdOrderByCreatedAtDesc(actor.id())
        );
        if (actor.email() != null) {
            orderRepository.findByEmailIgnoreCaseAndCustomerIdIsNullOrderByCreatedAtDesc(actor.email())
                    .forEach(order -> {
                        if (owned.stream().noneMatch(existing -> existing.getId().equals(order.getId()))) {
                            owned.add(order);
                        }
                    });
        }
        owned.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        return owned.stream().map(order -> {
            Map<String, Object> m = toPublicView(order, true);
            m.put("customerName", order.getCustomerName());
            m.put("deliveryAddress", order.getDeliveryAddress());
            return m;
        }).toList();
    }

    public Map<String, Object> guestLookup(Long orderId, String phone, String clientKey) {
        if (orderId == null || phone == null || phone.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Order number and phone number are required."
            );
        }
        guestLookupRateLimiter.check(clientKey);
        CustomerOrder order = loadAccessibleOrder(orderId, phone, null, clientKey, false);
        return toPublicView(order, true);
    }

    @Transactional
    public CustomerOrder cancelCustomerOrder(Long orderId, String phone, AuthUser actor, String clientKey) {
        CustomerOrder order = loadAccessibleOrder(orderId, phone, actor, clientKey, actor == null);

        if (!CUSTOMER_CANCELLABLE.contains(order.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This order can no longer be cancelled by the customer."
            );
        }

        return updateOrderStatus(orderId, "CANCELLED");
    }

    public Map<String, Object> getAdminDashboardStats() {
        long totalProducts = productRepository.count();
        long totalOrders = orderRepository.count();
        long registeredCustomers = customerRepository.count();

        List<CustomerOrder> allOrders = orderRepository.findAllByOrderByCreatedAtDesc();

        BigDecimal totalSales = BigDecimal.ZERO;
        Map<String, Long> statusCounts = new LinkedHashMap<>();
        for (String s : ADMIN_STATUSES) {
            statusCounts.put(s, 0L);
        }

        for (CustomerOrder o : allOrders) {
            String s = o.getStatus();
            statusCounts.put(s, statusCounts.getOrDefault(s, 0L) + 1);
            if (!"CANCELLED".equalsIgnoreCase(s) && o.getTotalAmount() != null) {
                totalSales = totalSales.add(o.getTotalAmount());
            }
        }

        List<Product> lowStockProducts = productRepository.findByStockQuantityLessThanEqualAndListedTrue(10);

        List<Map<String, Object>> recentOrders = allOrders.stream()
                .limit(10)
                .map(o -> {
                    Map<String, Object> m = toPublicView(o, false);
                    m.put("customerName", o.getCustomerName());
                    m.put("customerId", o.getCustomerId());
                    return m;
                })
                .toList();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalProducts", totalProducts);
        stats.put("totalOrders", totalOrders);
        stats.put("registeredCustomers", registeredCustomers);
        stats.put("totalSales", totalSales);
        stats.put("statusCounts", statusCounts);
        stats.put("lowStockCount", lowStockProducts.size());
        stats.put("lowStockProducts", lowStockProducts);
        stats.put("recentOrders", recentOrders);

        return stats;
    }

    private CustomerOrder loadAccessibleOrder(
            Long orderId,
            String phone,
            AuthUser actor,
            String clientKey,
            boolean rateLimitGuest) {

        CustomerOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        if (actor != null) {
            if ("ADMIN".equalsIgnoreCase(actor.role()) || owns(order, actor)) {
                return order;
            }
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");
        }

        if (rateLimitGuest) {
            guestLookupRateLimiter.check(clientKey);
        }

        if (phone == null || phone.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phone number is required");
        }

        if (order.getPhone() == null || !order.getPhone().trim().equals(phone.trim())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");
        }
        return order;
    }

    private boolean owns(CustomerOrder order, AuthUser actor) {
        if (order.getCustomerId() != null) {
            return Objects.equals(order.getCustomerId(), actor.id());
        }
        return actor.email() != null
                && order.getEmail() != null
                && actor.email().equalsIgnoreCase(order.getEmail());
    }

    private void restoreStockOnce(CustomerOrder order) {
        if (order.isStockRestored()) {
            return;
        }

        List<OrderItem> items = orderItemRepository.findByCustomerOrderId(order.getId());
        List<OrderItem> sorted = items.stream()
                .sorted(Comparator.comparing(OrderItem::getProductId))
                .toList();

        for (OrderItem item : sorted) {
            Product product = productRepository.findByIdForUpdate(item.getProductId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Product not found: " + item.getProductId()
                    ));
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepository.save(product);
        }

        order.setStockRestored(true);
    }

    private Map<String, Object> toPublicView(CustomerOrder order, boolean includeItems) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("orderId", order.getId());
        result.put("id", order.getId());
        result.put("status", order.getStatus());
        result.put("createdAt", order.getCreatedAt());
        result.put("totalAmount", order.getTotalAmount());
        result.put("paymentMethod", order.getPaymentMethod());
        if (includeItems) {
            List<Map<String, Object>> items = orderItemRepository.findByCustomerOrderId(order.getId())
                    .stream()
                    .map(item -> {
                        Map<String, Object> row = new LinkedHashMap<>();
                        row.put("productName", item.getProductName());
                        row.put("quantity", item.getQuantity());
                        row.put("unitPrice", item.getUnitPrice());
                        return row;
                    })
                    .toList();
            result.put("items", items);
        }
        return result;
    }

    public static class OrderRequestItem {
        private Long productId;
        private Integer quantity;

        public OrderRequestItem() {
        }

        public Long getProductId() {
            return productId;
        }

        public void setProductId(Long productId) {
            this.productId = productId;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
    }
}
