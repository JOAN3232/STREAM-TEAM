package com.stream.backend.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;
    private final EmailService emailService;

    public AuthController(
            AuthService authService,
            EmailService emailService
    ) {
        this.authService = authService;
        this.emailService = emailService;
    }

    // REGISTER USER
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(
            @RequestBody Map<String, String> request
    ) {

        String email = request.get("email");

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "success", false,
                            "message", "Email is required"
                    )
            );
        }

        User user = authService.registerUser(email);

        return ResponseEntity.ok(
                Map.of(
                        "success", true,
                        "message", "User registered",
                        "email", user.getEmail()
                )
        );
    }

    // SEND VERIFICATION EMAIL
    @PostMapping("/send-verification")
    public ResponseEntity<Map<String, Object>> sendVerification(
            @RequestBody Map<String, String> request
    ) {

        String email = request.get("email");

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "success", false,
                            "message", "Email is required"
                    )
            );
        }

        User user =
                authService.createVerificationToken(email);

        String verificationUrl =
                "http://localhost:5173/set-password?token="
                        + user.getVerificationToken();

        emailService.sendVerificationEmail(
                user.getEmail(),
                verificationUrl
        );

        Map<String, Object> response =
                new HashMap<>();

        response.put("success", true);
        response.put(
                "message",
                "Verification email sent"
        );
        response.put(
                "email",
                user.getEmail()
        );

        return ResponseEntity.ok(response);
    }

    // VERIFY EMAIL
    @GetMapping("/verify")
    public ResponseEntity<Map<String, Object>> verify(
            @RequestParam String token
    ) {

        User user =
                authService.verifyEmail(token);

        return ResponseEntity.ok(
                Map.of(
                        "success", true,
                        "message",
                        "Email verified successfully",
                        "email",
                        user.getEmail()
                )
        );
    }

    // SET PASSWORD
    @PostMapping("/set-password")
    public ResponseEntity<Map<String, Object>> setPassword(
            @RequestBody Map<String, String> request
    ) {

        String token = request.get("token");
        String password = request.get("password");

        if (token == null ||
                token.isBlank() ||
                password == null ||
                password.isBlank()) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "success", false,
                            "message",
                            "Token and password are required"
                    )
            );
        }

        User user =
                authService.setPassword(
                        token,
                        password
                );

        return ResponseEntity.ok(
                Map.of(
                        "success", true,
                        "message",
                        "Password created successfully",
                        "token",
                        user.getId(),
                        "email",
                        user.getEmail()
                )
        );
    }

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestBody Map<String, String> request
    ) {

        String email = request.get("email");
        String password = request.get("password");

        if (email == null ||
                email.isBlank() ||
                password == null ||
                password.isBlank()) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "success", false,
                            "message",
                            "Email and password are required"
                    )
            );
        }

        User user =
                authService.login(
                        email,
                        password
                );

        return ResponseEntity.ok(
                Map.of(
                        "success", true,
                        "message",
                        "Login successful",
                        "token",
                        user.getId(),
                        "email",
                        user.getEmail()
                )
        );
    }

    // SELECT SUBSCRIPTION PLAN
    @PostMapping("/select-plan")
    public ResponseEntity<Map<String, Object>> selectPlan(
            @RequestBody Map<String, String> request
    ) {

        String token = request.get("token");
        String plan = request.get("plan");

        if (token == null ||
                token.isBlank() ||
                plan == null ||
                plan.isBlank()) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "success", false,
                            "message",
                            "Token and plan are required"
                    )
            );
        }

        User user =
                authService.selectPlan(
                        token,
                        plan
                );

        return ResponseEntity.ok(
                Map.of(
                        "success", true,
                        "message",
                        "Plan selected successfully",
                        "token",
                        user.getId(),
                        "email",
                        user.getEmail(),
                        "plan",
                        user.getSelectedPlan()
                )
        );
    }
}