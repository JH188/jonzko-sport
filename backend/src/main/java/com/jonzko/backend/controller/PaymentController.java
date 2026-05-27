package com.jonzko.backend.controller;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.payment.PaymentCreateRequest;
import com.mercadopago.client.payment.PaymentPayerRequest;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.core.MPRequestOptions;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.resources.payment.Payment;
import com.mercadopago.resources.preference.Preference;

@RestController
@RequestMapping("/api/payments/mercadopago")
@CrossOrigin(origins = {
        "http://localhost:4200",
        "https://www.jonzko.lat",
        "https://jonzko.lat",
        "https://jonzko-sport.vercel.app"
})
public class PaymentController {

    @Value("${mercadopago.access-token}")
    private String mercadoPagoAccessToken;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @PostMapping("/create-preference")
    public ResponseEntity<?> createPreference(@RequestBody CreatePreferenceRequest request) {
        try {
            if (mercadoPagoAccessToken == null || mercadoPagoAccessToken.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Falta configurar MP_ACCESS_TOKEN"
                ));
            }

            MercadoPagoConfig.setAccessToken(mercadoPagoAccessToken);

            PreferenceItemRequest item = PreferenceItemRequest.builder()
                    .title(request.title())
                    .description(request.description())
                    .quantity(request.quantity())
                    .currencyId("PEN")
                    .unitPrice(request.unitPrice())
                    .build();

            PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                    .success(frontendUrl + "/pago-exitoso")
                    .pending(frontendUrl + "/pago-pendiente")
                    .failure(frontendUrl + "/pago-error")
                    .build();

            PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                    .items(List.of(item))
                    .backUrls(backUrls)
                    .autoReturn("approved")
                    .externalReference(request.orderId() == null ? "JONZKO-TEST" : request.orderId())
                    .build();

            PreferenceClient client = new PreferenceClient();
            Preference preference = client.create(preferenceRequest);

            String paymentUrl = preference.getSandboxInitPoint() != null
                    ? preference.getSandboxInitPoint()
                    : preference.getInitPoint();

            return ResponseEntity.ok(Map.of(
                    "preferenceId", preference.getId(),
                    "paymentUrl", paymentUrl
            ));

        } catch (MPApiException e) {
            return handleMpApiException(e);

        } catch (Exception e) {
            e.printStackTrace();

            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Error creando preferencia de Mercado Pago",
                    "detail", e.getMessage()
            ));
        }
    }
    @PostMapping("/process-payment")
public ResponseEntity<?> processPayment(@RequestBody ProcessPaymentRequest request) {
    try {
        if (mercadoPagoAccessToken == null || mercadoPagoAccessToken.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Falta configurar MP_ACCESS_TOKEN"
            ));
        }

        if (request.token() == null || request.token().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Falta el token de la tarjeta"
            ));
        }

        BigDecimal amount = request.transactionAmount() != null
                ? request.transactionAmount()
                : request.amount();

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "El monto del pago no es válido"
            ));
        }

        if (request.paymentMethodId() == null || request.paymentMethodId().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Falta el método de pago"
            ));
        }

        String payerEmail = "";

        if (request.payer() != null && request.payer().email() != null) {
            payerEmail = request.payer().email();
        }

        if ((payerEmail == null || payerEmail.isBlank()) && request.customerEmail() != null) {
            payerEmail = request.customerEmail();
        }

        if (payerEmail == null || payerEmail.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Falta el correo del pagador"
            ));
        }

        MercadoPagoConfig.setAccessToken(mercadoPagoAccessToken);

        PaymentPayerRequest payer = PaymentPayerRequest.builder()
                .email(payerEmail)
                .build();

        PaymentCreateRequest paymentCreateRequest = PaymentCreateRequest.builder()
        .transactionAmount(amount)
        .token(request.token())
        .description(
                request.description() == null || request.description().isBlank()
                        ? "Compra JONZKO SPORT"
                        : request.description()
        )
        .installments(request.installments() == null ? 1 : request.installments())
        .paymentMethodId(request.paymentMethodId())
        .issuerId(request.issuerId())
        .payer(payer)
        .externalReference(
                request.orderId() == null || request.orderId().isBlank()
                        ? "JONZKO-" + System.currentTimeMillis()
                        : request.orderId()
        )
        .build();

        PaymentClient paymentClient = new PaymentClient();

        Map<String, String> customHeaders = new HashMap<>();
        customHeaders.put("x-idempotency-key", UUID.randomUUID().toString());

        MPRequestOptions requestOptions = MPRequestOptions.builder()
                .customHeaders(customHeaders)
                .build();

        Payment payment = paymentClient.create(paymentCreateRequest, requestOptions);

        Map<String, Object> response = new HashMap<>();
