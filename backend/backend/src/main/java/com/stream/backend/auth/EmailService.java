
package com.stream.backend.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    @Value("${BREVO_API_KEY:}")
    private String brevoApiKey;

    @Value("${BREVO_SENDER_EMAIL:streamteam.verify@gmail.com}")
    private String senderEmail;

    @Value("${BREVO_SENDER_NAME:STREAM}")
    private String senderName;

    public EmailService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newHttpClient();
    }

    public void sendVerificationEmail(
            String recipientEmail,
            String verificationUrl
    ) {
        if (brevoApiKey == null || brevoApiKey.isBlank()) {
            throw new IllegalStateException("BREVO_API_KEY is not configured");
        }

        String htmlContent = """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Verify your STREAM account</title>
                </head>

                <body style="
                    margin:0;
                    padding:0;
                    background:#09090b;
                    font-family:Arial,Helvetica,sans-serif;
                    color:#ffffff;
                ">
                    <table width="100%%" cellpadding="0" cellspacing="0" border="0"
                           style="background:#09090b;padding:40px 15px;">
                        <tr>
                            <td align="center">

                                <table width="100%%" cellpadding="0" cellspacing="0" border="0"
                                       style="max-width:560px;background:#15121c;border:1px solid #30263d;border-radius:16px;overflow:hidden;">

                                    <tr>
                                        <td style="padding:28px 32px;border-bottom:1px solid #30263d;">
                                            <div style="font-size:30px;font-weight:800;letter-spacing:2px;color:#a855f7;">
                                                STREAM
                                            </div>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:42px 32px;">

                                            <div style="font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:#a855f7;margin-bottom:12px;">
                                                ACCOUNT SETUP
                                            </div>

                                            <h1 style="margin:0 0 18px;font-size:32px;line-height:1.2;color:#ffffff;">
                                                Verify your account
                                            </h1>

                                            <p style="margin:0 0 14px;font-size:16px;line-height:1.6;color:#d4d4d8;">
                                                Welcome to STREAM.
                                            </p>

                                            <p style="margin:0 0 30px;font-size:16px;line-height:1.6;color:#a1a1aa;">
                                                Click the button below to set your password and complete your account.
                                            </p>

                                            <table cellpadding="0" cellspacing="0" border="0">
                                                <tr>
                                                    <td style="border-radius:8px;background:#9333ea;">
                                                        <a href="%s"
                                                           style="display:inline-block;padding:15px 28px;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:8px;">
                                                            Set your password
                                                        </a>
                                                    </td>
                                                </tr>
                                            </table>

                                            <p style="margin:30px 0 8px;font-size:12px;color:#71717a;">
                                                Button not working? Copy this link into your browser:
                                            </p>

                                            <p style="margin:0;word-break:break-all;font-size:12px;line-height:1.6;color:#a78bfa;">
                                                %s
                                            </p>

                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:24px 32px;background:#0f0d14;border-top:1px solid #30263d;">

                                            <p style="margin:0;font-size:12px;line-height:1.6;color:#71717a;">
                                                If you did not create a STREAM account, you can safely ignore this email.
                                            </p>

                                            <p style="margin:12px 0 0;font-size:12px;color:#52525b;">
                                                © STREAM
                                            </p>

                                        </td>
                                    </tr>

                                </table>

                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """.formatted(verificationUrl, verificationUrl);

        try {
            Map<String, Object> payload = Map.of(
                    "sender", Map.of(
                            "name", senderName,
                            "email", senderEmail
                    ),
                    "to", List.of(
                            Map.of("email", recipientEmail)
                    ),
                    "subject", "Verify your STREAM account",
                    "htmlContent", htmlContent
            );

            String json = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .header("accept", "application/json")
                    .header("api-key", brevoApiKey)
                    .header("content-type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

            HttpResponse<String> response = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofString()
            );

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IllegalStateException(
                        "Brevo email send failed: HTTP "
                                + response.statusCode()
                                + " - "
                                + response.body()
                );
            }

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException(
                    "Brevo email send was interrupted",
                    e
            );
        } catch (Exception e) {
            if (e instanceof IllegalStateException illegalStateException) {
                throw illegalStateException;
            }

            throw new IllegalStateException(
                    "Failed to send verification email through Brevo",
                    e
            );
        }
    }
}
