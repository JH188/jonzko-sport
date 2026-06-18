package com.jonzko.backend.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class BrevoEmailService {

    @Value("${brevo.api.key:}")
    private String brevoApiKey;

    @Value("${brevo.sender.email:no-reply@jonzko.lat}")
    private String senderEmail;

    @Value("${brevo.sender.name:JONZKO SPORT}")
    private String senderName;

    @Value("${app.frontend-url:http://localhost:4200}")
    private String frontendUrl;

    public void sendPasswordResetCode(String toEmail, String fullName, String code) {

        if (brevoApiKey == null || brevoApiKey.isBlank()) {
            throw new IllegalStateException("BREVO_API_KEY no está configurada");
        }

        String name = fullName == null || fullName.isBlank() ? "Cliente" : fullName.trim();

        String resetUrl = frontendUrl + "/reset-password";

        String subject = "Código para restablecer tu contraseña - JONZKO";

        String htmlContent = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #eeeeee; border-radius: 12px;">
                    <h2 style="color: #111111;">JONZKO SPORT</h2>

                    <p>Hola <strong>%s</strong>,</p>

                    <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>

                    <p>Tu código de recuperación es:</p>

                    <div style="font-size: 28px; font-weight: bold; letter-spacing: 6px; background: #f5f5f5; padding: 16px; text-align: center; border-radius: 10px;">
                        %s
                    </div>

                    <p style="margin-top: 20px;">Este código vence en <strong>10 minutos</strong>.</p>

                    <p>Ingresa aquí para continuar:</p>

                    <p>
                        <a href="%s" style="background: #111111; color: #ffffff; padding: 12px 18px; text-decoration: none; border-radius: 8px; display: inline-block;">
                            Restablecer contraseña
                        </a>
                    </p>

                    <p style="color: #777777; font-size: 13px;">
                        Si tú no solicitaste este cambio, puedes ignorar este correo.
                    </p>
                </div>
                """.formatted(escapeHtml(name), code, resetUrl);

        String payload = """
                {
                    "sender": {
                        "name": "%s",
                        "email": "%s"
                    },
                    "to": [
                        {
                            "email": "%s",
                            "name": "%s"
                        }
                    ],
                    "subject": "%s",
                    "htmlContent": "%s"
                }
                """.formatted(
                escapeJson(senderName),
                escapeJson(senderEmail),
                escapeJson(toEmail),
                escapeJson(name),
                escapeJson(subject),
                escapeJson(htmlContent)
        );

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .header("accept", "application/json")
                    .header("api-key", brevoApiKey)
                    .header("content-type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(payload))
                    .build();

            HttpClient client = HttpClient.newHttpClient();

            HttpResponse<String> response = client.send(
                    request,
                    HttpResponse.BodyHandlers.ofString()
            );

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new RuntimeException("Error Brevo: " + response.statusCode() + " - " + response.body());
            }

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Envío de correo interrumpido", e);
        } catch (Exception e) {
            throw new RuntimeException("No se pudo enviar el correo de recuperación", e);
        }
    }

    private String escapeJson(String value) {
        if (value == null) {
            return "";
        }

        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "");
    }

    private String escapeHtml(String value) {
        if (value == null) {
            return "";
        }

        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}