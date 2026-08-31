package com.stream.user.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.stream.user.config.PaystackProperties;
import com.stream.user.domain.Payment;
import com.stream.user.domain.Subscription;
import com.stream.user.exception.ApiException;
import com.stream.user.repository.PaymentRepository;
import com.stream.user.repository.SubscriptionRepository;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Locale;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class BillingService {

    private final SubscriptionRepository subscriptionRepository;
    private final PaymentRepository paymentRepository;
    private final RestClient paystackRestClient;
    private final PaystackProperties paystackProperties;

    public BillingService(
            SubscriptionRepository subscriptionRepository,
            PaymentRepository paymentRepository,
            RestClient paystackRestClient,
            PaystackProperties paystackProperties) {
        this.subscriptionRepository = subscriptionRepository;
        this.paymentRepository = paymentRepository;
        this.paystackRestClient = paystackRestClient;
        this.paystackProperties = paystackProperties;
    }

    public Subscription current(String userId) {
        return subscriptionRepository.findByUserId(userId).orElse(null);
    }

    public Subscription selectPlan(String userId, String plan) {
        String normalized = normalizePlan(plan);
        Subscription subscription = subscriptionRepository.findByUserId(userId).orElseGet(Subscription::new);
        subscription.setUserId(userId);
        subscription.setPlan(normalized);
        if (subscription.getStatus() == null) {
            subscription.setStatus("PENDING");
        }
        return subscriptionRepository.save(subscription);
    }

    public Map<String, Object> initializePayment(String userId, String email, String plan) {
        if (!paystackProperties.configured()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Paystack TEST credentials are not configured.");
        }
        String normalized = normalizePlan(plan);
        long amount = amountFor(normalized);
        Payment payment = new Payment();
        payment.setUserId(userId);
        payment.setPlan(normalized);
        payment.setStatus("INITIALIZED");
        payment.setAmountKobo(amount);
        payment.setCreatedAt(Instant.now());
        paymentRepository.save(payment);

        try {
            JsonNode body = paystackRestClient.post()
                    .uri("/transaction/initialize")
                    .body(Map.of(
                            "email", email == null || email.isBlank() ? userId + "@stream.local" : email,
                            "amount", amount,
                            "callback_url", paystackProperties.getCallbackUrl(),
                            "metadata", Map.of("userId", userId, "plan", normalized, "paymentId", payment.getId())
                    ))
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (request, response) -> {
                        throw new ApiException(HttpStatus.BAD_GATEWAY, "Paystack initialize failed.");
                    })
                    .body(JsonNode.class);
            if (body == null || !body.path("status").asBoolean(false)) {
                throw new ApiException(HttpStatus.BAD_GATEWAY, "Paystack initialize failed.");
            }
            JsonNode data = body.path("data");
            String reference = data.path("reference").asText();
            String checkoutUrl = data.path("authorization_url").asText();
            payment.setReference(reference);
            paymentRepository.save(payment);
            selectPlan(userId, normalized);
            return Map.of(
                    "authorizationUrl", checkoutUrl,
                    "reference", reference,
                    "publicKey", paystackProperties.getPublicKey() == null ? "" : paystackProperties.getPublicKey()
            );
        } catch (ApiException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Unable to reach Paystack TEST API.");
        }
    }

    public Subscription verifyPayment(String userId, String reference) {
        if (reference == null || reference.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Payment reference is required.");
        }
        if (!paystackProperties.configured()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Paystack TEST credentials are not configured.");
        }
        try {
            JsonNode body = paystackRestClient.get()
                    .uri("/transaction/verify/{reference}", reference)
                    .retrieve()
                    .onStatus(status -> status.value() == 404, (request, response) -> {
                        throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid payment reference.");
                    })
                    .onStatus(HttpStatusCode::isError, (request, response) -> {
                        throw new ApiException(HttpStatus.BAD_GATEWAY, "Paystack verification failed.");
                    })
                    .body(JsonNode.class);
            if (body == null || !body.path("status").asBoolean(false)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid payment reference.");
            }
            JsonNode data = body.path("data");
            String paystackStatus = data.path("status").asText("");
            if (!"success".equalsIgnoreCase(paystackStatus)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Payment has not been completed.");
            }
            String plan = data.path("metadata").path("plan").asText("STANDARD");
            Payment payment = paymentRepository.findByReference(reference).orElseGet(Payment::new);
            payment.setUserId(userId);
            payment.setReference(reference);
            payment.setPlan(normalizePlan(plan));
            payment.setStatus("SUCCESS");
            payment.setVerifiedAt(Instant.now());
            if (payment.getCreatedAt() == null) {
                payment.setCreatedAt(Instant.now());
            }
            paymentRepository.save(payment);

            Subscription subscription = subscriptionRepository.findByUserId(userId).orElseGet(Subscription::new);
            Instant start = Instant.now();
            subscription.setUserId(userId);
            subscription.setPlan(normalizePlan(plan));
            subscription.setStatus("ACTIVE");
            subscription.setStartDate(start);
            subscription.setEndDate(start.plus(30, ChronoUnit.DAYS));
            return subscriptionRepository.save(subscription);
        } catch (ApiException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Unable to verify payment with Paystack.");
        }
    }

    private String normalizePlan(String plan) {
        String value = plan == null ? "STANDARD" : plan.trim().toUpperCase(Locale.ROOT);
        return switch (value) {
            case "BASIC", "STANDARD", "PREMIUM" -> value;
            default -> throw new ApiException(HttpStatus.BAD_REQUEST, "Plan must be BASIC, STANDARD, or PREMIUM.");
        };
    }

    private long amountFor(String plan) {
        return switch (plan) {
            case "BASIC" -> 250000L;
            case "PREMIUM" -> 700000L;
            default -> 450000L;
        };
    }
}
