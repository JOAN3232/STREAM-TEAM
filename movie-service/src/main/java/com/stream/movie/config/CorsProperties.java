package com.stream.movie.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "cors")
public class CorsProperties {

    /**
     * Comma-separated origins. Never use * in production.
     */
    private String allowedOrigins = "http://localhost:5173,http://localhost:4173";

    public String getAllowedOrigins() {
        return allowedOrigins;
    }

    public void setAllowedOrigins(String allowedOrigins) {
        this.allowedOrigins = allowedOrigins;
    }

    public String[] originList() {
        return allowedOrigins.split("\\s*,\\s*");
    }
}
