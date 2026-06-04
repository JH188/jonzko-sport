package com.jonzko.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AdminLoginResponse {

    private String token;
    private String role;
    private String fullName;
    private String email;
}