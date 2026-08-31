package com.stream.auth.mail;

import com.stream.auth.config.ResendProperties;
import com.stream.auth.exception.ApiException;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class VerificationMailer {

    private static final Logger log = LoggerFactory.getLogger(VerificationMailer.class);

    private final RestClient resendRestClient;
    private final ResendProperties properties;

    public VerificationMailer(RestClient resendRestClient, ResendProperties properties) {
        this.resendRestClient = resendRestClient;
        this.properties = properties;
    }

    public void sendVerification(String email, String rawToken) {
        String link = properties.getFrontendUrl() + "/verify-email?token=" + rawToken
                + "&email=" + java.net.URLEncoder.encode(email, java.nio.charset.StandardCharsets.UTF_8);
        log.info("Verification link for {}: {}", email, link);
        if (!properties.configured()) {
            log.warn("RESEND_API_KEY or MAIL_FROM is not set. Verification link for {} (dev only): {}", email, link);
            return;
        }

        try {
            resendRestClient.post()
                    .uri("/emails")
                    .header("Authorization", "Bearer " + properties.getApiKey())
                    .header("Content-Type", "application/json")
                    .body(Map.of(
                            "from", properties.getFrom(),
                            "to", java.util.List.of(email),
                            "subject", "Verify your STREAM account",
                            "html", verificationEmailHtml(link)
                    ))
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (request, response) -> {
                        throw new ApiException(
                                HttpStatus.BAD_GATEWAY,
                                "Could not send verification email.");
                    })
                    .toBodilessEntity();
        } catch (ApiException ex) {
            log.warn("Verification email request was rejected by Resend for {}. Dev fallback link: {}", email, link);
        } catch (Exception ex) {
            log.warn("Resend call failed for {}. Dev fallback link: {}", email, link, ex);
        }
    }

    private String verificationEmailHtml(String link) {
        return """
                <!doctype html>
                <html lang="en">
                  <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>Verify your STREAM account</title>
                  </head>
                  <body style="margin:0;padding:0;background-color:#05030a;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%%" style="background:linear-gradient(180deg,#05030a 0%%,#0b0714 100%%);margin:0;padding:32px 0;">
                      <tr>
                        <td align="center">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%%" style="max-width:640px;margin:0 auto;">
                            <tr>
                              <td style="padding:0 24px 24px 24px;text-align:center;">
                                <div style="display:inline-block;font-size:30px;font-weight:700;letter-spacing:0.18em;color:#8b5cf6;">STREAM</div>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:0 16px;">
                                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%%" style="background:#0d0916;border:1px solid rgba(255,255,255,0.08);border-radius:28px;overflow:hidden;">
                                  <tr>
                                    <td style="background:radial-gradient(circle at top left,#6d28d9 0%%,#0d0916 58%%);padding:48px 40px 24px 40px;text-align:left;">
                                      <div style="display:inline-block;padding:8px 14px;border:1px solid rgba(255,255,255,0.16);border-radius:999px;background:rgba(255,255,255,0.05);font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#ddd6fe;">
                                        Welcome to STREAM
                                      </div>
                                      <h1 style="margin:22px 0 14px 0;font-size:40px;line-height:1.08;font-weight:700;color:#ffffff;font-family:Georgia,'Times New Roman',serif;">
                                        Verify your email address
                                      </h1>
                                      <p style="margin:0;font-size:16px;line-height:1.75;color:rgba(255,255,255,0.78);max-width:470px;">
                                        You’re one step away from unlocking your STREAM account. Confirm your email to continue your subscription setup, build your watchlist, and start watching.
                                      </p>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding:16px 40px 40px 40px;">
                                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%%" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:20px;">
                                        <tr>
                                          <td style="padding:28px 28px 16px 28px;">
                                            <p style="margin:0 0 18px 0;font-size:14px;line-height:1.7;color:rgba(255,255,255,0.72);">
                                              Click the button below to verify your account. This link will expire in 24 hours.
                                            </p>
                                            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                              <tr>
                                                <td align="center" bgcolor="#7c3aed" style="border-radius:14px;">
                                                  <a href="%s" style="display:inline-block;padding:16px 26px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:14px;background:linear-gradient(90deg,#7c3aed 0%%,#9333ea 50%%,#c026d3 100%%);">
                                                    Verify account →
                                                  </a>
                                                </td>
                                              </tr>
                                            </table>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td style="padding:0 28px 28px 28px;">
                                            <p style="margin:0 0 10px 0;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.42);">
                                              Or paste this link into your browser
                                            </p>
                                            <p style="margin:0;font-size:13px;line-height:1.8;word-break:break-all;color:#c4b5fd;">
                                              <a href="%s" style="color:#c4b5fd;text-decoration:none;">%s</a>
                                            </p>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding:0 40px 36px 40px;">
                                      <p style="margin:0;font-size:13px;line-height:1.8;color:rgba(255,255,255,0.48);">
                                        If you didn’t create a STREAM account, you can safely ignore this email.
                                      </p>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:22px 24px 0 24px;text-align:center;">
                                <p style="margin:0;font-size:12px;line-height:1.7;color:rgba(255,255,255,0.34);">
                                  © 2026 STREAM TEAM. All rights reserved.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </body>
                </html>
                """.formatted(link, link, link);
    }
}
