package com.jonzko.backend.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

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
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)


                .authorizeHttpRequests(auth -> auth

                        // ==========================
                        // PREFLIGHT CORS
                        // ==========================
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        

                        // ==========================
                        // PERSONALIZACIÓN WEB PÚBLICA
                        // ==========================
                        .requestMatchers(HttpMethod.GET, "/api/web-config/settings").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/home/site-settings").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/public/settings-web").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/public/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/settings").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/settings/**").permitAll()

                        // ==========================
                        // HOME PÚBLICO
                        // IMPORTANTE:
                        // Esta familia ya comprobamos que sí funciona en Railway.
                        // ==========================
                        .requestMatchers(HttpMethod.GET, "/api/home/settings").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/home/slides").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/home/**").permitAll()

                        // ==========================
                        // PERSONALIZACIÓN WEB ADMIN
                        // ==========================
                        .requestMatchers(HttpMethod.PUT, "/api/web-config/save")
                        .hasAnyAuthority("ADMIN", "ROLE_ADMIN")

                        .requestMatchers(HttpMethod.PUT, "/api/admin/home/site-settings")
                        .hasAnyAuthority("ADMIN", "ROLE_ADMIN")

                        .requestMatchers(HttpMethod.PUT, "/api/settings")
                        .hasAnyAuthority("ADMIN", "ROLE_ADMIN")

                        .requestMatchers(HttpMethod.PUT, "/api/settings/**")
                        .hasAnyAuthority("ADMIN", "ROLE_ADMIN")

                        .requestMatchers(HttpMethod.PUT, "/api/admin/settings")
                        .hasAnyAuthority("ADMIN", "ROLE_ADMIN")

                        // ==========================
                        // LOGIN ADMIN
                        // ==========================
                        .requestMatchers(HttpMethod.POST, "/api/auth/admin-login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/admin-login/verify-code").permitAll()

                        // ==========================
                        // LOGIN / REGISTRO USUARIO
                        // ==========================
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/verify-email").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/resend-verification-code").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/forgot-password").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/reset-password").permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/users/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/users/register").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/users/verify-email").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/users/resend-verification-code").permitAll()

                        // ==========================
                        // TIENDA PÚBLICA
                        // ==========================
                        .requestMatchers(HttpMethod.GET, "/api/products").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()

                        // ==========================
                        // CREAR PEDIDO PÚBLICO
                        // ==========================
                        .requestMatchers(HttpMethod.POST, "/api/customer-orders").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/orders").permitAll()

                        // ==========================
                        // MIS PEDIDOS CON JWT
                        // ==========================
                        .requestMatchers(HttpMethod.GET, "/api/customer-orders/my-orders").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/customer-orders/user/**").authenticated()

                        // ==========================
                        // ADMIN CON JWT
                        // ==========================
                        .requestMatchers("/api/admin/**").hasAnyAuthority("ADMIN", "ROLE_ADMIN")
                        .requestMatchers("/api/products/admin/**").hasAnyAuthority("ADMIN", "ROLE_ADMIN")
                        .requestMatchers("/api/admin/product-variants/**").hasAnyAuthority("ADMIN", "ROLE_ADMIN")

                        // ==========================
                        // PAGOS ADMIN
                        // ==========================
                        .requestMatchers(HttpMethod.PUT, "/api/orders/*/payment-status")
                        .hasAnyAuthority("ADMIN", "ROLE_ADMIN")

                        // ==========================
                        // BLOQUEOS DE PEDIDOS
                        // ==========================
                        .requestMatchers(HttpMethod.GET, "/api/orders").denyAll()
                        .requestMatchers(HttpMethod.GET, "/api/orders/**").denyAll()
                        .requestMatchers(HttpMethod.PUT, "/api/orders/**").denyAll()
                        .requestMatchers(HttpMethod.DELETE, "/api/orders/**").denyAll()

                        .requestMatchers(HttpMethod.GET, "/api/customer-orders").denyAll()
                        .requestMatchers(HttpMethod.PUT, "/api/customer-orders/**").denyAll()
                        .requestMatchers(HttpMethod.DELETE, "/api/customer-orders/**").denyAll()

                        // ==========================
                        // TODO LO DEMÁS BLOQUEADO
                        // ==========================
                        .anyRequest().denyAll()
                )

                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of(
                "https://jonzko.lat",
                "https://www.jonzko.lat",
                "https://jonzko-sport.vercel.app",
                "https://jonzko-sport-production.up.railway.app",
                "http://localhost:4200"
        ));

        config.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "DELETE",
                "PATCH",
                "OPTIONS"
        ));

        config.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type",
                "Accept",
                "Origin",
                "X-Requested-With",
                "Cache-Control",
                "Pragma"
        ));

        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(false);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}