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
                        // PERMITIR PREFLIGHT CORS
                        // ==========================
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // ==========================
                        // BLOQUEAR ADMIN PRIMERO
                        // ==========================
                        .requestMatchers("/api/admin/**").denyAll()
                        .requestMatchers("/api/products/admin/**").denyAll()
                        .requestMatchers("/api/admin/product-variants/**").denyAll()

                        // ==========================
                        // TIENDA PUBLICA
                        // ==========================
                        .requestMatchers(HttpMethod.GET, "/api/products").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/settings").permitAll()

                        // ==========================
                        // LOGIN Y REGISTRO PUBLICO
                        // ==========================
                        .requestMatchers(HttpMethod.POST, "/api/users/register").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/users/login").permitAll()

                        // ==========================
                        // CREAR PEDIDO PUBLICO
                        // ==========================
                        .requestMatchers(HttpMethod.POST, "/api/customer-orders").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/orders").permitAll()

                        // ==========================
                        // MIS PEDIDOS DEL USUARIO
                        // Permite que el usuario vea sus pedidos
                        // ==========================
                        .requestMatchers(HttpMethod.GET, "/api/customer-orders/user/*").permitAll()

                        // ==========================
                        // BLOQUEAR LECTURA PUBLICA GENERAL DE PEDIDOS
                        // ==========================
                        .requestMatchers(HttpMethod.GET, "/api/orders").denyAll()
                        .requestMatchers(HttpMethod.GET, "/api/orders/**").denyAll()
                        .requestMatchers(HttpMethod.PUT, "/api/orders/**").denyAll()
                        .requestMatchers(HttpMethod.DELETE, "/api/orders/**").denyAll()

                        .requestMatchers(HttpMethod.GET, "/api/customer-orders").denyAll()
                        .requestMatchers(HttpMethod.PUT, "/api/customer-orders/**").denyAll()
                        .requestMatchers(HttpMethod.DELETE, "/api/customer-orders/**").denyAll()

                        // ==========================
                        // TODO LO DEMAS BLOQUEADO
                        // ==========================
                        .anyRequest().denyAll()
                );

        return http.build();
    }
}