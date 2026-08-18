package com.stream.backend;

public class PaymentRequest {

    private String email;
    private String plan;

    public PaymentRequest() {
    }

    public PaymentRequest(String email, String plan) {
        this.email = email;
        this.plan = plan;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPlan() {
        return plan;
    }

    public void setPlan(String plan) {
        this.plan = plan;
    }
}