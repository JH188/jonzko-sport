package com.jonzko.backend.controller;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jonzko.backend.dto.LoginRequest;
import com.jonzko.backend.dto.RegisterRequest;
import com.jonzko.backend.dto.UserResponse;
import com.jonzko.backend.dto.VerifyEmailRequest;
import com.jonzko.backend.entity.EmailVerificationCode;
import com.jonzko.backend.entity.User;
import com.jonzko.backend.repository.EmailVerificationCodeRepository;
import com.jonzko.backend.repository.UserRepository;
import com.jonzko.backend.security.JwtService;
import com.jonzko.backend.service.BrevoEmailService;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {
        "https://jonzko.lat",
        "https://www.jonzko.lat",
        "https://jonzko-sport.vercel.app",
        "http://localhost:4200"
})
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailVerificationCodeRepository emailVerificationCodeRepository;
    private final BrevoEmailService brevoEmailService;

    private final SecureRandom secureRandom = new SecureRandom();

    public UserController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            EmailVerificationCodeRepository emailVerificationCodeRepository,
            BrevoEmailService brevoEmailService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailVerificationCodeRepository = emailVerificationCodeRepository;
        this.brevoEmailService = brevoEmailService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

        if (request.getFullName() == null || request.getFullName().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "El nombre es obligatorio"));
        }

        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "El correo es obligatorio"));
        }

        if (request.getPhone() == null || request.getPhone().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "El celular es obligatorio"));
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "La contraseña es obligatoria"));
        }

        String email = request.getEmail().trim().toLowerCase();
        String phone = request.getPhone().trim();

        if (!phone.matches("^9\\d{8}$")) {
            return ResponseEntity.badRequest().body(Map.of("message", "El celular debe tener 9 dígitos y empezar con 9"));
        }

        if (request.getPassword().length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("message", "La contraseña debe tener mínimo 6 caracteres"));
        }

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Este correo ya está registrado"));
        }

        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(email)
                .phone(phone)
                .password(passwordEncoder.encode(request.getPassword()))
                .active(false)
                .role("USER")
                .build();

        User savedUser = userRepository.save(user);

        List<EmailVerificationCode> codigosAnteriores =
                emailVerificationCodeRepository.findByEmailAndUsedFalse(email);

        codigosAnteriores.forEach(codigo -> codigo.setUsed(true));
        emailVerificationCodeRepository.saveAll(codigosAnteriores);

        String code = generateSixDigitCode();

        EmailVerificationCode verificationCode = new EmailVerificationCode();
        verificationCode.setUser(savedUser);
        verificationCode.setEmail(email);
        verificationCode.setCodeHash(passwordEncoder.encode(code));
        verificationCode.setExpiresAt(LocalDateTime.now(ZoneId.of("America/Lima")).plusMinutes(10));
        verificationCode.setUsed(false);

        emailVerificationCodeRepository.save(verificationCode);

        brevoEmailService.sendEmailVerificationCode(
                savedUser.getEmail(),
                savedUser.getFullName(),
                code
        );

        return ResponseEntity.ok(Map.of(
                "id", savedUser.getId(),
                "fullName", savedUser.getFullName(),
                "email", savedUser.getEmail(),
                "phone", savedUser.getPhone(),
                "active", savedUser.getActive(),
                "role", savedUser.getRole(),
                "message", "Cuenta creada. Revisa tu correo e ingresa el código para activar tu cuenta."
        ));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestBody VerifyEmailRequest request) {

        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "El correo es obligatorio"));
        }

        if (request.getCode() == null || request.getCode().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "El código es obligatorio"));
        }

        String email = request.getEmail().trim().toLowerCase();
        String code = request.getCode().trim();

        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Código inválido o expirado"));
        }

        Optional<EmailVerificationCode> codeOptional =
                emailVerificationCodeRepository.findTopByEmailAndUsedFalseOrderByCreatedAtDesc(email);

        if (codeOptional.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Código inválido o expirado"));
        }

        EmailVerificationCode verificationCode = codeOptional.get();

        LocalDateTime now = LocalDateTime.now(ZoneId.of("America/Lima"));

        if (verificationCode.getExpiresAt().isBefore(now)) {
            verificationCode.setUsed(true);
            emailVerificationCodeRepository.save(verificationCode);

            return ResponseEntity.badRequest().body(Map.of("message", "Código inválido o expirado"));
        }

        boolean codigoCorrecto = passwordEncoder.matches(code, verificationCode.getCodeHash());

        if (!codigoCorrecto) {
            return ResponseEntity.badRequest().body(Map.of("message", "Código inválido o expirado"));
        }

        User user = userOptional.get();
        user.setActive(true);

        String role = user.getRole() != null ? user.getRole() : "USER";
        user.setRole(role);

        userRepository.save(user);

        verificationCode.setUsed(true);
        emailVerificationCodeRepository.save(verificationCode);

        String token = jwtService.generateToken(user);

        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "fullName", user.getFullName(),
                "email", user.getEmail(),
                "phone", user.getPhone(),
                "active", user.getActive(),
                "role", role,
                "token", token,
                "message", "Correo verificado correctamente"
        ));
    }
    @PostMapping("/resend-verification-code")
