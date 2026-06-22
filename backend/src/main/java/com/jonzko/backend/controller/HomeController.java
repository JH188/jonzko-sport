package com.jonzko.backend.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.PatchMapping;

import com.jonzko.backend.entity.HomeSetting;
import com.jonzko.backend.entity.HomeSlide;
import com.jonzko.backend.repository.HomeSettingRepository;
import com.jonzko.backend.repository.HomeSlideRepository;
import com.jonzko.backend.service.CloudinaryService;

@RestController
@CrossOrigin(originPatterns = {
        "http://localhost:*",
        "https://*.vercel.app",
        "https://jonzko.lat",
        "https://www.jonzko.lat"
})
public class HomeController {

    private final HomeSettingRepository homeSettingRepository;
    private final HomeSlideRepository homeSlideRepository;
    private final CloudinaryService cloudinaryService;

    public HomeController(
            HomeSettingRepository homeSettingRepository,
            HomeSlideRepository homeSlideRepository,
            CloudinaryService cloudinaryService
    ) {
        this.homeSettingRepository = homeSettingRepository;
        this.homeSlideRepository = homeSlideRepository;
        this.cloudinaryService = cloudinaryService;
    }

    // ============================================================
    // PÚBLICO - CONFIGURACIÓN DEL INICIO
    // GET: /api/home/settings
    // ============================================================
    @GetMapping("/api/home/settings")
    public HomeSetting getPublicHomeSettings() {
        return getOrCreateDefaultSettings();
    }

    // ============================================================
    // PÚBLICO - SLIDES ACTIVOS DEL INICIO
    // GET: /api/home/slides
    // ============================================================
    @GetMapping("/api/home/slides")
    public List<HomeSlide> getPublicHomeSlides() {
        return homeSlideRepository.findByActiveTrueOrderByDisplayOrderAsc();
    }

    // ============================================================
    // ADMIN - VER CONFIGURACIÓN DEL INICIO
    // GET: /api/admin/home/settings
    // ============================================================
    @GetMapping("/api/admin/home/settings")
    public HomeSetting getAdminHomeSettings() {
        return getOrCreateDefaultSettings();
    }

    // ============================================================
    // ADMIN - ACTUALIZAR CONFIGURACIÓN DEL INICIO
    // PUT: /api/admin/home/settings
    // ============================================================
    @PutMapping("/api/admin/home/settings")
    public ResponseEntity<?> updateHomeSettings(@RequestBody HomeSetting request) {

        HomeSetting settings = getOrCreateDefaultSettings();

        settings.setStoreName(clean(request.getStoreName()));
        settings.setLogoUrl(clean(request.getLogoUrl()));

        settings.setTopBarText(clean(request.getTopBarText()));

        settings.setMenuInicio(clean(request.getMenuInicio()));
        settings.setMenuTienda(clean(request.getMenuTienda()));
        settings.setMenuExclusivo(clean(request.getMenuExclusivo()));
        settings.setMenuNosotros(clean(request.getMenuNosotros()));
        settings.setMenuContacto(clean(request.getMenuContacto()));
        settings.setMenuMisPedidos(clean(request.getMenuMisPedidos()));

        settings.setHeroTag(clean(request.getHeroTag()));
        settings.setHeroTitle(clean(request.getHeroTitle()));
        settings.setHeroButtonText(clean(request.getHeroButtonText()));
        settings.setHeroButtonLink(clean(request.getHeroButtonLink()));

        settings.setWhatsappNumber(clean(request.getWhatsappNumber()));

        if (request.getWhatsappEnabled() != null) {
            settings.setWhatsappEnabled(request.getWhatsappEnabled());
        }

        if (request.getActive() != null) {
            settings.setActive(request.getActive());
        }

        settings.setUpdatedAt(LocalDateTime.now());

        HomeSetting saved = homeSettingRepository.save(settings);

        return ResponseEntity.ok(saved);
    }

    // ============================================================
    // ADMIN - LISTAR TODOS LOS SLIDES
    // GET: /api/admin/home/slides
    // ============================================================
    @GetMapping("/api/admin/home/slides")
    public List<HomeSlide> getAdminHomeSlides() {
        return homeSlideRepository.findAllByOrderByDisplayOrderAsc();
    }

    // ============================================================
    // ADMIN - CREAR SLIDE
    // POST: /api/admin/home/slides
    // ============================================================
    @PostMapping("/api/admin/home/slides")
    public ResponseEntity<?> createHomeSlide(@RequestBody HomeSlide request) {

        HomeSlide slide = new HomeSlide();

        slide.setTagText(clean(request.getTagText()));
        slide.setTitle(clean(request.getTitle()));
        slide.setButtonText(clean(request.getButtonText()));
        slide.setButtonLink(clean(request.getButtonLink()));

        slide.setDesktopImageUrl(clean(request.getDesktopImageUrl()));
        slide.setMobileImageUrl(clean(request.getMobileImageUrl()));
        slide.setVideoUrl(clean(request.getVideoUrl()));

        slide.setDesktopPosition(
                clean(request.getDesktopPosition()) != null
                        ? clean(request.getDesktopPosition())
                        : "center center"
        );

        slide.setMobilePosition(
                clean(request.getMobilePosition()) != null
                        ? clean(request.getMobilePosition())
                        : "center center"
        );

        slide.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 1);
        slide.setActive(request.getActive() != null ? request.getActive() : true);

