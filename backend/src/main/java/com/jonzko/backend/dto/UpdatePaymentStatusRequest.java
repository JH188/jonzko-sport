package com.jonzko.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdatePaymentStatusRequest {

    private String paymentStatus;
}