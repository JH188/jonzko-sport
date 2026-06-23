package com.jonzko.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminPasswordChangeRequest {

    private String currentPassword;
    private String newPassword;
    private String confirmPassword;
    private String code;
}