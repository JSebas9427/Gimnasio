package com.gimnasio.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {

        // CORS para la API del gimnasio.
        // OJO: las rutas aquí son RELATIVAS al context-path (/api), igual que en los
        // @RequestMapping de los controladores. "/v1/**" corresponde a /api/v1/**.
        registry.addMapping("/v1/**")
                .allowedOriginPatterns(
                        "http://localhost:[*]",     // Angular dev (4200) y XAMPP (80)
                        "http://127.0.0.1:[*]",
                        "http://192.168.*.*:[*]",   // otros equipos de la red local
                        "http://10.*.*.*:[*]"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);

        // CORS para las peticiones CGI del Dahua
        registry.addMapping("/cgi-bin/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .maxAge(3600);
    }
}
