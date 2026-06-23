package com.jonzko.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminVerifyCodeRequest {

    private String email;
    private String code;
}