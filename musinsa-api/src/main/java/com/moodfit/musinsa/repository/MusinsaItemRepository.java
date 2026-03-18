package com.moodfit.musinsa.repository;

import com.moodfit.musinsa.entity.MusinsaItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MusinsaItemRepository extends JpaRepository<MusinsaItem, String> {

    Page<MusinsaItem> findAll(Pageable pageable);

    Page<MusinsaItem> findByCategory(String category, Pageable pageable);

    List<MusinsaItem> findByCategory(String category);

    Optional<MusinsaItem> findByMusinsaId(String musinsaId);

    boolean existsByMusinsaId(String musinsaId);
}
