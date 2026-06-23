package com.jonzko.backend.controller;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jonzko.backend.dto.AdminPasswordChangeRequest;
import com.jonzko.backend.dto.AdminPasswordCodeRequest;
import com.jonzko.backend.entity.AdminPasswordChangeCode;
import com.jonzko.backend.entity.User;
import com.jonzko.backend.repository.AdminPasswordChangeCodeRepository;
import com.jonzko.backend.repository.UserRepository;
import com.jonzko.backend.security.JwtService;
import com.jonzko.backend.service.BrevoEmailService;

@RestController
@RequestMapping("/api/admin/security")
public class AdminSecurityController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AdminPasswordChangeCodeRepository adminPasswordChangeCodeRepository;
    private final BrevoEmailService brevoEmailService;

    private final SecureRandom secureRandom = new SecureRandom();

    public AdminSecurityController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AdminPasswordChangeCodeRepository adminPasswordChangeCodeRepository,
            BrevoEmailService brevoEmailService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.adminPasswordChangeCodeRepository = adminPasswordChangeCodeRepository;
        this.brevoEmailService = brevoEmailService;
    }

    @PostMapping("/password/request-code")
    public ResponseEntity<?> requestPasswordChangeCode(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody AdminPasswordCodeRequest request
    ) {
        User admin = getAdminFromToken(authorization);

        if (admin == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Sesión no válida");
        }

        String currentPassword = clean(request.getCurrentPassword());

        if (currentPassword == null) {
            return ResponseEntity.badRequest()
                    .body("Ingresa tu contraseña actual");
        }

        if (!passwordEncoder.matches(currentPassword, admin.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("La contraseña actual es incorrecta");
        }

        String code = generateCode();

        AdminPasswordChangeCode passwordCode = new AdminPasswordChangeCode();
        passwordCode.setEmail(admin.getEmail());
        passwordCode.setCode(code);
        passwordCode.setUsed(false);
        passwordCode.setCreatedAt(now());
        passwordCode.setExpiresAt(now().plusMinutes(10));

        adminPasswordChangeCodeRepository.save(passwordCode);

        brevoEmailService.sendAdminPasswordChangeCode(admin.getEmail(), code);

        return ResponseEntity.ok(
                Map.of(
                        "message", "Código enviado al correo administrador.",
                        "email", admin.getEmail()
                )
        );
    }

    @PostMapping("/password/change")
    public ResponseEntity<?> changePassword(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody AdminPasswordChangeRequest request
    ) {
        User admin = getAdminFromToken(authorization);

        if (admin == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Sesión no válida");
        }

        String currentPassword = clean(request.getCurrentPassword());
        String newPassword = clean(request.getNewPassword());
        String confirmPassword = clean(request.getConfirmPassword());
        String code = clean(request.getCode());

        if (currentPassword == null || newPassword == null || confirmPassword == null || code == null) {
            return ResponseEntity.badRequest()
                    .body("Completa todos los campos");
        }

        if (!passwordEncoder.matches(currentPassword, admin.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("La contraseña actual es incorrecta");
        }

        if (newPassword.length() < 6) {
            return ResponseEntity.badRequest()
                    .body("La nueva contraseña debe tener mínimo 6 caracteres");
        }

        if (!newPassword.equals(confirmPassword)) {
            return ResponseEntity.badRequest()
                    .body("Las contraseñas no coinciden");
        }

        AdminPasswordChangeCode passwordCode = adminPasswordChangeCodeRepository
                .findTopByEmailAndCodeAndUsedFalseOrderByCreatedAtDesc(admin.getEmail(), code)
                .orElse(null);

        if (passwordCode == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Código incorrecto");
        }

        if (passwordCode.getExpiresAt() == null || passwordCode.getExpiresAt().isBefore(now())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("El código venció. Solicita uno nuevo.");
        }

        passwordCode.setUsed(true);
        adminPasswordChangeCodeRepository.save(passwordCode);

        admin.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(admin);

        return ResponseEntity.ok(
                Map.of("message", "Contraseña actualizada correctamente")
        );
    }

    private User getAdminFromToken(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return null;
        }

        String token = authorization.substring(7);

        if (!jwtService.isTokenValid(token)) {
            return null;
        }

        String email = jwtService.extractEmail(token);

        User user = userRepository.findByEmail(email)
                .orElse(null);

        if (user == null) {
            return null;
        }

        if (Boolean.FALSE.equals(user.getActive())) {
            return null;
        }

        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
            return null;
        }

        return user;
    }

    private String generateCode() {
        int number = secureRandom.nextInt(900000) + 100000;
        return String.valueOf(number);
    }

    private LocalDateTime now() {
        return LocalDateTime.now(ZoneId.of("America/Lima"));
    }

    private String clean(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }

        return value.trim();
    }
}