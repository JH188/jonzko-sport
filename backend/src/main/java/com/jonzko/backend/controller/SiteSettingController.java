package com.jonzko.backend.controller;

import java.util.function.Consumer;

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

        // Identidad de marca
        setIfNotNull(request.getStoreName(), settings::setStoreName);
        setIfNotNull(request.getSlogan(), settings::setSlogan);
        setIfNotNull(request.getLogoUrl(), settings::setLogoUrl);
        setIfNotNull(request.getHeroImageUrl(), settings::setHeroImageUrl);

        // Inicio / hero antiguo
        setIfNotNull(request.getHeroTitle(), settings::setHeroTitle);
        setIfNotNull(request.getHeroDescription(), settings::setHeroDescription);
        setIfNotNull(request.getPrimaryButtonText(), settings::setPrimaryButtonText);
        setIfNotNull(request.getSecondaryButtonText(), settings::setSecondaryButtonText);

        // Colores
        setIfNotNull(request.getPrimaryColor(), settings::setPrimaryColor);
        setIfNotNull(request.getSecondaryColor(), settings::setSecondaryColor);
        setIfNotNull(request.getAccentColor(), settings::setAccentColor);
        setIfNotNull(request.getBackgroundColor(), settings::setBackgroundColor);
        setIfNotNull(request.getTextColor(), settings::setTextColor);

        // Redes
        setIfNotNull(request.getInstagramUrl(), settings::setInstagramUrl);
        setIfNotNull(request.getFacebookUrl(), settings::setFacebookUrl);
        setIfNotNull(request.getTiktokUrl(), settings::setTiktokUrl);
        setIfNotNull(request.getWhatsappNumber(), settings::setWhatsappNumber);
        setIfNotNull(request.getWhatsappMessage(), settings::setWhatsappMessage);

        // Textos generales
        setIfNotNull(request.getCollectionTitle(), settings::setCollectionTitle);
        setIfNotNull(request.getCollectionDescription(), settings::setCollectionDescription);
        setIfNotNull(request.getContactTitle(), settings::setContactTitle);
        setIfNotNull(request.getContactDescription(), settings::setContactDescription);

        // Navegación
        setIfNotNull(request.getNavInicio(), settings::setNavInicio);
        setIfNotNull(request.getNavProducto(), settings::setNavProducto);
        setIfNotNull(request.getNavNosotros(), settings::setNavNosotros);
        setIfNotNull(request.getNavContacto(), settings::setNavContacto);
        setIfNotNull(request.getCartText(), settings::setCartText);
        setIfNotNull(request.getLoginText(), settings::setLoginText);

        // Nosotros / Galería
        setIfNotNull(request.getAboutTag(), settings::setAboutTag);
        setIfNotNull(request.getAboutTitle(), settings::setAboutTitle);
        setIfNotNull(request.getAboutText(), settings::setAboutText);
        setIfNotNull(request.getAboutButtonText(), settings::setAboutButtonText);
        setIfNotNull(request.getAboutButtonLink(), settings::setAboutButtonLink);

        setIfNotNull(request.getAboutFeature1Icon(), settings::setAboutFeature1Icon);
        setIfNotNull(request.getAboutFeature1Title(), settings::setAboutFeature1Title);
        setIfNotNull(request.getAboutFeature1Text(), settings::setAboutFeature1Text);

        setIfNotNull(request.getAboutFeature2Icon(), settings::setAboutFeature2Icon);
        setIfNotNull(request.getAboutFeature2Title(), settings::setAboutFeature2Title);
        setIfNotNull(request.getAboutFeature2Text(), settings::setAboutFeature2Text);

        setIfNotNull(request.getAboutFeature3Icon(), settings::setAboutFeature3Icon);
        setIfNotNull(request.getAboutFeature3Title(), settings::setAboutFeature3Title);
        setIfNotNull(request.getAboutFeature3Text(), settings::setAboutFeature3Text);

        setIfNotNull(request.getAboutFeature4Icon(), settings::setAboutFeature4Icon);
        setIfNotNull(request.getAboutFeature4Title(), settings::setAboutFeature4Title);
        setIfNotNull(request.getAboutFeature4Text(), settings::setAboutFeature4Text);

        setIfNotNull(request.getAboutImage1Url(), settings::setAboutImage1Url);
        setIfNotNull(request.getAboutImage2Url(), settings::setAboutImage2Url);
        setIfNotNull(request.getAboutImage3Url(), settings::setAboutImage3Url);

        setIfNotNull(request.getGalleryTag(), settings::setGalleryTag);
        setIfNotNull(request.getGalleryTitle(), settings::setGalleryTitle);
        setIfNotNull(request.getGalleryText(), settings::setGalleryText);

        setIfNotNull(request.getGalleryImage1Url(), settings::setGalleryImage1Url);
        setIfNotNull(request.getGalleryImage2Url(), settings::setGalleryImage2Url);
        setIfNotNull(request.getGalleryImage3Url(), settings::setGalleryImage3Url);
        setIfNotNull(request.getGalleryImage4Url(), settings::setGalleryImage4Url);
        setIfNotNull(request.getGalleryVideoUrl(), settings::setGalleryVideoUrl);

        setBooleanIfNotNull(request.getAboutGalleryEnabled(), settings::setAboutGalleryEnabled);
        setBooleanIfNotNull(request.getActive(), settings::setActive);

        SiteSetting savedSettings = siteSettingRepository.save(settings);

        return ResponseEntity.ok(savedSettings);
    }

    private void setIfNotNull(String value, Consumer<String> setter) {
        if (value != null) {
            setter.accept(value);
        }
    }

    private void setBooleanIfNotNull(Boolean value, Consumer<Boolean> setter) {
        if (value != null) {
            setter.accept(value);
        }
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