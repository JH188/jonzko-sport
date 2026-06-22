package com.jonzko.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jonzko.backend.entity.HomeSetting;

public interface HomeSettingRepository extends JpaRepository<HomeSetting, Long> {
}