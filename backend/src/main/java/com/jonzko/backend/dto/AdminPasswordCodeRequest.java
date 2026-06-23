package com.jonzko.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminPasswordCodeRequest {

    private String currentPassword;
}