package com.jonzko.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.jonzko.backend.entity.Order;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OrderResponse {

    private Long id;
    private String orderCode;

    private String customerName;
    private String customerEmail;
    private String customerPhone;

    private String department;
    private String province;
    private String district;
    private String address;
    private String referenceText;

    private BigDecimal subtotal;
    private BigDecimal deliveryCost;
    private BigDecimal total;

    private String paymentMethod;
    private String paymentStatus;
    private String orderStatus;
    private String userType;

    private LocalDateTime createdAt;

    public static OrderResponse fromEntity(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .customerName(order.getCustomerName())
                .customerEmail(order.getCustomerEmail())
                .customerPhone(order.getCustomerPhone())
                .department(order.getDepartment())
                .province(order.getProvince())
                .district(order.getDistrict())
                .address(order.getAddress())
                .referenceText(order.getReferenceText())
                .subtotal(order.getSubtotal())
                .deliveryCost(order.getDeliveryCost())
                .total(order.getTotal())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .orderStatus(order.getOrderStatus())
                .userType(order.getUserType())
                .createdAt(order.getCreatedAt())
                .build();
    }
}