package com.jonzko.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;

@Configuration
public class PublicSettingsBypassConfig {

    @Bean
    public WebSecurityCustomizer publicSettingsWebSecurityCustomizer() {
        return web -> web.ignoring().requestMatchers(
                HttpMethod.GET,
                "/api/settings",
                "/api/settings/**"
        );
    }
}