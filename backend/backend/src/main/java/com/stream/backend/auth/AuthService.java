package com.stream.backend.auth;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(String email) {

        String cleanEmail = email.trim().toLowerCase();

        Optional<User> existingUser =
                userRepository.findByEmail(cleanEmail);

        if (existingUser.isPresent()) {
            return existingUser.get();
        }

        User user = new User();
        user.setEmail(cleanEmail);
        user.setEmailVerified(false);

        String verificationToken =
                UUID.randomUUID().toString();

        user.setVerificationToken(
                verificationToken
        );

        return userRepository.save(user);
    }

    public User createVerificationToken(
            String email
    ) {

        String cleanEmail =
                email.trim().toLowerCase();

        User user = userRepository
                .findByEmail(cleanEmail)
                .orElseGet(() ->
                        registerUser(cleanEmail)
                );

        user.setVerificationToken(
                UUID.randomUUID().toString()
        );

        user.setEmailVerified(false);

        return userRepository.save(user);
    }

    public User verifyEmail(String token) {

        User user = userRepository.findAll()
                .stream()
                .filter(item ->
                        token.equals(
                                item.getVerificationToken()
                        )
                )
                .findFirst()
                .orElseThrow(() ->
                        new RuntimeException(
                                "Invalid verification token"
                        )
                );

        user.setEmailVerified(true);

        return userRepository.save(user);
    }

    public User setPassword(
            String token,
            String password
    ) {

        User user = userRepository.findAll()
                .stream()
                .filter(item ->
                        token.equals(
                                item.getVerificationToken()
                        )
                )
                .findFirst()
                .orElseThrow(() ->
                        new RuntimeException(
                                "Invalid verification token"
                        )
                );

        user.setPassword(
                passwordEncoder.encode(password)
        );

        user.setEmailVerified(true);
        user.setVerificationToken(null);

        return userRepository.save(user);
    }

    public User login(
            String email,
            String password
    ) {

        User user = userRepository
                .findByEmailIgnoreCase(
                        email.trim()
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Invalid email or password"
                        )
                );

        if (user.getPassword() == null ||
                !passwordEncoder.matches(
                        password,
                        user.getPassword()
                )) {

            throw new RuntimeException(
                    "Invalid email or password"
            );
        }

        return user;
    }

    public User selectPlan(
            String userId,
            String plan
    ) {

        User user = userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );

        user.setSelectedPlan(plan);

        return userRepository.save(user);
    }
}