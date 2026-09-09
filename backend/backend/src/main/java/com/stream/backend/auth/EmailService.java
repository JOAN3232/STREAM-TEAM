package com.stream.backend.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationEmail(
            String recipientEmail,
            String verificationUrl
    ) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setFrom(fromEmail);
        message.setTo(recipientEmail);
        message.setSubject(
                "Verify your STREAM account"
        );

        message.setText(
                "Welcome to STREAM!\n\n" +
                "Click the link below to set your password and complete your account:\n\n" +
                verificationUrl +
                "\n\nIf you did not create this account, you can ignore this email."
        );

        mailSender.send(message);
    }
}