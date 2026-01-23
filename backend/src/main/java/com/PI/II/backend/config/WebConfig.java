package com.PI.II.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull; 
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) { 
        registry.addMapping("/**") // Libera para todas as rotas (computadores, impresoras, etc)
            .allowedOrigins("*") // Libera para qualquer Frontend (Porta 5500, 3000, etc)
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Libera os métodos
            .allowedHeaders("*"); // Libera todos os cabeçalhos
    }
}