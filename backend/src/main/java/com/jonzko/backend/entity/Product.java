package com.jonzko.backend.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String category;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Precio actual/oferta: ejemplo 59.90
    private BigDecimal price;

    // Precio anterior: ejemplo 65.00
    @Column(name = "old_price")
    private BigDecimal oldPrice;

    // Color del producto: Negro, Blanco, etc.
    private String color;

    // Tallas disponibles guardadas como texto: XS,S,M,L,XL
    private String sizes;

    // Tipo de venta: Catálogo por pedido / Stock real
    @Column(name = "sale_type")
    private String saleType;

    private Integer stock;

    @Column(name = "image_url")
    private String imageUrl;

    private Boolean active;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false)
    private LocalDateTime updatedAt;
}