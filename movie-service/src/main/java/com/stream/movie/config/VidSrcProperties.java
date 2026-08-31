package com.stream.movie.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "vidsrc")
public class VidSrcProperties {

    /**
     * Official embed origin from project-approved VidSrc docs. No API key required.
     */
    private String baseUrl = "https://vidsrcme.ru";

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }
}