response.put("id", payment.getId());
response.put("status", payment.getStatus());
response.put("statusDetail", payment.getStatusDetail());
response.put("paymentMethodId", payment.getPaymentMethodId());
response.put("transactionAmount", payment.getTransactionAmount());
response.put("externalReference", payment.getExternalReference());

return ResponseEntity.ok(response);
    } catch (MPApiException e) {
        return handleMpApiException(e);

    } catch (Exception e) {
        e.printStackTrace();

        return ResponseEntity.internalServerError().body(Map.of(
                "error", "Error procesando pago con tarjeta",
                "detail", e.getMessage()
        ));
    }
}

    @PostMapping("/yape")
    public ResponseEntity<?> payWithYape(@RequestBody YapePaymentRequest request) {
        try {
            if (mercadoPagoAccessToken == null || mercadoPagoAccessToken.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Falta configurar MP_ACCESS_TOKEN"
                ));
            }

            if (request.token() == null || request.token().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Falta el token de Yape"
                ));
            }

            if (request.transactionAmount() == null ||
                    request.transactionAmount().compareTo(BigDecimal.ZERO) <= 0) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "El monto del pago no es válido"
                ));
            }

            if (request.payerEmail() == null || request.payerEmail().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Falta el correo del pagador"
                ));
            }

            MercadoPagoConfig.setAccessToken(mercadoPagoAccessToken);

            PaymentPayerRequest payer = PaymentPayerRequest.builder()
                    .email(request.payerEmail())
                    .build();

            PaymentCreateRequest paymentCreateRequest = PaymentCreateRequest.builder()
                    .transactionAmount(request.transactionAmount())
                    .token(request.token())
                    .description(
                            request.description() == null || request.description().isBlank()
                                    ? "Compra JONZKO SPORT con Yape"
                                    : request.description()
                    )
                    .paymentMethodId("yape")
                    .installments(1)
                    .payer(payer)
                    .externalReference(
                            request.orderId() == null || request.orderId().isBlank()
                                    ? "JONZKO-YAPE-" + System.currentTimeMillis()
                                    : request.orderId()
                    )
                    .build();

            PaymentClient paymentClient = new PaymentClient();

            Map<String, String> customHeaders = new HashMap<>();
            customHeaders.put("x-idempotency-key", UUID.randomUUID().toString());

            MPRequestOptions requestOptions = MPRequestOptions.builder()
                    .customHeaders(customHeaders)
                    .build();

            Payment payment = paymentClient.create(paymentCreateRequest, requestOptions);

            Map<String, Object> response = new HashMap<>();
response.put("id", payment.getId());
response.put("status", payment.getStatus());
response.put("statusDetail", payment.getStatusDetail());
response.put("paymentMethodId", payment.getPaymentMethodId());
response.put("transactionAmount", payment.getTransactionAmount());
response.put("externalReference", payment.getExternalReference());

return ResponseEntity.ok(response);

        } catch (MPApiException e) {
            return handleMpApiException(e);

        } catch (Exception e) {
            e.printStackTrace();

            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Error procesando pago con Yape",
                    "detail", e.getMessage()
            ));
        }
    }

    private ResponseEntity<?> handleMpApiException(MPApiException e) {
        String apiContent = e.getApiResponse() != null
                ? e.getApiResponse().getContent()
                : "Sin contenido";

        int statusCode = e.getApiResponse() != null
                ? e.getApiResponse().getStatusCode()
                : 0;

        System.out.println("ERROR MERCADO PAGO STATUS: " + statusCode);
        System.out.println("ERROR MERCADO PAGO CONTENT: " + apiContent);

        return ResponseEntity.internalServerError().body(Map.of(
                "error", "Error de Mercado Pago",
                "status", statusCode,
                "detail", apiContent
        ));
    }

    public record CreatePreferenceRequest(
            String orderId,
            String title,
            String description,
            Integer quantity,
            BigDecimal unitPrice
    ) {
    }
    public record ProcessPaymentRequest(
        String orderId,
        String token,
        BigDecimal transactionAmount,
        BigDecimal amount,
        Integer installments,
        String paymentMethodId,
        String issuerId,
        String description,
        PayerRequest payer,

        String customerName,
        String customerEmail,
        String customerPhone,

        String documentType,
        String documentNumber,

        String department,
        String province,
        String district,
        String address,
        String referenceText,

        String itemsJson
) {
}

public record PayerRequest(
        String email
) {
}

    public record YapePaymentRequest(
            String orderId,
            String token,
            String paymentMethodId,
            BigDecimal transactionAmount,
            String description,
            String payerEmail,

            String customerName,
            String customerEmail,
            String customerPhone,

            String documentType,
            String documentNumber,

            String department,
            String province,
            String district,
            String address,
            String referenceText,

            String itemsJson
    ) {
    }
}