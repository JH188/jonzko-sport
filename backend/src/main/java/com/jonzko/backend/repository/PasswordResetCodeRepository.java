package com.jonzko.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jonzko.backend.entity.PasswordResetCode;

public interface PasswordResetCodeRepository extends JpaRepository<PasswordResetCode, Long> {

    List<PasswordResetCode> findByEmailAndUsedFalse(String email);

    Optional<PasswordResetCode> findTopByEmailAndUsedFalseOrderByCreatedAtDesc(String email);
}