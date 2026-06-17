package com.taskmanager.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.*;
import org.springframework.web.filter.CorsFilter;

import java.util.List;
import java.util.ArrayList;
import org.springframework.beans.factory.annotation.Value;

@Configuration
public class CorsConfig {

    @Value("${app.cors.allowed-origins:http://localhost:3000,http://localhost:5500,http://127.0.0.1:5500}")
    private String allowedOrigins;

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        if (allowedOrigins != null && !allowedOrigins.isEmpty()) {
            List<String> origins = new ArrayList<>();
            for (String origin : allowedOrigins.split(",")) {
                origins.add(origin.trim());
            }
            config.setAllowedOrigins(origins);
        } else {
            config.setAllowedOrigins(List.of("http://localhost:5500", "http://127.0.0.1:5500", "http://localhost:3000"));
        }
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}