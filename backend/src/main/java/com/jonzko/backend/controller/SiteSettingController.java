package com.jonzko.backend.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jonzko.backend.dto.SiteSettingRequest;
import com.jonzko.backend.entity.SiteSetting;
import com.jonzko.backend.entity.User;
import com.jonzko.backend.repository.SiteSettingRepository;
import com.jonzko.backend.repository.UserRepository;
import com.jonzko.backend.security.JwtService;

import io.jsonwebtoken.Claims;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {
        "https://jonzko.lat",
        "https://www.jonzko.lat",
        "https://jonzko-sport.vercel.app",
        "https://jonzko-sport-production.up.railway.app"
})
public class SiteSettingController {

    private final SiteSettingRepository siteSettingRepository;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public SiteSettingController(
            SiteSettingRepository siteSettingRepository,
            JwtService jwtService,
            UserRepository userRepository
    ) {
        this.siteSettingRepository = siteSettingRepository;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    // ==========================
    // PÚBLICO: LA WEB LEE CONFIGURACIÓN
    // ==========================
    @GetMapping({"/settings", "/products/settings-web"})
public ResponseEntity<SiteSetting> getSettings() {
        SiteSetting settings = siteSettingRepository
                .findFirstByActiveTrueOrderByIdAsc()
                .orElseGet(this::createDefaultSettings);

        return ResponseEntity.ok(settings);
    }

    // ==========================
    // ADMIN: GUARDA CONFIGURACIÓN
    // /api/settings se salta Spring Security, por eso validamos el token aquí.
    // ==========================
    @PutMapping({"/admin/settings", "/settings"})
    public ResponseEntity<?> updateSettings(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody SiteSettingRequest request
    ) {
        if (!isValidAdminToken(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "No autorizado. Inicia sesión como administrador."));
        }

        SiteSetting settings = siteSettingRepository
                .findFirstByActiveTrueOrderByIdAsc()
                .orElseGet(this::createDefaultSettings);

        // Marca / general
        if (request.getStoreName() != null) settings.setStoreName(request.getStoreName());
        if (request.getSlogan() != null) settings.setSlogan(request.getSlogan());
        if (request.getLogoUrl() != null) settings.setLogoUrl(request.getLogoUrl());
        if (request.getHeroImageUrl() != null) settings.setHeroImageUrl(request.getHeroImageUrl());

        // Hero antiguo
        if (request.getHeroTitle() != null) settings.setHeroTitle(request.getHeroTitle());
        if (request.getHeroDescription() != null) settings.setHeroDescription(request.getHeroDescription());
        if (request.getPrimaryButtonText() != null) settings.setPrimaryButtonText(request.getPrimaryButtonText());
        if (request.getSecondaryButtonText() != null) settings.setSecondaryButtonText(request.getSecondaryButtonText());

        // Colores
        if (request.getPrimaryColor() != null) settings.setPrimaryColor(request.getPrimaryColor());
        if (request.getSecondaryColor() != null) settings.setSecondaryColor(request.getSecondaryColor());
        if (request.getAccentColor() != null) settings.setAccentColor(request.getAccentColor());
        if (request.getBackgroundColor() != null) settings.setBackgroundColor(request.getBackgroundColor());
        if (request.getTextColor() != null) settings.setTextColor(request.getTextColor());

        // Redes
        if (request.getInstagramUrl() != null) settings.setInstagramUrl(request.getInstagramUrl());
        if (request.getFacebookUrl() != null) settings.setFacebookUrl(request.getFacebookUrl());
        if (request.getTiktokUrl() != null) settings.setTiktokUrl(request.getTiktokUrl());
        if (request.getWhatsappNumber() != null) settings.setWhatsappNumber(request.getWhatsappNumber());
        if (request.getWhatsappMessage() != null) settings.setWhatsappMessage(request.getWhatsappMessage());

        // Colección / contacto
        if (request.getCollectionTitle() != null) settings.setCollectionTitle(request.getCollectionTitle());
        if (request.getCollectionDescription() != null) settings.setCollectionDescription(request.getCollectionDescription());
        if (request.getContactTitle() != null) settings.setContactTitle(request.getContactTitle());
        if (request.getContactDescription() != null) settings.setContactDescription(request.getContactDescription());

        // Header
        if (request.getNavInicio() != null) settings.setNavInicio(request.getNavInicio());
        if (request.getNavProducto() != null) settings.setNavProducto(request.getNavProducto());
        if (request.getNavNosotros() != null) settings.setNavNosotros(request.getNavNosotros());
        if (request.getNavContacto() != null) settings.setNavContacto(request.getNavContacto());
        if (request.getCartText() != null) settings.setCartText(request.getCartText());
        if (request.getLoginText() != null) settings.setLoginText(request.getLoginText());

        // Nosotros
        if (request.getAboutTag() != null) settings.setAboutTag(request.getAboutTag());
        if (request.getAboutTitle() != null) settings.setAboutTitle(request.getAboutTitle());
        if (request.getAboutText() != null) settings.setAboutText(request.getAboutText());
        if (request.getAboutButtonText() != null) settings.setAboutButtonText(request.getAboutButtonText());
        if (request.getAboutButtonLink() != null) settings.setAboutButtonLink(request.getAboutButtonLink());

        // Iconos / beneficios
        if (request.getAboutFeature1Icon() != null) settings.setAboutFeature1Icon(request.getAboutFeature1Icon());
        if (request.getAboutFeature1Title() != null) settings.setAboutFeature1Title(request.getAboutFeature1Title());
        if (request.getAboutFeature1Text() != null) settings.setAboutFeature1Text(request.getAboutFeature1Text());

        if (request.getAboutFeature2Icon() != null) settings.setAboutFeature2Icon(request.getAboutFeature2Icon());
        if (request.getAboutFeature2Title() != null) settings.setAboutFeature2Title(request.getAboutFeature2Title());
        if (request.getAboutFeature2Text() != null) settings.setAboutFeature2Text(request.getAboutFeature2Text());

        if (request.getAboutFeature3Icon() != null) settings.setAboutFeature3Icon(request.getAboutFeature3Icon());
        if (request.getAboutFeature3Title() != null) settings.setAboutFeature3Title(request.getAboutFeature3Title());
        if (request.getAboutFeature3Text() != null) settings.setAboutFeature3Text(request.getAboutFeature3Text());

        if (request.getAboutFeature4Icon() != null) settings.setAboutFeature4Icon(request.getAboutFeature4Icon());
        if (request.getAboutFeature4Title() != null) settings.setAboutFeature4Title(request.getAboutFeature4Title());
        if (request.getAboutFeature4Text() != null) settings.setAboutFeature4Text(request.getAboutFeature4Text());

        // Imágenes Nosotros
        if (request.getAboutImage1Url() != null) settings.setAboutImage1Url(request.getAboutImage1Url());
        if (request.getAboutImage2Url() != null) settings.setAboutImage2Url(request.getAboutImage2Url());
        if (request.getAboutImage3Url() != null) settings.setAboutImage3Url(request.getAboutImage3Url());

        // Galería
        if (request.getGalleryTag() != null) settings.setGalleryTag(request.getGalleryTag());
        if (request.getGalleryTitle() != null) settings.setGalleryTitle(request.getGalleryTitle());
        if (request.getGalleryText() != null) settings.setGalleryText(request.getGalleryText());

        if (request.getGalleryImage1Url() != null) settings.setGalleryImage1Url(request.getGalleryImage1Url());
        if (request.getGalleryImage2Url() != null) settings.setGalleryImage2Url(request.getGalleryImage2Url());
        if (request.getGalleryImage3Url() != null) settings.setGalleryImage3Url(request.getGalleryImage3Url());
        if (request.getGalleryImage4Url() != null) settings.setGalleryImage4Url(request.getGalleryImage4Url());
        if (request.getGalleryVideoUrl() != null) settings.setGalleryVideoUrl(request.getGalleryVideoUrl());

        if (request.getAboutGalleryEnabled() != null) {
            settings.setAboutGalleryEnabled(request.getAboutGalleryEnabled());
        }

        SiteSetting savedSettings = siteSettingRepository.save(settings);
        return ResponseEntity.ok(savedSettings);
    }

