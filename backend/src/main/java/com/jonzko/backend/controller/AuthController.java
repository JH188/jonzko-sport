package com.jonzko.backend.controller;

import java.util.HashMap;
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

import com.jonzko.backend.entity.User;
import com.jonzko.backend.repository.UserRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody User user, BindingResult result) {

        if (result.hasErrors()) {
            Map<String, String> errores = new HashMap<>();

            result.getFieldErrors().forEach(error -> {
                errores.put(error.getField(), error.getDefaultMessage());
            });

            return ResponseEntity.badRequest().body(errores);
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

        boolean passwordCorrecta = passwordEncoder.matches(loginRequest.getPassword(), user.getPassword());

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

    @GetMapping("/users")
    public ResponseEntity<?> listUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }
}