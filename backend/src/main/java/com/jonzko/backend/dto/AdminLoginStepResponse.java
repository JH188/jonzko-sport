package com.jonzko.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class AdminLoginStepResponse {

    private String message;
    private boolean requiresCode;
    private String email;
}