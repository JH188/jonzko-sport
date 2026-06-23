package com.jonzko.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "admin_password_change_codes")
@Getter
@Setter
@NoArgsConstructor
public class AdminPasswordChangeCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;

    private String code;

    private Boolean used = false;

    private LocalDateTime expiresAt;

    private LocalDateTime createdAt;
}