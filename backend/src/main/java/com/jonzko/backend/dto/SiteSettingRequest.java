package com.jonzko.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SiteSettingRequest {

    // Identidad de marca
    private String storeName;
    private String slogan;
    private String logoUrl;
    private String heroImageUrl;

    // Inicio / hero antiguo
    private String heroTitle;
    private String heroDescription;
    private String primaryButtonText;
    private String secondaryButtonText;

    // Colores
    private String primaryColor;
    private String secondaryColor;
    private String accentColor;
    private String backgroundColor;
    private String textColor;

    // Redes
    private String instagramUrl;
    private String facebookUrl;
    private String tiktokUrl;
    private String whatsappNumber;
    private String whatsappMessage;

    // Textos generales
    private String collectionTitle;
    private String collectionDescription;
    private String contactTitle;
    private String contactDescription;

    // Navegación
    private String navInicio;
    private String navProducto;
    private String navNosotros;
    private String navContacto;
    private String cartText;
    private String loginText;

    // Nosotros / Galería
    private String aboutTag;
    private String aboutTitle;
    private String aboutText;
    private String aboutButtonText;
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

    private String aboutImage1Url;
    private String aboutImage2Url;
    private String aboutImage3Url;

    private String galleryTag;
    private String galleryTitle;
    private String galleryText;

    private String galleryImage1Url;
    private String galleryImage2Url;
    private String galleryImage3Url;
    private String galleryImage4Url;
    private String galleryVideoUrl;

    private Boolean aboutGalleryEnabled;

    private Boolean active;
}