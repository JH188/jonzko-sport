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
import org.springframework.web.bind.annotation.RestController;

import com.jonzko.backend.entity.Product;
import com.jonzko.backend.repository.ProductRepository;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(originPatterns = {
        "http://localhost:*",
        "https://*.vercel.app"
})
public class ProductController {

    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // ============================================================
    // TIENDA - SOLO PRODUCTOS ACTIVOS
    // GET: http://localhost:8080/api/products
    // ============================================================
    @GetMapping
    public List<Product> getProducts() {
        return productRepository.findByActiveTrue();
    }

    // ============================================================
    // ADMIN - TODOS LOS PRODUCTOS, ACTIVOS E INACTIVOS
    // GET: http://localhost:8080/api/products/admin/all
    // ============================================================
    @GetMapping("/admin/all")
    public List<Product> getAllProductsForAdmin() {
        return productRepository.findAll();
    }

    // ============================================================
    // BUSCAR PRODUCTO POR ID
    // GET: http://localhost:8080/api/products/1
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
    // POST: http://localhost:8080/api/products/admin
    // ============================================================
 @PostMapping("/admin")
public ResponseEntity<?> createProduct(@RequestBody Product request) {

    Product product = new Product();

    product.setName(request.getName());
    product.setCategory(request.getCategory());
    product.setDescription(request.getDescription());
    product.setPrice(request.getPrice());
    product.setOldPrice(request.getOldPrice());
    product.setColor(request.getColor());
    product.setSizes(request.getSizes());
    product.setSaleType(request.getSaleType());
    product.setStock(request.getStock());
    product.setImageUrl(request.getImageUrl());

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
    // PUT: http://localhost:8080/api/products/admin/1
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

        product.setName(request.getName());
product.setCategory(request.getCategory());
product.setDescription(request.getDescription());
product.setPrice(request.getPrice());
product.setOldPrice(request.getOldPrice());
product.setColor(request.getColor());
product.setSizes(request.getSizes());
product.setSaleType(request.getSaleType());
product.setStock(request.getStock());
product.setImageUrl(request.getImageUrl());

        if (request.getActive() != null) {
            product.setActive(request.getActive());
        }

        product.setUpdatedAt(LocalDateTime.now());

        Product updatedProduct = productRepository.save(product);

        return ResponseEntity.ok(updatedProduct);
    }

    // ============================================================
    // ADMIN - CAMBIAR SOLO PRECIO Y STOCK
    // PATCH: http://localhost:8080/api/products/admin/1/price-stock
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
    // PATCH: http://localhost:8080/api/products/admin/1/status
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
    // DELETE: http://localhost:8080/api/products/admin/1
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