package com.jonzko.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "home_slides")
@Getter
@Setter
@NoArgsConstructor
public class HomeSlide {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // TEXTOS DEL SLIDE
    private String tagText;
    private String title;
    private String buttonText;
    private String buttonLink;

    // IMÁGENES / VIDEO
    @Column(columnDefinition = "TEXT")
    private String desktopImageUrl;

    @Column(columnDefinition = "TEXT")
    private String mobileImageUrl;

    @Column(columnDefinition = "TEXT")
    private String videoUrl;

    // POSICIÓN RESPONSIVE
    private String desktopPosition;
    private String mobilePosition;

    // ORDEN Y ESTADO
    private Integer displayOrder;
    private Boolean active = true;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}