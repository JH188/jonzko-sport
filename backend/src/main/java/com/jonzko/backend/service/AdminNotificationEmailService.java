package com.jonzko.backend.service;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jonzko.backend.entity.CustomerOrder;
import com.jonzko.backend.entity.Order;

@Service
public class AdminNotificationEmailService {

    @Value("${brevo.api.key:}")
    private String brevoApiKey;

    @Value("${brevo.sender.email:no-reply@jonzko.lat}")
    private String senderEmail;

    @Value("${brevo.sender.name:JONZKO SPORT}")
    private String senderName;

    @Value("${app.admin.email:jonathan.huaman18@gmail.com}")
    private String adminEmail;

    @Value("${app.admin.url:https://www.jonzko.lat/admin}")
    private String adminUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public void enviarNuevoPedidoCliente(CustomerOrder order) {
        if (order == null) {
            return;
        }

        String subject = "Nuevo pedido en JONZKO #" + order.getId();

        String htmlContent = """
                <div style="font-family: Arial, sans-serif; background:#f6f6f6; padding:24px;">
                  <div style="max-width:650px; margin:auto; background:#ffffff; border-radius:14px; padding:24px; border:1px solid #e5e5e5;">

                    <h2 style="margin:0 0 12px; color:#111; font-size:28px;">
                      Nuevo pedido en JONZKO
                    </h2>

                    <p style="color:#444; font-size:16px;">
                      Hola Jonathan, tienes un nuevo pedido registrado en tu tienda.
                    </p>

                    <div style="background:#fafafa; border:1px solid #eee; border-radius:12px; padding:16px; margin:18px 0;">
                      <p><b>Pedido:</b> #%s</p>
                      <p><b>Cliente:</b> %s</p>
                      <p><b>Correo:</b> %s</p>
                      <p><b>Teléfono:</b> %s</p>
                      <p><b>Documento:</b> %s - %s</p>
                      <p><b>Ubicación:</b> %s / %s / %s</p>
                      <p><b>Dirección:</b> %s</p>
                      <p><b>Referencia:</b> %s</p>
                      <p><b>Método de pago:</b> %s</p>
                      <p><b>Estado:</b> %s</p>
                      <p><b>Total:</b> S/ %s</p>
                    </div>

                    <div style="background:#ffffff; border:1px solid #eee; border-radius:12px; padding:16px; margin:18px 0;">
                      <p style="margin-top:0;"><b>Productos:</b></p>
                      <pre style="white-space:pre-wrap; font-family:Arial, sans-serif; color:#333; line-height:1.6; font-size:15px; margin:0;">%s</pre>
                    </div>

                    <a href="%s"
                       style="display:inline-block; background:#000; color:#fff; text-decoration:none; padding:14px 22px; border-radius:999px; font-weight:bold;">
                      Entrar al administrador
                    </a>

                    <p style="font-size:12px; color:#777; margin-top:22px;">
                      JONZKO SPORT - Notificación automática.
                    </p>

                  </div>
                </div>
                """.formatted(
                safe(order.getId()),
                safe(order.getCustomerName()),
                safe(order.getCustomerEmail()),
                safe(order.getCustomerPhone()),
                safe(order.getDocumentType()),
                safe(order.getDocumentNumber()),
                safe(order.getDepartment()),
                safe(order.getProvince()),
                safe(order.getDistrict()),
                safe(order.getAddress()),
                safe(order.getReferenceText()),
                safe(order.getPaymentMethod()),
                safe(order.getOrderStatus()),
                safe(order.getTotal()),
                formatearProductos(order.getItemsJson()),
                adminUrl
        );

        enviarCorreo(subject, htmlContent);
    }

