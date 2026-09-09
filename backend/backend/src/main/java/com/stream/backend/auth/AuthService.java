package com.stream.backend.auth;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
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

    // =========================
    // REGISTER USER
    // =========================

    public User registerUser(String email) {

        String cleanEmail =
                email.trim().toLowerCase();

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

    // =========================
    // CREATE VERIFICATION TOKEN
    // =========================

    public User createVerificationToken(
            String email
    ) {

        String cleanEmail =
                email.trim().toLowerCase();

        User user =
                userRepository
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

    // =========================
    // VERIFY EMAIL
    // =========================

    public User verifyEmail(
            String token
    ) {

        User user =
                userRepository
                        .findAll()
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

    // =========================
    // SET PASSWORD
    // =========================

    public User setPassword(
            String token,
            String password
    ) {

        User user =
                userRepository
                        .findAll()
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

    // =========================
    // LOGIN
    // =========================

    public User login(
            String email,
            String password
    ) {

        String cleanEmail =
                email.trim().toLowerCase();

        User user =
                userRepository
                        .findByEmailIgnoreCase(
                                cleanEmail
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Invalid email or password"
                                )
                        );

        if (user.getPassword() == null
                || !passwordEncoder.matches(
                        password,
                        user.getPassword()
                )) {

            throw new RuntimeException(
                    "Invalid email or password"
            );
        }

        return user;
    }

    // =========================
    // SELECT PLAN
    // =========================

    public User selectPlan(
            String userId,
            String plan
    ) {

        User user =
                userRepository
                        .findById(userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                )
                        );

        user.setSelectedPlan(
                plan.trim().toLowerCase()
        );

        return userRepository.save(user);
    }

    // =========================
    // OLD EMAIL-BASED ACTIVATION
    // =========================
    // Kept so existing code does not break.
    // New Paystack flow will use userId instead.

    public User activateSubscription(
            String email,
            String plan,
            String paymentReference
    ) {

        String cleanEmail =
                email.trim().toLowerCase();

        User user =
                userRepository
                        .findByEmailIgnoreCase(
                                cleanEmail
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                )
                        );

        String cleanPlan =
                validateAndCleanPlan(plan);

        /*
         * Prevent the same Paystack transaction
         * from extending the subscription again
         * if the callback page is refreshed.
         */
        if (paymentReference != null
                && paymentReference.equals(
                        user.getPaymentReference()
                )
                && "ACTIVE".equalsIgnoreCase(
                        user.getSubscriptionStatus()
                )) {

            return user;
        }

        return activateUser(
                user,
                cleanPlan,
                paymentReference
        );
    }

    // =========================
    // NEW PAYSTACK ACTIVATION
    // =========================
    // This is the method the new Paystack flow
    // should use. It identifies the STREAM user
    // by their MongoDB user ID instead of the
    // email entered during payment.

    public User activateSubscriptionByUserId(
            String userId,
            String plan,
            String paymentReference
    ) {

        if (userId == null
                || userId.isBlank()) {

            throw new IllegalArgumentException(
                    "User ID is required to activate subscription"
            );
        }

        String cleanPlan =
                validateAndCleanPlan(plan);

        User user =
                userRepository
                        .findById(
                                userId.trim()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "STREAM user not found"
                                )
                        );

        /*
         * IMPORTANT:
         *
         * Paystack verification can be requested
         * more than once, for example when the
         * callback page is refreshed.
         *
         * If this exact payment reference has
         * already activated this account, simply
         * return the user instead of giving them
         * another 30 days.
         */
        if (paymentReference != null
                && paymentReference.equals(
                        user.getPaymentReference()
                )
                && "ACTIVE".equalsIgnoreCase(
                        user.getSubscriptionStatus()
                )) {

            return user;
        }

        return activateUser(
                user,
                cleanPlan,
                paymentReference
        );
    }

    // =========================
    // VALIDATE PLAN
    // =========================

    private String validateAndCleanPlan(
            String plan
    ) {

        if (plan == null
                || plan.isBlank()) {

            throw new IllegalArgumentException(
                    "Subscription plan is required"
            );
        }

        String cleanPlan =
                plan.trim().toLowerCase();

        if (!cleanPlan.equals("basic")
                && !cleanPlan.equals("standard")
                && !cleanPlan.equals("premium")) {

            throw new IllegalArgumentException(
                    "Invalid subscription plan"
            );
        }

        return cleanPlan;
    }

    // =========================
    // SAVE ACTIVE SUBSCRIPTION
    // =========================

    private User activateUser(
            User user,
            String plan,
            String paymentReference
    ) {

        Instant startDate =
                Instant.now();

        Instant endDate =
                startDate.plus(
                        30,
                        ChronoUnit.DAYS
                );

        user.setSelectedPlan(plan);

        user.setSubscriptionStatus(
                "ACTIVE"
        );

        user.setPaymentReference(
                paymentReference
        );

        user.setSubscriptionStartDate(
                startDate
        );

        user.setSubscriptionEndDate(
                endDate
        );

        return userRepository.save(user);
    }
}