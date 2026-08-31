package com.stream.user.dto;

import jakarta.validation.constraints.NotBlank;

public record PaymentInitRequest(@NotBlank String plan, String email) {
}
