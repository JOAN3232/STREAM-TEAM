package com.stream.user.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stream.user.dto.ApiError;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Instant;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.web.AuthenticationEntryPoint;

@Configuration
public class SecurityHandlersConfig {

    @Bean
    AuthenticationEntryPoint jsonAuthEntryPoint(ObjectMapper mapper) {
        return (request, response, authException) -> {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            mapper.writeValue(response.getOutputStream(), new ApiError(
                    Instant.now(),
                    HttpStatus.UNAUTHORIZED.value(),
                    "Invalid or expired token.",
                    request.getRequestURI()));
        };
    }
}
