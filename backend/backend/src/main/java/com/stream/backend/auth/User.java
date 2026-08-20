package com.stream.backend.auth;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String email;
    private String password;
    private boolean emailVerified;

    private String selectedPlan;

    // Subscription/payment information
    private String subscriptionStatus;
    private String paymentReference;
    private Instant subscriptionStartDate;
    private Instant subscriptionEndDate;

    private String verificationToken;

    public User() {
    }

    public User(String email) {
        this.email = email;
        this.emailVerified = false;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public String getSelectedPlan() {
        return selectedPlan;
    }

    public void setSelectedPlan(String selectedPlan) {
        this.selectedPlan = selectedPlan;
    }

    public String getSubscriptionStatus() {
        return subscriptionStatus;
    }

    public void setSubscriptionStatus(String subscriptionStatus) {
        this.subscriptionStatus = subscriptionStatus;
    }

    public String getPaymentReference() {
        return paymentReference;
    }

    public void setPaymentReference(String paymentReference) {
        this.paymentReference = paymentReference;
    }

    public Instant getSubscriptionStartDate() {
        return subscriptionStartDate;
    }

    public void setSubscriptionStartDate(Instant subscriptionStartDate) {
        this.subscriptionStartDate = subscriptionStartDate;
    }

    public Instant getSubscriptionEndDate() {
        return subscriptionEndDate;
    }

    public void setSubscriptionEndDate(Instant subscriptionEndDate) {
        this.subscriptionEndDate = subscriptionEndDate;
    }

    public String getVerificationToken() {
        return verificationToken;
    }

    public void setVerificationToken(String verificationToken) {
        this.verificationToken = verificationToken;
    }
}