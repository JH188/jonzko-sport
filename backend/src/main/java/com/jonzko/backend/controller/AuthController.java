package com.jonzko.backend.controller;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jonzko.backend.dto.ForgotPasswordRequest;
import com.jonzko.backend.dto.ResetPasswordRequest;
import com.jonzko.backend.entity.PasswordResetCode;
import com.jonzko.backend.entity.User;
import com.jonzko.backend.repository.PasswordResetCodeRepository;
import com.jonzko.backend.repository.UserRepository;
import com.jonzko.backend.service.BrevoEmailService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordResetCodeRepository passwordResetCodeRepository;
    private final BrevoEmailService brevoEmailService;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthController(
            UserRepository userRepository,
            PasswordResetCodeRepository passwordResetCodeRepository,
            BrevoEmailService brevoEmailService
    ) {
        this.userRepository = userRepository;
        this.passwordResetCodeRepository = passwordResetCodeRepository;
        this.brevoEmailService = brevoEmailService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody User user, BindingResult result) {

        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(getValidationErrors(result));
        }

        String emailNormalizado = user.getEmail().trim().toLowerCase();
        String phoneNormalizado = user.getPhone().trim();
        String fullNameNormalizado = user.getFullName().trim();

        if (userRepository.existsByEmail(emailNormalizado)) {
            return ResponseEntity.badRequest().body(Map.of(
                    "email", "Este correo ya está registrado"
            ));
        }

        user.setFullName(fullNameNormalizado);
        user.setEmail(emailNormalizado);
        user.setPhone(phoneNormalizado);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setActive(true);

        User savedUser = userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("id", savedUser.getId());
        response.put("fullName", savedUser.getFullName());
        response.put("email", savedUser.getEmail());
        response.put("phone", savedUser.getPhone());
        response.put("active", savedUser.getActive());
        response.put("message", "Usuario registrado correctamente");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {

        if (loginRequest.getEmail() == null || loginRequest.getEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "email", "El correo es obligatorio"
            ));
        }

        if (loginRequest.getPassword() == null || loginRequest.getPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "password", "La contraseña es obligatoria"
            ));
        }

        String emailNormalizado = loginRequest.getEmail().trim().toLowerCase();

        Optional<User> userOptional = userRepository.findByEmail(emailNormalizado);

        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Correo o contraseña incorrectos"
            ));
        }

        User user = userOptional.get();

        if (user.getActive() != null && !user.getActive()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "La cuenta está desactivada"
            ));
        }

        boolean passwordCorrecta = passwordEncoder.matches(
                loginRequest.getPassword(),
                user.getPassword()
        );

        if (!passwordCorrecta) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Correo o contraseña incorrectos"
            ));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("fullName", user.getFullName());
        response.put("email", user.getEmail());
        response.put("phone", user.getPhone());
        response.put("active", user.getActive());
        response.put("message", "Login correcto");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request,
            BindingResult result
    ) {

        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(getValidationErrors(result));
        }

        String emailNormalizado = request.getEmail().trim().toLowerCase();

        Optional<User> userOptional = userRepository.findByEmail(emailNormalizado);

        if (userOptional.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                    "message", "Si el correo está registrado, recibirás un código de recuperación"
            ));
        }

        User user = userOptional.get();

        if (user.getActive() != null && !user.getActive()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "La cuenta está desactivada"
            ));
        }

        List<PasswordResetCode> codigosAnteriores =
                passwordResetCodeRepository.findByEmailAndUsedFalse(emailNormalizado);

        codigosAnteriores.forEach(codigo -> codigo.setUsed(true));
        passwordResetCodeRepository.saveAll(codigosAnteriores);

        String code = generateSixDigitCode();

        PasswordResetCode resetCode = new PasswordResetCode();
        resetCode.setUser(user);
        resetCode.setEmail(emailNormalizado);
        resetCode.setCodeHash(passwordEncoder.encode(code));
        resetCode.setExpiresAt(LocalDateTime.now(ZoneId.of("America/Lima")).plusMinutes(10));
        resetCode.setUsed(false);

        passwordResetCodeRepository.save(resetCode);

        brevoEmailService.sendPasswordResetCode(
                user.getEmail(),
                user.getFullName(),
                code
        );

        return ResponseEntity.ok(Map.of(
                "message", "Si el correo está registrado, recibirás un código de recuperación"
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request,
            BindingResult result
    ) {

        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(getValidationErrors(result));
        }

        String emailNormalizado = request.getEmail().trim().toLowerCase();
        String code = request.getCode().trim();
        String newPassword = request.getNewPassword();
        String confirmPassword = request.getConfirmPassword();

        if (!newPassword.equals(confirmPassword)) {
            return ResponseEntity.badRequest().body(Map.of(
                    "confirmPassword", "Las contraseñas no coinciden"
            ));
        }

        Optional<User> userOptional = userRepository.findByEmail(emailNormalizado);

        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Código inválido o expirado"
            ));
        }

        Optional<PasswordResetCode> codeOptional =
                passwordResetCodeRepository.findTopByEmailAndUsedFalseOrderByCreatedAtDesc(emailNormalizado);

        if (codeOptional.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Código inválido o expirado"
            ));
        }

        PasswordResetCode resetCode = codeOptional.get();

        LocalDateTime now = LocalDateTime.now(ZoneId.of("America/Lima"));

        if (resetCode.getExpiresAt().isBefore(now)) {
            resetCode.setUsed(true);
            passwordResetCodeRepository.save(resetCode);

            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Código inválido o expirado"
            ));
        }

        boolean codigoCorrecto = passwordEncoder.matches(code, resetCode.getCodeHash());

        if (!codigoCorrecto) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Código inválido o expirado"
            ));
        }

        User user = userOptional.get();

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetCode.setUsed(true);
        passwordResetCodeRepository.save(resetCode);

        return ResponseEntity.ok(Map.of(
                "message", "Contraseña actualizada correctamente"
        ));
    }

    @GetMapping("/users")
    public ResponseEntity<?> listUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    private String generateSixDigitCode() {
        int number = secureRandom.nextInt(1_000_000);
        return String.format("%06d", number);
    }

    private Map<String, String> getValidationErrors(BindingResult result) {
        Map<String, String> errores = new HashMap<>();

        result.getFieldErrors().forEach(error -> {
            errores.put(error.getField(), error.getDefaultMessage());
        });

        return errores;
    }
}