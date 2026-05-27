package com.jonzko.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.jonzko.backend.entity.ProductVariant;
import com.jonzko.backend.repository.ProductVariantRepository;

@RestController
@RequestMapping("/api/admin/product-variants")
@CrossOrigin(origins = {
        "http://localhost:4200",
        "https://jonzko.lat",
        "https://www.jonzko.lat",
        "https://jonzko-sport.vercel.app"
})
public class AdminProductVariantController {

    private final ProductVariantRepository productVariantRepository;

    public AdminProductVariantController(ProductVariantRepository productVariantRepository) {
        this.productVariantRepository = productVariantRepository;
    }

    @GetMapping
    public List<ProductVariant> getAllVariants() {
        return productVariantRepository.findAll();
    }

    @GetMapping("/product/{productId}")
    public List<ProductVariant> getVariantsByProduct(@PathVariable Long productId) {
        return productVariantRepository.findByProductId(productId);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductVariant> updateVariant(
            @PathVariable Long id,
            @RequestBody ProductVariant request
    ) {
        return productVariantRepository.findById(id)
                .map(variant -> {
                    variant.setSize(request.getSize());
                    variant.setColor(request.getColor());
                    variant.setSku(request.getSku());
                    variant.setPrice(request.getPrice());
                    variant.setStock(request.getStock());
                    variant.setActive(request.getActive());

                    ProductVariant saved = productVariantRepository.save(variant);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/stock")
    public ResponseEntity<ProductVariant> updateStock(
            @PathVariable Long id,
            @RequestParam Integer stock
    ) {
        return productVariantRepository.findById(id)
                .map(variant -> {
                    variant.setStock(stock);
                    ProductVariant saved = productVariantRepository.save(variant);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}