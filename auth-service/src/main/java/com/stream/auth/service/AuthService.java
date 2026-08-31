package com.stream.auth.service;

import com.stream.auth.domain.User;
import com.stream.auth.dto.AuthResponse;
import com.stream.auth.dto.LoginRequest;
import com.stream.auth.dto.RegisterRequest;
import com.stream.auth.exception.ApiException;
import com.stream.auth.mail.VerificationMailer;
import com.stream.auth.repository.UserRepository;
import com.stream.auth.security.JwtService;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final VerificationMailer mailer;
    private final SecureRandom random = new SecureRandom();

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            VerificationMailer mailer) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.mailer = mailer;
    }

    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        Instant now = Instant.now();
        User user = userRepository.findByEmailIgnoreCase(email).orElseGet(User::new);

        if (user.getId() != null && user.isVerified()) {
            throw new ApiException(HttpStatus.CONFLICT, "An account with this email already exists.");
        }

        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setVerified(false);
        if (user.getCreatedAt() == null) {
            user.setCreatedAt(now);
        }
        user.setUpdatedAt(now);
        String rawToken = issueToken(user, now);
        userRepository.save(user);
        mailer.sendVerification(email, rawToken);
        return new AuthResponse(null, email, false, "Check your email to verify your account.");
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.email().trim().toLowerCase())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password."));
        if (user.getPasswordHash() == null || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
        }
        if (!user.isVerified()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Please verify your email before signing in.");
        }
        return new AuthResponse(jwtService.createToken(user), user.getEmail(), true, "Signed in.");
    }

    public AuthResponse verify(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Verification token is required.");
        }
        User user = userRepository.findByVerificationTokenHash(sha256(rawToken))
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Invalid or expired verification token."));
        if (user.getVerificationTokenExpiresAt() == null
                || user.getVerificationTokenExpiresAt().isBefore(Instant.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid or expired verification token.");
        }
        user.setVerified(true);
        user.setVerificationTokenHash(null);
        user.setVerificationTokenExpiresAt(null);
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
        return new AuthResponse(jwtService.createToken(user), user.getEmail(), true, "Email verified.");
    }

    public AuthResponse resend(String email) {
        User user = userRepository.findByEmailIgnoreCase(email.trim().toLowerCase())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No account found for that email."));
        if (user.isVerified()) {
            return new AuthResponse(null, user.getEmail(), true, "This account is already verified.");
        }
        String rawToken = issueToken(user, Instant.now());
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
        mailer.sendVerification(user.getEmail(), rawToken);
        return new AuthResponse(null, user.getEmail(), false, "Verification email sent.");
    }

    private String issueToken(User user, Instant now) {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        String raw = HexFormat.of().formatHex(bytes);
        user.setVerificationTokenHash(sha256(raw));
        user.setVerificationTokenExpiresAt(now.plus(24, ChronoUnit.HOURS));
        return raw;
    }

    private static String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to hash verification token", ex);
        }
    }
}
