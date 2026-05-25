package com.jonzko.backend.controller;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jonzko.backend.dto.LoginRequest;
import com.jonzko.backend.dto.RegisterRequest;
import com.jonzko.backend.dto.UserResponse;
import com.jonzko.backend.entity.User;
import com.jonzko.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

        if (request.getFullName() == null || request.getFullName().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "El nombre es obligatorio"));
        }

        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "El correo es obligatorio"));
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "La contraseña es obligatoria"));
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Este correo ya está registrado"));
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(request.getPassword())
                .active(true)
                .build();

        User savedUser = userRepository.save(user);

        return ResponseEntity.ok(UserResponse.fromEntity(savedUser));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Correo no registrado"));
        }

        if (!user.getPassword().equals(request.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Contraseña incorrecta"));
        }

        if (!Boolean.TRUE.equals(user.getActive())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Usuario inactivo"));
        }

        return ResponseEntity.ok(UserResponse.fromEntity(user));
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
}