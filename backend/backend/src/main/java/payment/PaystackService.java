package com.stream.backend;

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

    public PaystackService(
            RestClient.Builder builder,
            @Value("${paystack.secret-key}") String secretKey,
            @Value("${paystack.base-url}") String baseUrl
    ) {
        this.restClient = builder.build();
        this.secretKey = secretKey;
        this.baseUrl = baseUrl;
    }

    public Map<String, Object> initializePayment(PaymentRequest request) {

        long amount = switch (request.getPlan().toLowerCase()) {
            case "basic" -> 250000;
            case "standard" -> 450000;
            case "premium" -> 700000;
            default -> throw new IllegalArgumentException("Invalid plan selected");
        };

        Map<String, Object> body = new HashMap<>();
        body.put("email", request.getEmail());
        body.put("amount", amount);

        body.put(
                "callback_url",
                "http://localhost:5173/payment/callback"
        );

        return restClient.post()
                .uri(baseUrl + "/transaction/initialize")
                .header(
                        HttpHeaders.AUTHORIZATION,
                        "Bearer " + secretKey
                )
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(Map.class);
    }

    public Map<String, Object> verifyPayment(String reference) {

        return restClient.get()
                .uri(baseUrl + "/transaction/verify/" + reference)
                .header(
                        HttpHeaders.AUTHORIZATION,
                        "Bearer " + secretKey
                )
                .retrieve()
                .body(Map.class);
    }
}