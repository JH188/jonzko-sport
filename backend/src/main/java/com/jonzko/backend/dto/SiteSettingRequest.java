package com.jonzko.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SiteSettingRequest {

    private String storeName;
    private String slogan;
    private String logoUrl;
    private String heroImageUrl;

    private String heroTitle;
    private String heroDescription;
    private String primaryButtonText;
    private String secondaryButtonText;

    private String primaryColor;
    private String secondaryColor;
    private String accentColor;
    private String backgroundColor;
    private String textColor;

    private String instagramUrl;
    private String facebookUrl;
    private String tiktokUrl;
    private String whatsappNumber;
    private String whatsappMessage;

    private String collectionTitle;
    private String collectionDescription;
    private String contactTitle;
    private String contactDescription;
}