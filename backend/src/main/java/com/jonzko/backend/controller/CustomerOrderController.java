package com.jonzko.backend.controller;

import java.math.BigDecimal;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jonzko.backend.dto.CustomerOrderRequest;
import com.jonzko.backend.entity.CustomerOrder;
import com.jonzko.backend.repository.CustomerOrderRepository;

@RestController
@RequestMapping("/api/customer-orders")
@CrossOrigin(origins = "*")
public class CustomerOrderController {

    private final CustomerOrderRepository customerOrderRepository;

    public CustomerOrderController(CustomerOrderRepository customerOrderRepository) {
        this.customerOrderRepository = customerOrderRepository;
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody CustomerOrderRequest request) {

        if (request.getUserId() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "El usuario es obligatorio"));
        }

        if (request.getCustomerName() == null || request.getCustomerName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "El nombre del cliente es obligatorio"));
        }

        if (request.getCustomerEmail() == null || request.getCustomerEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "El correo del cliente es obligatorio"));
        }

        if (request.getCustomerPhone() == null || !request.getCustomerPhone().matches("^9\\d{8}$")) {
            return ResponseEntity.badRequest().body(Map.of("message", "El celular debe tener 9 dígitos y empezar con 9"));
        }

        if (request.getDocumentType() == null || request.getDocumentNumber() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "El comprobante es obligatorio"));
        }

        if (request.getDocumentType().equalsIgnoreCase("Boleta") && !request.getDocumentNumber().matches("^\\d{8}$")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Para boleta, el DNI debe tener 8 dígitos"));
        }

        if (request.getDocumentType().equalsIgnoreCase("Factura") && !request.getDocumentNumber().matches("^\\d{11}$")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Para factura, el RUC debe tener 11 dígitos"));
        }

        if (request.getTotal() == null || request.getTotal().compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().body(Map.of("message", "El total del pedido no es válido"));
        }

        if (request.getItemsJson() == null || request.getItemsJson().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "El pedido no tiene productos"));
        }

        CustomerOrder order = CustomerOrder.builder()
                .userId(request.getUserId())
                .customerName(request.getCustomerName().trim())
                .customerEmail(request.getCustomerEmail().trim().toLowerCase())
                .customerPhone(request.getCustomerPhone().trim())
                .documentType(request.getDocumentType())
                .documentNumber(request.getDocumentNumber().trim())
                .department(request.getDepartment())
                .province(request.getProvince())
                .district(request.getDistrict())
                .address(request.getAddress())
                .referenceText(request.getReferenceText())
                .paymentMethod(request.getPaymentMethod())
                .orderStatus("Pendiente")
                .total(request.getTotal())
                .itemsJson(request.getItemsJson())
                .build();

        CustomerOrder saved = customerOrderRepository.save(order);

        return ResponseEntity.ok(Map.of(
                "message", "Pedido registrado correctamente",
                "orderId", saved.getId(),
                "status", saved.getOrderStatus()
        ));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getOrdersByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(customerOrderRepository.findByUserIdOrderByCreatedAtDesc(userId));
    }
}