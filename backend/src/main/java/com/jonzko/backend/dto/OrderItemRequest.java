package com.jonzko.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderItemRequest {

    private Long productId;
    private String productName;
    private Double price;
    private Integer quantity;
}