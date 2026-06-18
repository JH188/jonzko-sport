package com.jonzko.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetPasswordRequest {

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "Ingrese un correo válido")
    private String email;

    @NotBlank(message = "El código es obligatorio")
    @Pattern(regexp = "^\\d{6}$", message = "El código debe tener 6 dígitos")
    private String code;

    @NotBlank(message = "La nueva contraseña es obligatoria")
    @Size(min = 6, message = "La contraseña debe tener mínimo 6 caracteres")
    private String newPassword;

    @NotBlank(message = "Debe confirmar la contraseña")
    private String confirmPassword;
}