    public void enviarNuevoPedido(Order order) {
        if (order == null) {
            return;
        }

        String subject = "Nuevo pedido en JONZKO " + safe(order.getOrderCode());

        String htmlContent = """
                <div style="font-family: Arial, sans-serif; background:#f6f6f6; padding:24px;">
                  <div style="max-width:650px; margin:auto; background:#ffffff; border-radius:14px; padding:24px; border:1px solid #e5e5e5;">

                    <h2 style="margin:0 0 12px; color:#111; font-size:28px;">
                      Nuevo pedido en JONZKO
                    </h2>

                    <p style="color:#444; font-size:16px;">
                      Hola Jonathan, tienes un nuevo pedido en tu tienda.
                    </p>

                    <div style="background:#fafafa; border:1px solid #eee; border-radius:12px; padding:16px; margin:18px 0;">
                      <p><b>Código:</b> %s</p>
                      <p><b>Cliente:</b> %s</p>
                      <p><b>Correo:</b> %s</p>
                      <p><b>Teléfono:</b> %s</p>
                      <p><b>Dirección:</b> %s, %s, %s - %s</p>
                      <p><b>Método de pago:</b> %s</p>
                      <p><b>Total:</b> S/ %s</p>
                      <p><b>Estado:</b> %s</p>
                    </div>

                    <a href="%s"
                       style="display:inline-block; background:#000; color:#fff; text-decoration:none; padding:14px 22px; border-radius:999px; font-weight:bold;">
                      Entrar al administrador
                    </a>

                    <p style="font-size:12px; color:#777; margin-top:22px;">
                      JONZKO SPORT - Notificación automática.
                    </p>

                  </div>
                </div>
                """.formatted(
                safe(order.getOrderCode()),
                safe(order.getCustomerName()),
                safe(order.getCustomerEmail()),
                safe(order.getCustomerPhone()),
                safe(order.getDepartment()),
                safe(order.getProvince()),
                safe(order.getDistrict()),
                safe(order.getAddress()),
                safe(order.getPaymentMethod()),
                safe(order.getTotal()),
                safe(order.getOrderStatus()),
                adminUrl
        );

        enviarCorreo(subject, htmlContent);
    }

    private void enviarCorreo(String subject, String htmlContent) {
        if (brevoApiKey == null || brevoApiKey.isBlank()) {
            System.out.println("BREVO_API_KEY no configurado. No se envió correo.");
            return;
        }

        try {
            Map<String, Object> body = Map.of(
                    "sender", Map.of(
                            "name", senderName,
                            "email", senderEmail
                    ),
                    "to", List.of(
                            Map.of(
                                    "email", adminEmail,
                                    "name", "Jonathan"
                            )
                    ),
                    "subject", subject,
                    "htmlContent", htmlContent
            );

            String json = objectMapper.writeValueAsString(body);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .header("accept", "application/json")
                    .header("api-key", brevoApiKey)
                    .header("content-type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

            HttpClient client = HttpClient.newHttpClient();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 300) {
                System.out.println("Error enviando correo Brevo: " + response.statusCode() + " - " + response.body());
            } else {
                System.out.println("Correo de nuevo pedido enviado al admin: " + adminEmail);
            }

        } catch (Exception e) {
            System.out.println("No se pudo enviar correo de nuevo pedido: " + e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private String formatearProductos(String itemsJson) {
        if (itemsJson == null || itemsJson.isBlank()) {
            return "Sin productos";
        }

        try {
            List<Map<String, Object>> items = objectMapper.readValue(itemsJson, List.class);

            StringBuilder sb = new StringBuilder();

            for (int i = 0; i < items.size(); i++) {
                Map<String, Object> item = items.get(i);

                String nombre = valor(item, "name");
                String talla = valor(item, "selectedSize");
                String color = valor(item, "selectedColor");

                if ("-".equals(color)) {
                    color = valor(item, "color");
                }

                String cantidadTexto = valor(item, "quantity");
                String precioTexto = valor(item, "price");

                int cantidad = 1;
                BigDecimal precio = BigDecimal.ZERO;

                try {
                    cantidad = Integer.parseInt(cantidadTexto);
                } catch (Exception ignored) {
                }

                try {
                    precio = new BigDecimal(precioTexto);
                } catch (Exception ignored) {
                }

                BigDecimal subtotal = precio.multiply(BigDecimal.valueOf(cantidad));

                sb.append(i + 1).append(". ").append(nombre).append("\n");
                sb.append("Talla: ").append(talla).append("\n");
                sb.append("Color: ").append(color).append("\n");
                sb.append("Cantidad: ").append(cantidad).append("\n");
                sb.append("Precio unitario: S/ ").append(precio).append("\n");
                sb.append("Subtotal: S/ ").append(subtotal).append("\n");

                if (i < items.size() - 1) {
                    sb.append("\n--------------------------\n\n");
                }
            }

            return safe(sb.toString());

        } catch (Exception e) {
            System.out.println("No se pudo formatear productos: " + e.getMessage());
            return "No se pudo leer el detalle de productos.";
        }
    }

    private String valor(Map<String, Object> item, String key) {
        Object value = item.get(key);

        if (value == null) {
            return "-";
        }

        String text = value.toString();

        if (text.isBlank() || "null".equalsIgnoreCase(text)) {
            return "-";
        }

        return text;
    }

    private String safe(Object value) {
        if (value == null) {
            return "-";
        }

        return value.toString()
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}