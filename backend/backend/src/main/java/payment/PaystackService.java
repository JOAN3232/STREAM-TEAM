package com.stream.backend;

import com.stream.backend.auth.AuthService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.Map;

@Service
public class PaystackService {

    private final RestClient restClient;
    private final String secretKey;
    private final String baseUrl;
    private final AuthService authService;

    public PaystackService(
            RestClient.Builder builder,
            @Value("${paystack.secret-key}") String secretKey,
            @Value("${paystack.base-url}") String baseUrl,
            AuthService authService
    ) {
        this.restClient = builder.build();
        this.secretKey = secretKey;
        this.baseUrl = baseUrl;
        this.authService = authService;
    }

    public Map<String, Object> initializePayment(
            PaymentRequest request
    ) {

        if (request.getEmail() == null
                || request.getEmail().isBlank()) {

            throw new IllegalArgumentException(
                    "Email is required"
            );
        }

        if (request.getPlan() == null
                || request.getPlan().isBlank()) {

            throw new IllegalArgumentException(
                    "Plan is required"
            );
        }

        if (request.getUserId() == null
                || request.getUserId().isBlank()) {

            throw new IllegalArgumentException(
                    "STREAM user ID is required"
            );
        }

        String email =
                request.getEmail()
                        .trim()
                        .toLowerCase();

        String plan =
                request.getPlan()
                        .trim()
                        .toLowerCase();

        String userId =
                request.getUserId()
                        .trim();

        long amount =
                getExpectedAmount(plan);

        /*
         * Paystack returns this metadata after
         * verification.
         *
         * We use userId to determine which STREAM
         * account receives the subscription.
         */
        Map<String, Object> metadata =
                new HashMap<>();

        metadata.put(
                "plan",
                plan
        );

        metadata.put(
                "userId",
                userId
        );

        Map<String, Object> body =
                new HashMap<>();

        body.put(
                "email",
                email
        );

        body.put(
                "amount",
                amount
        );

        body.put(
                "metadata",
                metadata
        );

        body.put(
                "callback_url",
                "http://localhost:5173/payment/callback"
        );

        return restClient
                .post()
                .uri(
                        baseUrl +
                                "/transaction/initialize"
                )
                .header(
                        HttpHeaders.AUTHORIZATION,
                        "Bearer " + secretKey
                )
                .contentType(
                        MediaType.APPLICATION_JSON
                )
                .body(body)
                .retrieve()
                .body(Map.class);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> verifyPayment(
            String reference
    ) {

        if (reference == null
                || reference.isBlank()) {

            throw new IllegalArgumentException(
                    "Payment reference is required"
            );
        }

        Map<String, Object> response =
                restClient
                        .get()
                        .uri(
                                baseUrl +
                                        "/transaction/verify/" +
                                        reference.trim()
                        )
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                "Bearer " + secretKey
                        )
                        .retrieve()
                        .body(Map.class);

        if (response == null) {

            throw new RuntimeException(
                    "Empty response from Paystack"
            );
        }

        /*
         * Paystack API request itself must
         * have succeeded.
         */
        if (!Boolean.TRUE.equals(
                response.get("status")
        )) {

            return response;
        }

        Object dataObject =
                response.get("data");

        if (!(dataObject instanceof Map)) {

            throw new RuntimeException(
                    "Transaction data missing from Paystack"
            );
        }

        Map<String, Object> data =
                (Map<String, Object>) dataObject;

        String paymentStatus =
                String.valueOf(
                        data.get("status")
                );

        /*
         * The actual transaction must also
         * have succeeded.
         */
        if (!"success".equalsIgnoreCase(
                paymentStatus
        )) {

            return response;
        }

        Object referenceObject =
                data.get("reference");

        if (referenceObject == null) {

            throw new RuntimeException(
                    "Payment reference missing from Paystack"
            );
        }

        String paymentReference =
                String.valueOf(
                        referenceObject
                ).trim();

        /*
         * Read STREAM information from
         * verified Paystack metadata.
         */
        Object metadataObject =
                data.get("metadata");

        if (!(metadataObject instanceof Map)) {

            throw new RuntimeException(
                    "Payment metadata is missing"
            );
        }

        Map<String, Object> metadata =
                (Map<String, Object>) metadataObject;

        Object planObject =
                metadata.get("plan");

        Object userIdObject =
                metadata.get("userId");

        if (planObject == null) {

            throw new RuntimeException(
                    "Plan missing from payment metadata"
            );
        }

        if (userIdObject == null) {

            throw new RuntimeException(
                    "STREAM user ID missing from payment metadata"
            );
        }

        String plan =
                String.valueOf(
                        planObject
                )
                        .trim()
                        .toLowerCase();

        String userId =
                String.valueOf(
                        userIdObject
                )
                        .trim();

        /*
         * Do not trust the plan name alone.
         *
         * Confirm the amount Paystack actually
         * reports as paid matches that plan.
         */
        long expectedAmount =
                getExpectedAmount(plan);

        Object amountObject =
                data.get("amount");

        if (!(amountObject instanceof Number)) {

            throw new RuntimeException(
                    "Payment amount missing from Paystack"
            );
        }

        long paidAmount =
                ((Number) amountObject)
                        .longValue();

        if (paidAmount != expectedAmount) {

            throw new RuntimeException(
                    "Payment amount does not match selected plan"
            );
        }

        /*
         * Paystack normally reports NGN for
         * these transactions.
         */
        Object currencyObject =
                data.get("currency");

        if (currencyObject != null) {

            String currency =
                    String.valueOf(
                            currencyObject
                    );

            if (!"NGN".equalsIgnoreCase(
                    currency
            )) {

                throw new RuntimeException(
                        "Unexpected payment currency"
                );
            }
        }

        System.out.println(
                "PAYSTACK PAYMENT VERIFIED"
        );

        System.out.println(
                "STREAM USER ID: [" +
                        userId +
                        "]"
        );

        System.out.println(
                "STREAM PLAN: [" +
                        plan +
                        "]"
        );

        /*
         * Subscription is activated only
         * after successful Paystack verification.
         */
        authService
                .activateSubscriptionByUserId(
                        userId,
                        plan,
                        paymentReference
                );

        return response;
    }

    private long getExpectedAmount(
            String plan
    ) {

        return switch (
                plan.trim().toLowerCase()
        ) {

            case "basic" ->
                    250000L;

            case "standard" ->
                    450000L;

            case "premium" ->
                    700000L;

            default ->
                    throw new IllegalArgumentException(
                            "Invalid plan selected"
                    );
        };
    }
}