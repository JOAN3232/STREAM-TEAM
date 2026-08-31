package com.stream.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class PaymentInitializeRequest {

    @NotBlank(message = "Plan is required.")
    private String plan;

    @NotBlank(message = "Email is required.")
    @Email(message = "Email must be valid.")
    private String email;

    public String getPlan() {
        return plan;
    }

    public void setPlan(String plan) {
        this.plan = plan;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
