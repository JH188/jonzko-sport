package com.jonzko.backend.controller;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.ZoneId;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jonzko.backend.dto.AdminLoginRequest;
import com.jonzko.backend.dto.AdminLoginResponse;
import com.jonzko.backend.dto.AdminLoginStepResponse;
import com.jonzko.backend.dto.AdminVerifyCodeRequest;
import com.jonzko.backend.entity.AdminLoginCode;
import com.jonzko.backend.entity.User;
import com.jonzko.backend.repository.AdminLoginCodeRepository;
import com.jonzko.backend.repository.UserRepository;
import com.jonzko.backend.security.JwtService;
import com.jonzko.backend.service.BrevoEmailService;

@RestController
@RequestMapping("/api/auth")
public class AdminAuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AdminLoginCodeRepository adminLoginCodeRepository;
    private final BrevoEmailService brevoEmailService;

    private final SecureRandom secureRandom = new SecureRandom();

    public AdminAuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AdminLoginCodeRepository adminLoginCodeRepository,
            BrevoEmailService brevoEmailService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.adminLoginCodeRepository = adminLoginCodeRepository;
        this.brevoEmailService = brevoEmailService;
    }

    @PostMapping("/admin-login")
    public ResponseEntity<?> adminLogin(@RequestBody AdminLoginRequest request) {

        String email = clean(request.getEmail());

        User user = userRepository.findByEmail(email)
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Credenciales incorrectas");
        }

        if (Boolean.FALSE.equals(user.getActive())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Usuario inactivo");
        }

        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("No tienes permisos de administrador");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Credenciales incorrectas");
        }

        String code = generateCode();

        AdminLoginCode loginCode = new AdminLoginCode();
        loginCode.setEmail(user.getEmail());
        loginCode.setCode(code);
        loginCode.setUsed(false);
        loginCode.setCreatedAt(now());
        loginCode.setExpiresAt(now().plusMinutes(10));

        adminLoginCodeRepository.save(loginCode);

        brevoEmailService.sendAdminLoginCode(user.getEmail(), code);

        return ResponseEntity.ok(
                new AdminLoginStepResponse(
                        "Código de seguridad enviado al correo administrador.",
                        true,
                        user.getEmail()
                )
        );
    }

    @PostMapping("/admin-login/verify-code")
    public ResponseEntity<?> verifyAdminLoginCode(@RequestBody AdminVerifyCodeRequest request) {

        String email = clean(request.getEmail());
        String code = clean(request.getCode());

        if (email == null || code == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Correo y código son obligatorios");
        }

        AdminLoginCode loginCode = adminLoginCodeRepository
                .findTopByEmailAndCodeAndUsedFalseOrderByCreatedAtDesc(email, code)
                .orElse(null);

        if (loginCode == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Código incorrecto");
        }

        if (loginCode.getExpiresAt() == null || loginCode.getExpiresAt().isBefore(now())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("El código venció. Solicita uno nuevo.");
        }

        User user = userRepository.findByEmail(email)
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Usuario no encontrado");
        }

        if (Boolean.FALSE.equals(user.getActive())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Usuario inactivo");
        }

        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("No tienes permisos de administrador");
        }

        loginCode.setUsed(true);
        adminLoginCodeRepository.save(loginCode);

        String token = jwtService.generateToken(user);

        return ResponseEntity.ok(
                new AdminLoginResponse(
                        token,
                        user.getRole(),
                        user.getFullName(),
                        user.getEmail()
                )
        );
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