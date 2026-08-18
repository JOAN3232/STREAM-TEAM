package com.stream.backend;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    private final PaystackService paystackService;

    public PaymentController(PaystackService paystackService) {
        this.paystackService = paystackService;
    }

    @PostMapping("/initialize")
    public ResponseEntity<Map<String, Object>> initializePayment(
            @RequestBody PaymentRequest request
    ) {
        Map<String, Object> response =
                paystackService.initializePayment(request);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/verify/{reference}")
    public ResponseEntity<Map<String, Object>> verifyPayment(
            @PathVariable String reference
    ) {
        Map<String, Object> response =
                paystackService.verifyPayment(reference);

        return ResponseEntity.ok(response);
    }
}