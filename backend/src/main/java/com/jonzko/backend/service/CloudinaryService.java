package com.jonzko.backend.service;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;
    private final String cloudName;
    private final String apiKey;
    private final String apiSecret;

    public CloudinaryService(
            @Value("${cloudinary.cloud-name:}") String cloudName,
            @Value("${cloudinary.api-key:}") String apiKey,
            @Value("${cloudinary.api-secret:}") String apiSecret
    ) {
        this.cloudName = cloudName;
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;

        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true
        ));
    }

    public String uploadProductImage(MultipartFile file) {
        try {
            if (cloudName == null || cloudName.isBlank()) {
                throw new RuntimeException("CLOUDINARY_CLOUD_NAME no está configurado");
            }

            if (apiKey == null || apiKey.isBlank()) {
                throw new RuntimeException("CLOUDINARY_API_KEY no está configurado");
            }

            if (apiSecret == null || apiSecret.isBlank()) {
                throw new RuntimeException("CLOUDINARY_API_SECRET no está configurado");
            }

            if (file == null || file.isEmpty()) {
                throw new RuntimeException("El archivo está vacío");
            }

            String contentType = file.getContentType() == null ? "" : file.getContentType();
            boolean isVideo = contentType.startsWith("video/");

            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "jonzko/productos",
                            "resource_type", isVideo ? "video" : "image"
                    )
            );

            Object secureUrl = uploadResult.get("secure_url");

            if (secureUrl == null) {
                throw new RuntimeException("Cloudinary no devolvió secure_url");
            }

            return secureUrl.toString();

        } catch (Exception e) {
            System.out.println("ERROR CLOUDINARY: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("No se pudo subir el archivo: " + e.getMessage());
        }
    }
}