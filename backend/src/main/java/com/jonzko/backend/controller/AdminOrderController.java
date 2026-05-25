package com.jonzko.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jonzko.backend.dto.UpdateOrderStatusRequest;
import com.jonzko.backend.entity.CustomerOrder;
import com.jonzko.backend.repository.CustomerOrderRepository;

@RestController
@RequestMapping("/api/admin/orders")
@CrossOrigin(origins = "*")
public class AdminOrderController {

    private final CustomerOrderRepository customerOrderRepository;

    public AdminOrderController(CustomerOrderRepository customerOrderRepository) {
        this.customerOrderRepository = customerOrderRepository;
    }

    @GetMapping
    public ResponseEntity<List<CustomerOrder>> listarTodosLosPedidos() {
        List<CustomerOrder> pedidos = customerOrderRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(pedidos);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> actualizarEstadoPedido(
            @PathVariable Long id,
            @RequestBody UpdateOrderStatusRequest request
    ) {
        return customerOrderRepository.findById(id)
                .map(order -> {
                    String nuevoEstado = request.getOrderStatus();

                    if (nuevoEstado == null || nuevoEstado.trim().isEmpty()) {
                        return ResponseEntity.badRequest().body("El estado no puede estar vacío.");
                    }

                    nuevoEstado = nuevoEstado.trim();

                    if (!estadoValido(nuevoEstado)) {
                        return ResponseEntity.badRequest().body("Estado no válido: " + nuevoEstado);
                    }

                    order.setOrderStatus(nuevoEstado);

                    CustomerOrder actualizado = customerOrderRepository.save(order);

                    return ResponseEntity.ok(actualizado);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private boolean estadoValido(String estado) {
        return estado.equals("Pendiente")
                || estado.equals("Confirmado")
                || estado.equals("Enviado")
                || estado.equals("Entregado")
                || estado.equals("Cancelado");
    }
}