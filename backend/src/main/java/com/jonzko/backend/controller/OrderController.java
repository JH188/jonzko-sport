package com.jonzko.backend.controller;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jonzko.backend.dto.OrderRequest;
import com.jonzko.backend.dto.OrderResponse;
import com.jonzko.backend.dto.UpdateOrderStatusRequest;
import com.jonzko.backend.dto.UpdatePaymentStatusRequest;
import com.jonzko.backend.entity.Order;
import com.jonzko.backend.entity.OrderItem;
import com.jonzko.backend.entity.Payment;
import com.jonzko.backend.entity.Product;
import com.jonzko.backend.entity.User;
import com.jonzko.backend.repository.OrderRepository;
import com.jonzko.backend.repository.PaymentRepository;
import com.jonzko.backend.repository.ProductRepository;
import com.jonzko.backend.repository.UserRepository;
import com.jonzko.backend.service.AdminNotificationEmailService;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:4200")
public class OrderController {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final PaymentRepository paymentRepository;
    private final AdminNotificationEmailService adminNotificationEmailService;

    public OrderController(
            OrderRepository orderRepository,
            UserRepository userRepository,
            ProductRepository productRepository,
            PaymentRepository paymentRepository,
            AdminNotificationEmailService adminNotificationEmailService
    ) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.paymentRepository = paymentRepository;
        this.adminNotificationEmailService = adminNotificationEmailService;
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest request) {

        if (request.getItems() == null || request.getItems().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "El pedido no tiene productos"));
        }

        User user = null;

        if (request.getUserId() != null) {
            user = userRepository.findById(request.getUserId()).orElse(null);
        }

        String orderCode = generateOrderCode();

        Order order = Order.builder()
                .orderCode(orderCode)
                .user(user)
                .customerName(request.getCustomerName())
                .customerEmail(request.getCustomerEmail())
                .customerPhone(request.getCustomerPhone())
                .department(request.getDepartment())
                .province(request.getProvince())
                .district(request.getDistrict())
                .address(request.getAddress())
                .referenceText(request.getReferenceText())
                .subtotal(BigDecimal.valueOf(request.getSubtotal()))
                .deliveryCost(BigDecimal.valueOf(request.getDeliveryCost()))
                .total(BigDecimal.valueOf(request.getTotal()))
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus("PENDIENTE")
                .orderStatus("PENDIENTE_CONFIRMACION")
                .userType(request.getUserType() != null ? request.getUserType() : "INVITADO")
                .build();

        List<OrderItem> items = request.getItems().stream().map(itemRequest -> {
            Product product = null;

            if (itemRequest.getProductId() != null) {
                product = productRepository.findById(itemRequest.getProductId()).orElse(null);
            }

            BigDecimal unitPrice = BigDecimal.valueOf(itemRequest.getPrice());
            BigDecimal quantity = BigDecimal.valueOf(itemRequest.getQuantity());
            BigDecimal subtotal = unitPrice.multiply(quantity);

            return OrderItem.builder()
                    .order(order)
                    .product(product)
                    .productName(itemRequest.getProductName())
                    .unitPrice(unitPrice)
                    .quantity(itemRequest.getQuantity())
                    .subtotal(subtotal)
                    .build();
        }).toList();

        order.setItems(items);

        Order savedOrder = orderRepository.save(order);

        Payment payment = Payment.builder()
                .order(savedOrder)
                .method(request.getPaymentMethod())
                .status("PENDIENTE")
                .amount(savedOrder.getTotal())
                .build();

        paymentRepository.save(payment);

        // Enviar correo automático al administrador
        adminNotificationEmailService.enviarNuevoPedido(savedOrder);

        return ResponseEntity.ok(OrderResponse.fromEntity(savedOrder));
    }

    @GetMapping
    public ResponseEntity<?> getAllOrders() {
        return ResponseEntity.ok(
                orderRepository.findAll()
                        .stream()
                        .map(OrderResponse::fromEntity)
                        .toList()
        );
    }

    @GetMapping("/user/{email}")
    public ResponseEntity<?> getOrdersByUserEmail(@PathVariable String email) {
        return ResponseEntity.ok(
                orderRepository.findByCustomerEmailOrderByCreatedAtDesc(email)
                        .stream()
                        .map(OrderResponse::fromEntity)
                        .toList()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        Order order = orderRepository.findById(id).orElse(null);

        if (order == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Pedido no encontrado"));
        }

        return ResponseEntity.ok(OrderResponse.fromEntity(order));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody UpdateOrderStatusRequest request
    ) {
        Order order = orderRepository.findById(id).orElse(null);

        if (order == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Pedido no encontrado"));
        }

        if (request.getOrderStatus() == null || request.getOrderStatus().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "El estado del pedido es obligatorio"));
        }

        order.setOrderStatus(request.getOrderStatus());
        Order updatedOrder = orderRepository.save(order);

        return ResponseEntity.ok(OrderResponse.fromEntity(updatedOrder));
    }

    @PutMapping("/{id}/payment-status")
    public ResponseEntity<?> updatePaymentStatus(
            @PathVariable Long id,
            @RequestBody UpdatePaymentStatusRequest request
    ) {
        Order order = orderRepository.findById(id).orElse(null);

        if (order == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Pedido no encontrado"));
        }

        if (request.getPaymentStatus() == null || request.getPaymentStatus().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "El estado del pago es obligatorio"));
        }

        order.setPaymentStatus(request.getPaymentStatus());
        Order updatedOrder = orderRepository.save(order);

        Payment payment = paymentRepository.findByOrderId(id).orElse(null);

        if (payment != null) {
            payment.setStatus(request.getPaymentStatus());

            if ("CONFIRMADO".equalsIgnoreCase(request.getPaymentStatus())) {
                payment.setConfirmedAt(java.time.LocalDateTime.now());
            }

            paymentRepository.save(payment);
        }

        return ResponseEntity.ok(OrderResponse.fromEntity(updatedOrder));
    }

    private String generateOrderCode() {
        long count = orderRepository.count() + 1;
        return String.format("JZK-%04d", count);
    }
}