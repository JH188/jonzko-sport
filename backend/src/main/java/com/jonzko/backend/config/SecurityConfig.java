package com.jonzko.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth

                        // ==========================
                        // BLOQUEAR ADMIN PRIMERO
                        // IMPORTANTE: va antes de /api/products/**
                        // ==========================
                        .requestMatchers("/api/admin/**").denyAll()
                        .requestMatchers("/api/products/admin/**").denyAll()
                        .requestMatchers("/api/admin/product-variants/**").denyAll()

                        // ==========================
                        // BLOQUEAR PEDIDOS PUBLICOS
                        // ==========================
                        .requestMatchers(HttpMethod.GET, "/api/orders").denyAll()
                        .requestMatchers(HttpMethod.GET, "/api/orders/**").denyAll()
                        .requestMatchers(HttpMethod.PUT, "/api/orders/**").denyAll()
                        .requestMatchers(HttpMethod.DELETE, "/api/orders/**").denyAll()

                        // ==========================
                        // RUTAS PUBLICAS DE LA TIENDA
                        // ==========================
                        .requestMatchers(HttpMethod.GET, "/api/products").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/settings").permitAll()

                        // ==========================
                        // REGISTRO Y LOGIN PUBLICOS
                        // ==========================
                        .requestMatchers(HttpMethod.POST, "/api/users/register").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/users/login").permitAll()

                        // ==========================
                        // CREAR PEDIDO PUBLICO
                        // El cliente debe poder comprar
                        // ==========================
                        .requestMatchers(HttpMethod.POST, "/api/orders").permitAll()

                        // ==========================
                        // TODO LO DEMAS BLOQUEADO
                        // ==========================
                        .anyRequest().denyAll()
                );

        return http.build();
    }
}