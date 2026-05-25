package com.jonzko.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jonzko.backend.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByActiveTrue();
}