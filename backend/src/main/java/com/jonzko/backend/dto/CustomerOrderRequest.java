package com.jonzko.backend.dto;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomerOrderRequest {

    private Long userId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;

    private String documentType;
    private String documentNumber;

    private String department;
    private String province;
    private String district;
    private String address;
    private String referenceText;

    private String paymentMethod;

    private BigDecimal total;

    private String itemsJson;
}