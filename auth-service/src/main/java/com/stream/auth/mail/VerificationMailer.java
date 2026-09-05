package com.stream.auth.mail;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class VerificationMailer {

    private static final Logger log =
            LoggerFactory.getLogger(VerificationMailer.class);

    public void sendVerification(String email, String rawToken) {

        String link = "http://localhost:5173/verify-email?token="
                + URLEncoder.encode(rawToken, StandardCharsets.UTF_8)
                + "&email="
                + URLEncoder.encode(email, StandardCharsets.UTF_8);

        log.info("==============================================");
        log.info("EMAIL VERIFICATION LINK");
        log.info("Email: {}", email);
        log.info("Verification URL: {}", link);
        log.info("==============================================");
    }
}