public ResponseEntity<?> resendVerificationCode(@RequestBody VerifyEmailRequest request) {

    if (request.getEmail() == null || request.getEmail().isBlank()) {
        return ResponseEntity.badRequest().body(Map.of("message", "El correo es obligatorio"));
    }

    String email = request.getEmail().trim().toLowerCase();

    Optional<User> userOptional = userRepository.findByEmail(email);

    if (userOptional.isEmpty()) {
        return ResponseEntity.badRequest().body(Map.of("message", "Correo no registrado"));
    }

    User user = userOptional.get();

    if (Boolean.TRUE.equals(user.getActive())) {
        return ResponseEntity.badRequest().body(Map.of("message", "Esta cuenta ya está verificada"));
    }

    List<EmailVerificationCode> codigosAnteriores =
            emailVerificationCodeRepository.findByEmailAndUsedFalse(email);

    codigosAnteriores.forEach(codigo -> codigo.setUsed(true));
    emailVerificationCodeRepository.saveAll(codigosAnteriores);

    String code = generateSixDigitCode();

    EmailVerificationCode verificationCode = new EmailVerificationCode();
    verificationCode.setUser(user);
    verificationCode.setEmail(email);
    verificationCode.setCodeHash(passwordEncoder.encode(code));
    verificationCode.setExpiresAt(LocalDateTime.now(ZoneId.of("America/Lima")).plusMinutes(10));
    verificationCode.setUsed(false);

    emailVerificationCodeRepository.save(verificationCode);

    brevoEmailService.sendEmailVerificationCode(
            user.getEmail(),
            user.getFullName(),
            code
    );

    return ResponseEntity.ok(Map.of(
            "message", "Nuevo código enviado. Revisa tu correo."
    ));
}

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "El correo es obligatorio"));
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "La contraseña es obligatoria"));
        }

        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Correo no registrado"));
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Contraseña incorrecta"));
        }

        if (!Boolean.TRUE.equals(user.getActive())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Debes verificar tu correo antes de iniciar sesión"));
        }

        String role = user.getRole() != null ? user.getRole() : "USER";
        user.setRole(role);

        String token = jwtService.generateToken(user);

        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "fullName", user.getFullName(),
                "email", user.getEmail(),
                "phone", user.getPhone(),
                "active", user.getActive(),
                "role", role,
                "token", token
        ));
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(
                userRepository.findAll()
                        .stream()
                        .map(UserResponse::fromEntity)
                        .toList()
        );
    }

    private String generateSixDigitCode() {
        int number = secureRandom.nextInt(1_000_000);
        return String.format("%06d", number);
    }
}