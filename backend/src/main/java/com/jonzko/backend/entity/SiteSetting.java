package com.jonzko.backend.entity;

import java.time.LocalDateTime;

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
@Table(name = "site_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SiteSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Identidad de marca
    @Column(nullable = false)
    private String storeName;

    private String slogan;

    @Column(length = 500)
    private String logoUrl;

    @Column(length = 500)
    private String heroImageUrl;

    // Inicio
    private String heroTitle;

    @Column(length = 1000)
    private String heroDescription;

    private String primaryButtonText;
    private String secondaryButtonText;

    // Colores
    private String primaryColor;
    private String secondaryColor;
    private String accentColor;
    private String backgroundColor;
    private String textColor;

    // Redes y enlaces
    @Column(length = 500)
    private String instagramUrl;

    @Column(length = 500)
    private String facebookUrl;

    @Column(length = 500)
    private String tiktokUrl;

    @Column(length = 100)
    private String whatsappNumber;

    @Column(length = 500)
    private String whatsappMessage;

    // Textos generales
    private String collectionTitle;

    @Column(length = 1000)
    private String collectionDescription;

    private String contactTitle;

    @Column(length = 1000)
    private String contactDescription;
    
    // Navegación y textos del header
private String navInicio;
private String navColeccion;
private String navNosotros;
private String navContacto;
private String cartText;
private String loginText;

    private Boolean active;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();

        if (this.active == null) {
            this.active = true;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}