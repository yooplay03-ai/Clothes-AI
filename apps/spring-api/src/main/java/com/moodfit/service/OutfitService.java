package com.moodfit.service;

import com.moodfit.entity.ClothingItem;
import com.moodfit.entity.Outfit;
import com.moodfit.entity.User;
import com.moodfit.repository.ClothingItemRepository;
import com.moodfit.repository.OutfitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OutfitService {

    private final OutfitRepository outfitRepository;
    private final ClothingItemRepository clothingItemRepository;
    private final UserService userService;

    public Outfit create(Long userId, List<Long> clothingItemIds,
                         String mood, String weather, String occasion, String aiComment) {
        User user = userService.findById(userId);
        List<ClothingItem> items = clothingItemRepository.findAllById(clothingItemIds);

        Outfit outfit = Outfit.builder()
                .user(user)
                .clothingItems(items)
                .mood(mood)
                .weather(weather)
                .occasion(occasion)
                .aiComment(aiComment)
                .build();
        return outfitRepository.save(outfit);
    }

    public List<Outfit> findByUser(Long userId) {
        return outfitRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Outfit> findLikedByUser(Long userId) {
        return outfitRepository.findByUserIdAndIsLikedTrue(userId);
    }

    public List<Outfit> findByUserAndMood(Long userId, String mood) {
        return outfitRepository.findByUserIdAndMood(userId, mood);
    }

    public Outfit findById(Long id) {
        return outfitRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("코디를 찾을 수 없습니다."));
    }

    @Transactional
    public Outfit toggleLike(Long id) {
        Outfit outfit = findById(id);
        outfit.setLiked(!outfit.isLiked());
        return outfit;
    }

    public void delete(Long id) {
        outfitRepository.deleteById(id);
    }
}
