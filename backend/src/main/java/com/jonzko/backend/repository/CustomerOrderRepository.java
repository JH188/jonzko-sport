package com.jonzko.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jonzko.backend.entity.CustomerOrder;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {

    List<CustomerOrder> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<CustomerOrder> findAllByOrderByCreatedAtDesc();
}