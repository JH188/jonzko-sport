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

    // ==========================
    // IDENTIDAD DE MARCA
    // ==========================

    @Column(nullable = false)
    private String storeName;

    private String slogan;

    @Column(length = 800)
    private String logoUrl;

    @Column(length = 800)
    private String heroImageUrl;

    // ==========================
    // INICIO / HERO ANTIGUO
    // ==========================

    private String heroTitle;

    @Column(length = 1500)
    private String heroDescription;

    private String primaryButtonText;
    private String secondaryButtonText;

    // ==========================
    // COLORES
    // ==========================

    private String primaryColor;
    private String secondaryColor;
    private String accentColor;
    private String backgroundColor;
    private String textColor;

    // ==========================
    // REDES Y ENLACES
    // ==========================

    @Column(length = 800)
    private String instagramUrl;

    @Column(length = 800)
    private String facebookUrl;

    @Column(length = 800)
    private String tiktokUrl;

    @Column(length = 100)
    private String whatsappNumber;

    @Column(length = 800)
    private String whatsappMessage;

    // ==========================
    // TEXTOS GENERALES
    // ==========================

    private String collectionTitle;

    @Column(length = 1500)
    private String collectionDescription;

    private String contactTitle;

    @Column(length = 1500)
    private String contactDescription;

    // ==========================
    // NAVEGACIÓN Y HEADER
    // ==========================

    private String navInicio;
    private String navProducto;
    private String navNosotros;
    private String navContacto;
    private String cartText;
    private String loginText;

    // ==========================
    // NOSOTROS / GALERÍA
    // ==========================

    private String aboutTag;

    @Column(length = 500)
    private String aboutTitle;

    @Column(length = 2000)
    private String aboutText;

    private String aboutButtonText;

    @Column(length = 500)
    private String aboutButtonLink;

    private String aboutFeature1Icon;
    private String aboutFeature1Title;
    private String aboutFeature1Text;

    private String aboutFeature2Icon;
    private String aboutFeature2Title;
    private String aboutFeature2Text;

    private String aboutFeature3Icon;
    private String aboutFeature3Title;
    private String aboutFeature3Text;

    private String aboutFeature4Icon;
    private String aboutFeature4Title;
    private String aboutFeature4Text;

    @Column(length = 800)
    private String aboutImage1Url;

    @Column(length = 800)
    private String aboutImage2Url;

    @Column(length = 800)
    private String aboutImage3Url;

    private String galleryTag;

    @Column(length = 500)
    private String galleryTitle;

    @Column(length = 1500)
    private String galleryText;

    @Column(length = 800)
    private String galleryImage1Url;

    @Column(length = 800)
    private String galleryImage2Url;

    @Column(length = 800)
    private String galleryImage3Url;

    @Column(length = 800)
    private String galleryImage4Url;

    @Column(length = 800)
    private String galleryVideoUrl;

    private Boolean aboutGalleryEnabled;

    // ==========================
    // ESTADO Y FECHAS
    // ==========================

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

        if (this.aboutGalleryEnabled == null) {
            this.aboutGalleryEnabled = true;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}