    private boolean isValidAdminToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return false;
        }

        String token = authHeader.substring(7);

        try {
            if (!jwtService.isTokenValid(token)) {
                return false;
            }

            Claims claims = jwtService.extractClaims(token);

            String email = claims.getSubject();
            String role = claims.get("role", String.class);
            Integer tokenAdminSessionVersion = claims.get("adminSessionVersion", Integer.class);

            if (email == null || email.isBlank()) {
                return false;
            }

            if (role == null || role.isBlank()) {
                return false;
            }

            role = role.trim().toUpperCase();

            if (role.startsWith("ROLE_")) {
                role = role.replace("ROLE_", "");
            }

            if (!"ADMIN".equals(role)) {
                return false;
            }

            User user = userRepository.findByEmail(email).orElse(null);

            if (user == null || Boolean.FALSE.equals(user.getActive())) {
                return false;
            }

            Integer currentVersion = user.getAdminSessionVersion();

            if (currentVersion == null) {
                currentVersion = 0;
            }

            return tokenAdminSessionVersion != null
                    && tokenAdminSessionVersion.equals(currentVersion);

        } catch (Exception e) {
            return false;
        }
    }

    private SiteSetting createDefaultSettings() {
        SiteSetting defaultSettings = SiteSetting.builder()
                .storeName("JONZKO")
                .slogan("Ropa urbana peruana")
                .logoUrl("assets/logo.jpg")
                .heroImageUrl("assets/polera.jpg")

                .heroTitle("JONZKO")
                .heroDescription("Ropa urbana con presencia, estilo y visión empresarial.")
                .primaryButtonText("Comprar ahora")
                .secondaryButtonText("Ver colección")

                .primaryColor("#0b0b0b")
                .secondaryColor("#ffffff")
                .accentColor("#c8a45d")
                .backgroundColor("#f4f4f4")
                .textColor("#111111")

                .instagramUrl("https://www.instagram.com/jonzko.o/")
                .facebookUrl("https://www.facebook.com/profile.php?id=61563952841904")
                .tiktokUrl("https://www.tiktok.com/@jonzko1")
                .whatsappNumber("51998989599")
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