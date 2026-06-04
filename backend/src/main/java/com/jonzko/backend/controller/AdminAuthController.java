package com.jonzko.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jonzko.backend.dto.AdminLoginRequest;
import com.jonzko.backend.dto.AdminLoginResponse;
import com.jonzko.backend.entity.User;
import com.jonzko.backend.repository.UserRepository;
import com.jonzko.backend.security.JwtService;

@RestController
@RequestMapping("/api/auth")
public class AdminAuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AdminAuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/admin-login")
    public ResponseEntity<?> adminLogin(@RequestBody AdminLoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
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
}