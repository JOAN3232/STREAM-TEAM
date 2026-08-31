package com.stream.movie.config;

import java.time.Duration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableConfigurationProperties({TmdbProperties.class, CorsProperties.class, VidSrcProperties.class})
public class AppConfig {

    @Bean
    RestClient tmdbRestClient(TmdbProperties properties) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofMillis(properties.getConnectTimeoutMs()));
        factory.setReadTimeout(Duration.ofMillis(properties.getReadTimeoutMs()));

        RestClient.Builder builder = RestClient.builder()
                .baseUrl(properties.getBaseUrl())
                .requestFactory(factory)
                .defaultHeader("Accept", "application/json");

        if (properties.getReadAccessKey() != null && !properties.getReadAccessKey().isBlank()) {
            builder.defaultHeader("Authorization", "Bearer " + properties.getReadAccessKey());
        }

        return builder.build();
    }

    @Bean
    WebMvcConfigurer corsConfigurer(CorsProperties corsProperties) {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins(corsProperties.originList())
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}
