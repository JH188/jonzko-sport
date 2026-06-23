package com.jonzko.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jonzko.backend.entity.AdminLoginCode;

public interface AdminLoginCodeRepository extends JpaRepository<AdminLoginCode, Long> {

    Optional<AdminLoginCode> findTopByEmailAndCodeAndUsedFalseOrderByCreatedAtDesc(
            String email,
            String code
    );
}