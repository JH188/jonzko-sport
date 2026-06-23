package com.jonzko.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {

        registry.addMapping("/**")
                .allowedOrigins(
                        "https://jonzko.lat",
                        "https://www.jonzko.lat",
                        "https://jonzko-sport.vercel.app",
                        "https://jonzko-sport-production.up.railway.app",
                        "http://localhost:4200"
                )
                .allowedMethods(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "PATCH",
                        "OPTIONS"
                )
                .allowedHeaders(
                        "Authorization",
                        "Content-Type",
                        "Accept",
                        "Origin",
                        "X-Requested-With"
                )
                .exposedHeaders("Authorization")
                .allowCredentials(false)
                .maxAge(3600);
    }
}