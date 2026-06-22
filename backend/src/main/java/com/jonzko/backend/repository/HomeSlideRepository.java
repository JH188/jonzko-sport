package com.jonzko.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jonzko.backend.entity.HomeSlide;

public interface HomeSlideRepository extends JpaRepository<HomeSlide, Long> {

    List<HomeSlide> findByActiveTrueOrderByDisplayOrderAsc();

    List<HomeSlide> findAllByOrderByDisplayOrderAsc();
}