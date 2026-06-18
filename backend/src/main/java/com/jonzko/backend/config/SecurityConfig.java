package com.jonzko.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.jonzko.backend.security.JwtAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)

                .authorizeHttpRequests(auth -> auth

                        // ==========================
                        // PREFLIGHT CORS
                        // ==========================
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // ==========================
                        // LOGIN ADMIN JWT
                        // ==========================
                        .requestMatchers(HttpMethod.POST, "/api/auth/admin-login").permitAll()

                        // ==========================
                        // LOGIN, REGISTRO Y RECUPERACION USUARIO
                        // ==========================
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/users/verify-email").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/users/resend-verification-code").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/forgot-password").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/reset-password").permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/users/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/users/register").permitAll()

                        // ==========================
                        // TIENDA PUBLICA
                        // ==========================
                        .requestMatchers(HttpMethod.GET, "/api/products").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/settings").permitAll()

                        // ==========================
                        // CREAR PEDIDO PUBLICO
                        // ==========================
                        .requestMatchers(HttpMethod.POST, "/api/customer-orders").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/orders").permitAll()

                        // ==========================
                        // MIS PEDIDOS PROTEGIDO CON JWT
                        // ==========================
                        .requestMatchers(HttpMethod.GET, "/api/customer-orders/my-orders").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/customer-orders/user/**").authenticated()

                        // ==========================
                        // ADMIN PROTEGIDO CON JWT
                        // ==========================
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/products/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/admin/product-variants/**").hasRole("ADMIN")

                        // ==========================
                        // CONFIGURACION ADMIN
                        // ==========================
                        .requestMatchers(HttpMethod.PUT, "/api/settings").hasRole("ADMIN")

                        // ==========================
                        // PAGOS ADMIN
                        // ==========================
                        .requestMatchers(HttpMethod.PUT, "/api/orders/*/payment-status").hasRole("ADMIN")

                        // ==========================
                        // BLOQUEOS PUBLICOS DE ORDERS ANTIGUO
                        // ==========================
                        .requestMatchers(HttpMethod.GET, "/api/orders").denyAll()
                        .requestMatchers(HttpMethod.GET, "/api/orders/**").denyAll()
                        .requestMatchers(HttpMethod.PUT, "/api/orders/**").denyAll()
                        .requestMatchers(HttpMethod.DELETE, "/api/orders/**").denyAll()

                        // ==========================
                        // BLOQUEOS PUBLICOS DE CUSTOMER ORDERS
                        // ==========================
                        .requestMatchers(HttpMethod.GET, "/api/customer-orders").denyAll()
                        .requestMatchers(HttpMethod.PUT, "/api/customer-orders/**").denyAll()
                        .requestMatchers(HttpMethod.DELETE, "/api/customer-orders/**").denyAll()

                        // ==========================
                        // TODO LO DEMAS BLOQUEADO
                        // ==========================
                        .anyRequest().denyAll()
                )

                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}