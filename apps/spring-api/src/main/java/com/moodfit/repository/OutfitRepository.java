package com.moodfit.repository;

import com.moodfit.entity.Outfit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OutfitRepository extends JpaRepository<Outfit, Long> {
    List<Outfit> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Outfit> findByUserIdAndIsLikedTrue(Long userId);
    List<Outfit> findByUserIdAndMood(Long userId, String mood);
}