        slide.setCreatedAt(LocalDateTime.now());
        slide.setUpdatedAt(LocalDateTime.now());

        HomeSlide saved = homeSlideRepository.save(slide);

        return ResponseEntity.ok(saved);
    }

    // ============================================================
    // ADMIN - EDITAR SLIDE
    // PUT: /api/admin/home/slides/{id}
    // ============================================================
    @PutMapping("/api/admin/home/slides/{id}")
    public ResponseEntity<?> updateHomeSlide(
            @PathVariable Long id,
            @RequestBody HomeSlide request
    ) {
        HomeSlide slide = homeSlideRepository.findById(id).orElse(null);

        if (slide == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Slide no encontrado")
            );
        }

        slide.setTagText(clean(request.getTagText()));
        slide.setTitle(clean(request.getTitle()));
        slide.setButtonText(clean(request.getButtonText()));
        slide.setButtonLink(clean(request.getButtonLink()));

        slide.setDesktopImageUrl(clean(request.getDesktopImageUrl()));
        slide.setMobileImageUrl(clean(request.getMobileImageUrl()));
        slide.setVideoUrl(clean(request.getVideoUrl()));

        slide.setDesktopPosition(
                clean(request.getDesktopPosition()) != null
                        ? clean(request.getDesktopPosition())
                        : "center center"
        );

        slide.setMobilePosition(
                clean(request.getMobilePosition()) != null
                        ? clean(request.getMobilePosition())
                        : "center center"
        );

        slide.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 1);

        if (request.getActive() != null) {
            slide.setActive(request.getActive());
        }

        slide.setUpdatedAt(LocalDateTime.now());

        HomeSlide saved = homeSlideRepository.save(slide);

        return ResponseEntity.ok(saved);
    }

    // ============================================================
    // ADMIN - ACTIVAR / DESACTIVAR SLIDE
    // PATCH: /api/admin/home/slides/{id}/status
    // ============================================================
    @PatchMapping("/api/admin/home/slides/{id}/status")
    public ResponseEntity<?> updateSlideStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> request
    ) {
        HomeSlide slide = homeSlideRepository.findById(id).orElse(null);

        if (slide == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Slide no encontrado")
            );
        }

        Boolean active = request.get("active");

        if (active == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Debes enviar active")
            );
        }

        slide.setActive(active);
        slide.setUpdatedAt(LocalDateTime.now());

        HomeSlide saved = homeSlideRepository.save(slide);

        return ResponseEntity.ok(saved);
    }

    // ============================================================
    // ADMIN - ELIMINAR SLIDE
    // DELETE: /api/admin/home/slides/{id}
    // ============================================================
    @DeleteMapping("/api/admin/home/slides/{id}")
    public ResponseEntity<?> deleteHomeSlide(@PathVariable Long id) {

        HomeSlide slide = homeSlideRepository.findById(id).orElse(null);

        if (slide == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Slide no encontrado")
            );
        }

        homeSlideRepository.delete(slide);

        return ResponseEntity.ok(
                Map.of("message", "Slide eliminado correctamente")
        );
    }

    // ============================================================
    // ADMIN - SUBIR IMAGEN / VIDEO DEL INICIO A CLOUDINARY
    // POST: /api/admin/home/upload
    // ============================================================
    @PostMapping("/api/admin/home/upload")
    public ResponseEntity<?> uploadHomeMedia(@RequestParam("file") MultipartFile file) {
        try {
            String mediaUrl = cloudinaryService.uploadProductImage(file);

            return ResponseEntity.ok(
                    Map.of(
                            "message", "Archivo subido correctamente",
                            "mediaUrl", mediaUrl,
                            "imageUrl", mediaUrl
                    )
            );

        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                    Map.of("message", e.getMessage())
            );
        }
    }

    // ============================================================
    // DEFAULT SETTINGS
    // ============================================================
    private HomeSetting getOrCreateDefaultSettings() {
        return homeSettingRepository.findById(1L).orElseGet(() -> {
            HomeSetting settings = new HomeSetting();

            settings.setId(1L);
            settings.setStoreName("JONZKO");
            settings.setLogoUrl("assets/logo.jpg");

            settings.setTopBarText("ENVÍOS A TODO EL PERÚ • COMPRA SEGURA • CAMBIOS DISPONIBLES • JONZKO SPORT");

            settings.setMenuInicio("INICIO");
            settings.setMenuTienda("TIENDA");
            settings.setMenuExclusivo("EXCLUSIVO");
            settings.setMenuNosotros("NOSOTROS");
            settings.setMenuContacto("CONTACTO");
            settings.setMenuMisPedidos("MIS PEDIDOS");

            settings.setHeroTag("MODA PERUANA");
            settings.setHeroTitle("BLACK & WHITE");
            settings.setHeroButtonText("DESCUBRIR PRENDAS");
            settings.setHeroButtonLink("#tienda");

            settings.setWhatsappNumber("51999999999");
            settings.setWhatsappEnabled(true);
            settings.setActive(true);

            settings.setUpdatedAt(LocalDateTime.now());

            return homeSettingRepository.save(settings);
        });
    }

    private String clean(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }

        return value.trim();
    }
}