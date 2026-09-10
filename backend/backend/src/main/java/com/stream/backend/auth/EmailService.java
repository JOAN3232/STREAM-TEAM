
package com.stream.backend.auth;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
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

        MimeMessage message = mailSender.createMimeMessage();

        try {
            MimeMessageHelper helper =
                    new MimeMessageHelper(message, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(recipientEmail);
            helper.setSubject("Verify your STREAM account");

            helper.setText(
                    """
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport"
                              content="width=device-width, initial-scale=1.0">
                        <title>Verify your STREAM account</title>
                    </head>

                    <body style="
                        margin:0;
                        padding:0;
                        background:#09090b;
                        font-family:Arial,Helvetica,sans-serif;
                        color:#ffffff;
                    ">

                        <table width="100%%"
                               cellpadding="0"
                               cellspacing="0"
                               border="0"
                               style="background:#09090b;padding:40px 15px;">

                            <tr>
                                <td align="center">

                                    <table width="100%%"
                                           cellpadding="0"
                                           cellspacing="0"
                                           border="0"
                                           style="
                                               max-width:560px;
                                               background:#15121c;
                                               border:1px solid #30263d;
                                               border-radius:16px;
                                               overflow:hidden;
                                           ">

                                        <!-- Header -->
                                        <tr>
                                            <td style="
                                                padding:28px 32px;
                                                border-bottom:1px solid #30263d;
                                            ">

                                                <div style="
                                                    font-size:30px;
                                                    font-weight:800;
                                                    letter-spacing:2px;
                                                    color:#a855f7;
                                                ">
                                                    STREAM
                                                </div>

                                            </td>
                                        </tr>

                                        <!-- Main Content -->
                                        <tr>
                                            <td style="padding:42px 32px;">

                                                <div style="
                                                    font-size:12px;
                                                    font-weight:bold;
                                                    letter-spacing:2px;
                                                    text-transform:uppercase;
                                                    color:#a855f7;
                                                    margin-bottom:12px;
                                                ">
                                                    ACCOUNT SETUP
                                                </div>

                                                <h1 style="
                                                    margin:0 0 18px;
                                                    font-size:32px;
                                                    line-height:1.2;
                                                    color:#ffffff;
                                                ">
                                                    Verify your account
                                                </h1>

                                                <p style="
                                                    margin:0 0 14px;
                                                    font-size:16px;
                                                    line-height:1.6;
                                                    color:#d4d4d8;
                                                ">
                                                    Welcome to STREAM.
                                                </p>

                                                <p style="
                                                    margin:0 0 30px;
                                                    font-size:16px;
                                                    line-height:1.6;
                                                    color:#a1a1aa;
                                                ">
                                                    Click the button below to set
                                                    your password and complete
                                                    your account.
                                                </p>

                                                <!-- Button -->
                                                <table cellpadding="0"
                                                       cellspacing="0"
                                                       border="0">

                                                    <tr>
                                                        <td style="
                                                            border-radius:8px;
                                                            background:#9333ea;
                                                        ">

                                                            <a href="%s"
                                                               style="
                                                                   display:inline-block;
                                                                   padding:15px 28px;
                                                                   font-size:15px;
                                                                   font-weight:bold;
                                                                   color:#ffffff;
                                                                   text-decoration:none;
                                                                   border-radius:8px;
                                                               ">
                                                                Set your password
                                                            </a>

                                                        </td>
                                                    </tr>

                                                </table>

                                                <!-- Fallback Link -->
                                                <p style="
                                                    margin:30px 0 8px;
                                                    font-size:12px;
                                                    color:#71717a;
                                                ">
                                                    Button not working?
                                                    Copy this link into your browser:
                                                </p>

                                                <p style="
                                                    margin:0;
                                                    word-break:break-all;
                                                    font-size:12px;
                                                    line-height:1.6;
                                                    color:#a78bfa;
                                                ">
                                                    %s
                                                </p>

                                            </td>
                                        </tr>

                                        <!-- Footer -->
                                        <tr>
                                            <td style="
                                                padding:24px 32px;
                                                background:#0f0d14;
                                                border-top:1px solid #30263d;
                                            ">

                                                <p style="
                                                    margin:0;
                                                    font-size:12px;
                                                    line-height:1.6;
                                                    color:#71717a;
                                                ">
                                                    If you did not create a STREAM
                                                    account, you can safely ignore
                                                    this email.
                                                </p>

                                                <p style="
                                                    margin:12px 0 0;
                                                    font-size:12px;
                                                    color:#52525b;
                                                ">
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
                    """
                    .formatted(
                            verificationUrl,
                            verificationUrl
                    ),
                    true
            );

            mailSender.send(message);

        } catch (MessagingException e) {
            throw new IllegalStateException(
                    "Failed to create verification email",
                    e
            );
        }
    }
}
