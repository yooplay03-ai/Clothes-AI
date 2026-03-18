package com.moodfit.service;

import com.moodfit.entity.ClothingItem;
import com.moodfit.entity.ClothingItem.Category;
import com.moodfit.entity.User;
import com.moodfit.repository.ClothingItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClothingItemService {

    private final ClothingItemRepository clothingItemRepository;
    private final UserService userService;

    public ClothingItem create(Long userId, ClothingItem item) {
        User user = userService.findById(userId);
        item.setUser(user);
        return clothingItemRepository.save(item);
    }

    public List<ClothingItem> findByUser(Long userId) {
        return clothingItemRepository.findByUserId(userId);
    }

    public List<ClothingItem> findByUserAndCategory(Long userId, Category category) {
        return clothingItemRepository.findByUserIdAndCategory(userId, category);
    }

    public List<ClothingItem> findFavorites(Long userId) {
        return clothingItemRepository.findByUserIdAndIsFavoriteTrue(userId);
    }

    public ClothingItem findById(Long id) {
        return clothingItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("의류를 찾을 수 없습니다."));
    }

    @Transactional
    public ClothingItem update(Long id, ClothingItem updated) {
        ClothingItem item = findById(id);
        item.setName(updated.getName());
        item.setBrand(updated.getBrand());
        item.setCategory(updated.getCategory());
        item.setColors(updated.getColors());
        item.setImageUrl(updated.getImageUrl());
        item.setFavorite(updated.isFavorite());
        return item;
    }

    @Transactional
    public void incrementWearCount(Long id) {
        ClothingItem item = findById(id);
        item.setWearCount(item.getWearCount() + 1);
    }

    public void delete(Long id) {
        clothingItemRepository.deleteById(id);
    }
}
