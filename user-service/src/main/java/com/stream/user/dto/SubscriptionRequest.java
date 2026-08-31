package com.stream.user.dto;

import jakarta.validation.constraints.NotBlank;

public class SubscriptionRequest {

    @NotBlank(message = "Plan is required.")
    private String plan;

    public String getPlan() {
        return plan;
    }

    public void setPlan(String plan) {
        this.plan = plan;
    }
}
