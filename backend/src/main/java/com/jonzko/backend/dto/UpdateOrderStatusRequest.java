package com.jonzko.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateOrderStatusRequest {

    private String orderStatus;
}