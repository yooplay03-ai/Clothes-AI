package com.moodfit.repository;

import com.moodfit.entity.ClothingItem;
import com.moodfit.entity.ClothingItem.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClothingItemRepository extends JpaRepository<ClothingItem, Long> {
    List<ClothingItem> findByUserId(Long userId);
    List<ClothingItem> findByUserIdAndCategory(Long userId, Category category);
    List<ClothingItem> findByUserIdAndIsFavoriteTrue(Long userId);
}
