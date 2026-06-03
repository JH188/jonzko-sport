package com.jonzko.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jonzko.backend.dto.SiteSettingRequest;
import com.jonzko.backend.entity.SiteSetting;
import com.jonzko.backend.repository.SiteSettingRepository;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = {
        "http://localhost:4200",
        "https://jonzko.lat",
        "https://www.jonzko.lat",
        "https://jonzko-sport.vercel.app"
})
public class SiteSettingController {

    private final SiteSettingRepository siteSettingRepository;

    public SiteSettingController(SiteSettingRepository siteSettingRepository) {
        this.siteSettingRepository = siteSettingRepository;
    }

    // Obtener configuración actual de la tienda
    @GetMapping
    public ResponseEntity<SiteSetting> getSettings() {
        SiteSetting settings = siteSettingRepository
                .findFirstByActiveTrueOrderByIdAsc()
                .orElseGet(this::createDefaultSettings);

        return ResponseEntity.ok(settings);
    }

    // Actualizar configuración desde el administrador
    @PutMapping
    public ResponseEntity<SiteSetting> updateSettings(@RequestBody SiteSettingRequest request) {
        SiteSetting settings = siteSettingRepository
                .findFirstByActiveTrueOrderByIdAsc()
                .orElseGet(this::createDefaultSettings);

        settings.setStoreName(request.getStoreName());
        settings.setSlogan(request.getSlogan());
        settings.setLogoUrl(request.getLogoUrl());
        settings.setHeroImageUrl(request.getHeroImageUrl());

        settings.setHeroTitle(request.getHeroTitle());
        settings.setHeroDescription(request.getHeroDescription());
        settings.setPrimaryButtonText(request.getPrimaryButtonText());
        settings.setSecondaryButtonText(request.getSecondaryButtonText());

        settings.setPrimaryColor(request.getPrimaryColor());
        settings.setSecondaryColor(request.getSecondaryColor());
        settings.setAccentColor(request.getAccentColor());
        settings.setBackgroundColor(request.getBackgroundColor());
        settings.setTextColor(request.getTextColor());

        settings.setInstagramUrl(request.getInstagramUrl());
        settings.setFacebookUrl(request.getFacebookUrl());
        settings.setTiktokUrl(request.getTiktokUrl());
        settings.setWhatsappNumber(request.getWhatsappNumber());
        settings.setWhatsappMessage(request.getWhatsappMessage());

        settings.setCollectionTitle(request.getCollectionTitle());
        settings.setCollectionDescription(request.getCollectionDescription());
        settings.setContactTitle(request.getContactTitle());
        settings.setContactDescription(request.getContactDescription());
        settings.setNavInicio(request.getNavInicio());
settings.setNavProducto(request.getNavProducto());
settings.setNavNosotros(request.getNavNosotros());
settings.setNavContacto(request.getNavContacto());
settings.setCartText(request.getCartText());
settings.setLoginText(request.getLoginText());

        SiteSetting savedSettings = siteSettingRepository.save(settings);

        return ResponseEntity.ok(savedSettings);
    }

    private SiteSetting createDefaultSettings() {
        SiteSetting defaultSettings = SiteSetting.builder()
                .storeName("JONZKO")
                .slogan("Ropa urbana peruana")
                .logoUrl("assets/logo.png")
                .heroImageUrl("assets/polera.jpg")

                .heroTitle("JONZKO")
                .heroDescription("Ropa urbana con presencia, estilo y visión empresarial.")
                .primaryButtonText("Comprar ahora")
                .secondaryButtonText("Ver colección")

                .primaryColor("#000000")
                .secondaryColor("#ffffff")
                .accentColor("#d6b14a")
                .backgroundColor("#f4f4f4")
                .textColor("#111111")

                .instagramUrl("https://www.instagram.com/jonzko.o/")
                .facebookUrl("https://www.facebook.com/profile.php?id=61563952841904")
                .tiktokUrl("https://www.tiktok.com/@jonzko1")
                .whatsappNumber("")
                .whatsappMessage("Hola, quiero información sobre JONZKO.")

                .collectionTitle("Nuestro Producto")
                .collectionDescription("Los primeros productos oficiales de JONZKO.")
                .contactTitle("Contacto")
                .contactDescription("Comunícate con nosotros para compras, consultas y pedidos.")
                .navInicio("Inicio")
.navProducto("Producto")
.navNosotros("Nosotros")
.navContacto("Contacto")
.cartText("Carrito")
.loginText("Iniciar sesión")

                .active(true)
                .build();

        return siteSettingRepository.save(defaultSettings);
    }
}