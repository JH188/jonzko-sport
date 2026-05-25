package com.jonzko.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jonzko.backend.entity.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByCustomerEmailOrderByCreatedAtDesc(String customerEmail);

    List<Order> findAllByOrderByCreatedAtDesc();
}