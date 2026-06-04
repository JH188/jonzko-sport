package com.jonzko.backend.entity;

import java.time.LocalDateTime;
import java.time.ZoneId;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nombre completo obligatorio
    @NotBlank(message = "El nombre completo es obligatorio")
    @Size(min = 3, max = 120, message = "El nombre debe tener entre 3 y 120 caracteres")
    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    // Correo obligatorio y válido
    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "Ingrese un correo válido")
    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    // Celular peruano: 9 dígitos y empieza con 9
    @NotBlank(message = "El celular es obligatorio")
    @Pattern(regexp = "^9\\d{8}$", message = "El celular debe tener 9 dígitos y empezar con 9")
    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    // Contraseña obligatoria
    // IMPORTANTE: No se devuelve en respuestas JSON
    @JsonIgnore
    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, message = "La contraseña debe tener mínimo 6 caracteres")
    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "active")
    private Boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("America/Lima"));
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now(ZoneId.of("America/Lima"));
    }
}