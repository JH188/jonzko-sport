package com.jonzko.backend.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.jonzko.backend.entity.Product;
import com.jonzko.backend.repository.ProductRepository;
import com.jonzko.backend.service.CloudinaryService;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(originPatterns = {
        "http://localhost:*",
        "https://*.vercel.app",
        "https://jonzko.lat",
        "https://www.jonzko.lat"
})
public class ProductController {

    private final ProductRepository productRepository;
    private final CloudinaryService cloudinaryService;

    public ProductController(
            ProductRepository productRepository,
            CloudinaryService cloudinaryService
    ) {
        this.productRepository = productRepository;
        this.cloudinaryService = cloudinaryService;
    }

    // ============================================================
    // TIENDA - SOLO PRODUCTOS ACTIVOS
    // GET: /api/products
    // ============================================================
    @GetMapping
    public List<Product> getProducts() {
        return productRepository.findByActiveTrue();
    }

    // ============================================================
    // ADMIN - TODOS LOS PRODUCTOS, ACTIVOS E INACTIVOS
    // GET: /api/products/admin/all
    // ============================================================
    @GetMapping("/admin/all")
    public List<Product> getAllProductsForAdmin() {
        return productRepository.findAll();
    }

    // ============================================================
    // ADMIN - SUBIR IMAGEN A CLOUDINARY
    // POST: /api/products/admin/upload-image
    // ============================================================
    @PostMapping("/admin/upload-image")
    public ResponseEntity<?> uploadProductImage(@RequestParam("file") MultipartFile file) {
        String imageUrl = cloudinaryService.uploadProductImage(file);

        return ResponseEntity.ok(
                Map.of(
                        "message", "Imagen subida correctamente",
                        "imageUrl", imageUrl
                )
        );
    }

    // ============================================================
    // BUSCAR PRODUCTO POR ID
    // GET: /api/products/1
    // ============================================================
    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        Product product = productRepository.findById(id).orElse(null);

        if (product == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Producto no encontrado")
            );
        }

        return ResponseEntity.ok(product);
    }

    // ============================================================
    // ADMIN - CREAR PRODUCTO NUEVO
    // POST: /api/products/admin
    // ============================================================
    @PostMapping("/admin")
    public ResponseEntity<?> createProduct(@RequestBody Product request) {

        if (request.getName() == null || request.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "El nombre del producto es obligatorio")
            );
        }

        if (request.getCategory() == null || request.getCategory().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "La categoría del producto es obligatoria")
            );
        }

        if (request.getPrice() == null || request.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "El precio debe ser mayor a 0")
            );
        }

        if (request.getImageUrl() == null || request.getImageUrl().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "La imagen del producto es obligatoria")
            );
        }

        Product product = new Product();

        product.setName(request.getName().trim());
        product.setCategory(request.getCategory().trim());
        product.setDescription(request.getDescription() != null ? request.getDescription().trim() : "");
        product.setPrice(request.getPrice());
        product.setOldPrice(request.getOldPrice());
        product.setColor(request.getColor());
        product.setSizes(request.getSizes());
        product.setSaleType(request.getSaleType());
        product.setStock(request.getStock() != null ? request.getStock() : 0);
        product.setImageUrl(request.getImageUrl().trim());

        if (request.getActive() == null) {
            product.setActive(true);
        } else {
            product.setActive(request.getActive());
        }

        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());

        Product savedProduct = productRepository.save(product);

        return ResponseEntity.ok(savedProduct);
    }

    // ============================================================
    // ADMIN - EDITAR PRODUCTO
    // PUT: /api/products/admin/1
    // ============================================================
    @PutMapping("/admin/{id}")
    public ResponseEntity<?> updateProduct(
            @PathVariable Long id,
            @RequestBody Product request
    ) {
        Product product = productRepository.findById(id).orElse(null);

        if (product == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Producto no encontrado")
            );
        }

        if (request.getName() == null || request.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "El nombre del producto es obligatorio")
            );
        }

        if (request.getCategory() == null || request.getCategory().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "La categoría del producto es obligatoria")
            );
        }

        if (request.getPrice() == null || request.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "El precio debe ser mayor a 0")
            );
        }

        if (request.getImageUrl() == null || request.getImageUrl().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "La imagen del producto es obligatoria")
            );
        }

        product.setName(request.getName().trim());
        product.setCategory(request.getCategory().trim());
        product.setDescription(request.getDescription() != null ? request.getDescription().trim() : "");
        product.setPrice(request.getPrice());
        product.setOldPrice(request.getOldPrice());
        product.setColor(request.getColor());
        product.setSizes(request.getSizes());
        product.setSaleType(request.getSaleType());
        product.setStock(request.getStock() != null ? request.getStock() : 0);
        product.setImageUrl(request.getImageUrl().trim());

        if (request.getActive() != null) {
            product.setActive(request.getActive());
        }

        product.setUpdatedAt(LocalDateTime.now());

        Product updatedProduct = productRepository.save(product);

        return ResponseEntity.ok(updatedProduct);
    }

    // ============================================================
    // ADMIN - CAMBIAR SOLO PRECIO Y STOCK
    // PATCH: /api/products/admin/1/price-stock
    // ============================================================
    @PatchMapping("/admin/{id}/price-stock")
    public ResponseEntity<?> updatePriceAndStock(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request
    ) {
        Product product = productRepository.findById(id).orElse(null);

        if (product == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Producto no encontrado")
            );
        }

        if (request.containsKey("price")) {
            BigDecimal price = new BigDecimal(request.get("price").toString());
            product.setPrice(price);
        }

        if (request.containsKey("stock")) {
            Integer stock = Integer.valueOf(request.get("stock").toString());
            product.setStock(stock);
        }

        product.setUpdatedAt(LocalDateTime.now());

        Product updatedProduct = productRepository.save(product);

        return ResponseEntity.ok(updatedProduct);
    }

    // ============================================================
    // ADMIN - ACTIVAR / DESACTIVAR PRODUCTO
    // PATCH: /api/products/admin/1/status
    // ============================================================
    @PatchMapping("/admin/{id}/status")
    public ResponseEntity<?> updateProductStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> request
    ) {
        Product product = productRepository.findById(id).orElse(null);

        if (product == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Producto no encontrado")
            );
        }

        Boolean active = request.get("active");

        if (active == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Debes enviar el estado active")
            );
        }

        product.setActive(active);
        product.setUpdatedAt(LocalDateTime.now());

        Product updatedProduct = productRepository.save(product);

        return ResponseEntity.ok(updatedProduct);
    }

    // ============================================================
    // ADMIN - ELIMINAR REALMENTE PRODUCTO
    // DELETE: /api/products/admin/1
    // ============================================================
    @DeleteMapping("/admin/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        Product product = productRepository.findById(id).orElse(null);

        if (product == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Producto no encontrado")
            );
        }

        productRepository.delete(product);

        return ResponseEntity.ok(
                Map.of("message", "Producto eliminado correctamente")
        );
    }
}