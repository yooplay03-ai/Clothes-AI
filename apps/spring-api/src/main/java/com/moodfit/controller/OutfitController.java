package com.moodfit.controller;

import com.moodfit.entity.Outfit;
import com.moodfit.service.OutfitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/outfits")
@RequiredArgsConstructor
public class OutfitController {

    private final OutfitService outfitService;

    @GetMapping
    public ResponseEntity<List<Outfit>> getAll(
            @PathVariable Long userId,
            @RequestParam(required = false) String mood) {
        List<Outfit> outfits = (mood != null)
                ? outfitService.findByUserAndMood(userId, mood)
                : outfitService.findByUser(userId);
        return ResponseEntity.ok(outfits);
    }

    @GetMapping("/liked")
    public ResponseEntity<List<Outfit>> getLiked(@PathVariable Long userId) {
        return ResponseEntity.ok(outfitService.findLikedByUser(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Outfit> getOne(@PathVariable Long userId,
                                         @PathVariable Long id) {
        return ResponseEntity.ok(outfitService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Outfit> create(@PathVariable Long userId,
                                         @RequestBody CreateOutfitRequest req) {
        Outfit outfit = outfitService.create(
                userId, req.clothingItemIds(), req.mood(), req.weather(), req.occasion(), req.aiComment()
        );
        return ResponseEntity.ok(outfit);
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<Outfit> toggleLike(@PathVariable Long userId,
                                             @PathVariable Long id) {
        return ResponseEntity.ok(outfitService.toggleLike(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long userId,
                                       @PathVariable Long id) {
        outfitService.delete(id);
        return ResponseEntity.noContent().build();
    }

    public record CreateOutfitRequest(
            List<Long> clothingItemIds,
            String mood,
            String weather,
            String occasion,
            String aiComment
    ) {}
}
