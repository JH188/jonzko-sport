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

    @Column(name = "store_name", nullable = false)
    private String storeName;

    @Column(name = "slogan")
    private String slogan;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "hero_image_url")
    private String heroImageUrl;

    // ==========================
    // INICIO / HERO ANTIGUO
    // ==========================

    @Column(name = "hero_title")
    private String heroTitle;

    @Column(name = "hero_description")
    private String heroDescription;

    @Column(name = "primary_button_text")
    private String primaryButtonText;

    @Column(name = "secondary_button_text")
    private String secondaryButtonText;

    // ==========================
    // COLORES
    // ==========================

    @Column(name = "primary_color")
    private String primaryColor;

    @Column(name = "secondary_color")
    private String secondaryColor;

    @Column(name = "accent_color")
    private String accentColor;

    @Column(name = "background_color")
    private String backgroundColor;

    @Column(name = "text_color")
    private String textColor;

    // ==========================
    // REDES Y ENLACES
    // ==========================

    @Column(name = "instagram_url")
    private String instagramUrl;

    @Column(name = "facebook_url")
    private String facebookUrl;

    @Column(name = "tiktok_url")
    private String tiktokUrl;

    @Column(name = "whatsapp_number")
    private String whatsappNumber;

    @Column(name = "whatsapp_message")
    private String whatsappMessage;

    // ==========================
    // TEXTOS GENERALES
    // ==========================

    @Column(name = "collection_title")
    private String collectionTitle;

    @Column(name = "collection_description")
    private String collectionDescription;

    @Column(name = "contact_title")
    private String contactTitle;

    @Column(name = "contact_description")
    private String contactDescription;

    // ==========================
    // NAVEGACIÓN Y HEADER
    // ==========================

    @Column(name = "nav_inicio")
    private String navInicio;

    @Column(name = "nav_producto")
    private String navProducto;

    @Column(name = "nav_nosotros")
    private String navNosotros;

    @Column(name = "nav_contacto")
    private String navContacto;

    @Column(name = "cart_text")
    private String cartText;

    @Column(name = "login_text")
    private String loginText;

    // ==========================
    // NOSOTROS / GALERÍA
    // ==========================

    @Column(name = "about_tag")
    private String aboutTag;

    @Column(name = "about_title")
    private String aboutTitle;

    @Column(name = "about_text")
    private String aboutText;

    @Column(name = "about_button_text")
    private String aboutButtonText;

    @Column(name = "about_button_link")
    private String aboutButtonLink;

    @Column(name = "about_feature1_icon")
    private String aboutFeature1Icon;

    @Column(name = "about_feature1_title")
    private String aboutFeature1Title;

    @Column(name = "about_feature1_text")
    private String aboutFeature1Text;

    @Column(name = "about_feature2_icon")
    private String aboutFeature2Icon;

    @Column(name = "about_feature2_title")
    private String aboutFeature2Title;

    @Column(name = "about_feature2_text")
    private String aboutFeature2Text;

    @Column(name = "about_feature3_icon")
    private String aboutFeature3Icon;

    @Column(name = "about_feature3_title")
    private String aboutFeature3Title;

    @Column(name = "about_feature3_text")
    private String aboutFeature3Text;

    @Column(name = "about_feature4_icon")
    private String aboutFeature4Icon;

    @Column(name = "about_feature4_title")
    private String aboutFeature4Title;

    @Column(name = "about_feature4_text")
    private String aboutFeature4Text;

    @Column(name = "about_image1_url")
    private String aboutImage1Url;

    @Column(name = "about_image2_url")
    private String aboutImage2Url;

    @Column(name = "about_image3_url")
    private String aboutImage3Url;

    @Column(name = "gallery_tag")
    private String galleryTag;

    @Column(name = "gallery_title")
    private String galleryTitle;

    @Column(name = "gallery_text")
    private String galleryText;

    @Column(name = "gallery_image1_url")
    private String galleryImage1Url;

    @Column(name = "gallery_image2_url")
    private String galleryImage2Url;

    @Column(name = "gallery_image3_url")
    private String galleryImage3Url;

    @Column(name = "gallery_image4_url")
    private String galleryImage4Url;

    @Column(name = "gallery_video_url")
    private String galleryVideoUrl;

    @Column(name = "about_gallery_enabled")
    private Boolean aboutGalleryEnabled;

    // ==========================
    // ESTADO Y FECHAS
    // ==========================

    @Column(name = "active")
    private Boolean active;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
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