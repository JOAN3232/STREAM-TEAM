package com.stream.movie.exception;

import com.stream.movie.dto.ApiError;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.ResourceAccessException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiError> handleApi(ApiException ex, HttpServletRequest request) {
        log.warn("API error on {}: {}", request.getRequestURI(), ex.getMessage());
        return toResponse(ex.getStatus(), ex.getMessage(), request.getRequestURI());
    }

    @ExceptionHandler(ResourceAccessException.class)
    public ResponseEntity<ApiError> handleTimeout(ResourceAccessException ex, HttpServletRequest request) {
        log.warn("External API timeout on {}", request.getRequestURI(), ex);
        return toResponse(
                HttpStatus.GATEWAY_TIMEOUT,
                "External API timed out. Please try again.",
                request.getRequestURI());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneric(Exception ex, HttpServletRequest request) {
        log.error("Unexpected error on {}", request.getRequestURI(), ex);
        return toResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred.",
                request.getRequestURI());
    }

    private ResponseEntity<ApiError> toResponse(HttpStatus status, String message, String path) {
        ApiError body = new ApiError(Instant.now(), status.value(), message, path);
        return ResponseEntity.status(status).body(body);
    }
}
