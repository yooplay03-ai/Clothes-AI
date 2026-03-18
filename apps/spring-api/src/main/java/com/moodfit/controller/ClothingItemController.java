package com.moodfit.controller;

import com.moodfit.entity.ClothingItem;
import com.moodfit.entity.ClothingItem.Category;
import com.moodfit.service.ClothingItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/wardrobe")
@RequiredArgsConstructor
public class ClothingItemController {

    private final ClothingItemService clothingItemService;

    @GetMapping
    public ResponseEntity<List<ClothingItem>> getAll(
            @PathVariable Long userId,
            @RequestParam(required = false) Category category) {
        List<ClothingItem> items = (category != null)
                ? clothingItemService.findByUserAndCategory(userId, category)
                : clothingItemService.findByUser(userId);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/favorites")
    public ResponseEntity<List<ClothingItem>> getFavorites(@PathVariable Long userId) {
        return ResponseEntity.ok(clothingItemService.findFavorites(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClothingItem> getOne(@PathVariable Long userId,
                                               @PathVariable Long id) {
        return ResponseEntity.ok(clothingItemService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ClothingItem> create(@PathVariable Long userId,
                                               @RequestBody ClothingItem item) {
        return ResponseEntity.ok(clothingItemService.create(userId, item));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClothingItem> update(@PathVariable Long userId,
                                               @PathVariable Long id,
                                               @RequestBody ClothingItem item) {
        return ResponseEntity.ok(clothingItemService.update(id, item));
    }

    @PostMapping("/{id}/wear")
    public ResponseEntity<Void> wear(@PathVariable Long userId,
                                     @PathVariable Long id) {
        clothingItemService.incrementWearCount(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long userId,
                                       @PathVariable Long id) {
        clothingItemService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
