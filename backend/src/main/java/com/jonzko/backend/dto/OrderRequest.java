package com.jonzko.backend.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderRequest {

    private Long userId;

    private String customerName;
    private String customerEmail;
    private String customerPhone;

    private String department;
    private String province;
    private String district;
    private String address;
    private String referenceText;

    private Double subtotal;
    private Double deliveryCost;
    private Double total;

    private String paymentMethod;
    private String userType;

    private List<OrderItemRequest> items;
}