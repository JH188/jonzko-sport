package com.jonzko.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jonzko.backend.entity.AdminPasswordChangeCode;

public interface AdminPasswordChangeCodeRepository extends JpaRepository<AdminPasswordChangeCode, Long> {

    Optional<AdminPasswordChangeCode> findTopByEmailAndCodeAndUsedFalseOrderByCreatedAtDesc(
            String email,
            String code
    );
}