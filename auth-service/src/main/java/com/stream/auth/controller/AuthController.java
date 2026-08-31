package com.stream.auth.controller;

import com.stream.auth.dto.AuthResponse;
import com.stream.auth.dto.LoginRequest;
import com.stream.auth.dto.RegisterRequest;
import com.stream.auth.dto.ResendRequest;
import com.stream.auth.dto.VerifyEmailRequest;
import com.stream.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/verify-email")
    public AuthResponse verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        return authService.verify(request.token());
    }

    @GetMapping("/verify-email")
    public AuthResponse verifyEmailGet(@RequestParam("token") String token) {
        return authService.verify(token);
    }

    @PostMapping("/resend-verification")
    public AuthResponse resend(@Valid @RequestBody ResendRequest request) {
        return authService.resend(request.email());
    }
}
