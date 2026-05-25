package com.jonzko.backend.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "customer_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private String customerName;

    private String customerEmail;

    private String customerPhone;

    private String documentType;

    private String documentNumber;

    private String department;

    private String province;

    private String district;

    private String address;

    @Column(columnDefinition = "TEXT")
    private String referenceText;

    private String paymentMethod;

    private String orderStatus;

    private BigDecimal total;

    @Column(columnDefinition = "TEXT")
    private String itemsJson;

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