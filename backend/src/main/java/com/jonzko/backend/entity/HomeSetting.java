package com.jonzko.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "home_settings")
@Getter
@Setter
@NoArgsConstructor
public class HomeSetting {

    @Id
    private Long id = 1L;

    // LOGO / MARCA
    private String storeName;
    private String logoUrl;

    // BARRA NEGRA SUPERIOR
    @Column(columnDefinition = "TEXT")
    private String topBarText;

    // MENÚ
    private String menuInicio;
    private String menuTienda;
    private String menuExclusivo;
    private String menuNosotros;
    private String menuContacto;
    private String menuMisPedidos;

    // HERO PRINCIPAL
    private String heroTag;
    private String heroTitle;
    private String heroButtonText;
    private String heroButtonLink;

    // WHATSAPP FLOTANTE
    private String whatsappNumber;
    private Boolean whatsappEnabled = true;

    // CONTROL
    private Boolean active = true;

    private LocalDateTime updatedAt;
}