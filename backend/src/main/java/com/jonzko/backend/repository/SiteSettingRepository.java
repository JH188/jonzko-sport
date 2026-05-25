package com.jonzko.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jonzko.backend.entity.SiteSetting;

public interface SiteSettingRepository extends JpaRepository<SiteSetting, Long> {

    Optional<SiteSetting> findFirstByActiveTrueOrderByIdAsc();
}