package com.jonzko.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.jonzko.backend.dto.SiteSettingRequest;
import com.jonzko.backend.entity.SiteSetting;
import com.jonzko.backend.repository.SiteSettingRepository;

@RestController
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

    // ==========================
    // PUBLICO: la web lee configuración
    // ==========================
    @GetMapping("/api/settings")
    public ResponseEntity<SiteSetting> getSettings() {
        SiteSetting settings = siteSettingRepository
                .findFirstByActiveTrueOrderByIdAsc()
                .orElseGet(this::createDefaultSettings);

        return ResponseEntity.ok(settings);
    }

    // ==========================
    // ADMIN: el panel guarda configuración
    // ==========================
    @PutMapping("/api/admin/settings")
    public ResponseEntity<SiteSetting> updateSettings(@RequestBody SiteSettingRequest request) {
        SiteSetting settings = siteSettingRepository
                .findFirstByActiveTrueOrderByIdAsc()
                .orElseGet(this::createDefaultSettings);

        // Identidad
        settings.setStoreName(request.getStoreName());
        settings.setSlogan(request.getSlogan());
        settings.setLogoUrl(request.getLogoUrl());
        settings.setHeroImageUrl(request.getHeroImageUrl());

        // Hero / inicio antiguo
        settings.setHeroTitle(request.getHeroTitle());
        settings.setHeroDescription(request.getHeroDescription());
        settings.setPrimaryButtonText(request.getPrimaryButtonText());
        settings.setSecondaryButtonText(request.getSecondaryButtonText());

        // Colores
        settings.setPrimaryColor(request.getPrimaryColor());
        settings.setSecondaryColor(request.getSecondaryColor());
        settings.setAccentColor(request.getAccentColor());
        settings.setBackgroundColor(request.getBackgroundColor());
        settings.setTextColor(request.getTextColor());

        // Redes
        settings.setInstagramUrl(request.getInstagramUrl());
        settings.setFacebookUrl(request.getFacebookUrl());
        settings.setTiktokUrl(request.getTiktokUrl());
        settings.setWhatsappNumber(request.getWhatsappNumber());
        settings.setWhatsappMessage(request.getWhatsappMessage());

        // Colección / contacto
        settings.setCollectionTitle(request.getCollectionTitle());
        settings.setCollectionDescription(request.getCollectionDescription());
        settings.setContactTitle(request.getContactTitle());
        settings.setContactDescription(request.getContactDescription());

        // Navegación
        settings.setNavInicio(request.getNavInicio());
        settings.setNavProducto(request.getNavProducto());
        settings.setNavNosotros(request.getNavNosotros());
        settings.setNavContacto(request.getNavContacto());
        settings.setCartText(request.getCartText());
        settings.setLoginText(request.getLoginText());

        // Nosotros
        settings.setAboutTag(request.getAboutTag());
        settings.setAboutTitle(request.getAboutTitle());
        settings.setAboutText(request.getAboutText());
        settings.setAboutButtonText(request.getAboutButtonText());
        settings.setAboutButtonLink(request.getAboutButtonLink());

        settings.setAboutFeature1Icon(request.getAboutFeature1Icon());
        settings.setAboutFeature1Title(request.getAboutFeature1Title());
        settings.setAboutFeature1Text(request.getAboutFeature1Text());

        settings.setAboutFeature2Icon(request.getAboutFeature2Icon());
        settings.setAboutFeature2Title(request.getAboutFeature2Title());
        settings.setAboutFeature2Text(request.getAboutFeature2Text());

        settings.setAboutFeature3Icon(request.getAboutFeature3Icon());
        settings.setAboutFeature3Title(request.getAboutFeature3Title());
        settings.setAboutFeature3Text(request.getAboutFeature3Text());

        settings.setAboutFeature4Icon(request.getAboutFeature4Icon());
        settings.setAboutFeature4Title(request.getAboutFeature4Title());
        settings.setAboutFeature4Text(request.getAboutFeature4Text());

        settings.setAboutImage1Url(request.getAboutImage1Url());
        settings.setAboutImage2Url(request.getAboutImage2Url());
        settings.setAboutImage3Url(request.getAboutImage3Url());

        // Galería
        settings.setGalleryTag(request.getGalleryTag());
        settings.setGalleryTitle(request.getGalleryTitle());
        settings.setGalleryText(request.getGalleryText());

        settings.setGalleryImage1Url(request.getGalleryImage1Url());
        settings.setGalleryImage2Url(request.getGalleryImage2Url());
        settings.setGalleryImage3Url(request.getGalleryImage3Url());
        settings.setGalleryImage4Url(request.getGalleryImage4Url());
        settings.setGalleryVideoUrl(request.getGalleryVideoUrl());

        settings.setAboutGalleryEnabled(request.getAboutGalleryEnabled());

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

                .aboutTag("SOBRE NOSOTROS")
                .aboutTitle("Más que ropa, es actitud.")
                .aboutText("JONZKO creado con la idea de que todos podemos vestirnos con estilo y actitud.")
                .aboutButtonText("CONÓCENOS MÁS")
                .aboutButtonLink("#nosotros")

                .aboutFeature1Icon("◇")
                .aboutFeature1Title("CALIDAD")
                .aboutFeature1Text("A1")

                .aboutFeature2Icon("♛")
                .aboutFeature2Title("DISEÑOS")
                .aboutFeature2Text("EXCLUSIVO Y BÁSICOS")

                .aboutFeature3Icon("▣")
                .aboutFeature3Title("OVERSIZE")
                .aboutFeature3Text("A1")

                .aboutFeature4Icon("⊙")
                .aboutFeature4Title("COMUNIDAD")
                .aboutFeature4Text("JONZKO")

                .aboutImage1Url("")
                .aboutImage2Url("")
                .aboutImage3Url("")

                .galleryTag("ESTILO JONZKO")
                .galleryTitle("Diseños que hablan por ti.")
                .galleryText("Mira más detalles de nuestras prendas, estilo urbano y contenido de la marca.")

                .galleryImage1Url("")
                .galleryImage2Url("")
                .galleryImage3Url("")
                .galleryImage4Url("")
                .galleryVideoUrl("")

                .aboutGalleryEnabled(true)

                .active(true)
                .build();

        return siteSettingRepository.save(defaultSettings);
    }
}