package com.moodfit.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "clothing_items")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ClothingItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String brand;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;

    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "clothing_colors", joinColumns = @JoinColumn(name = "clothing_item_id"))
    @Column(name = "color")
    private List<Color> colors;

    private String imageUrl;

    @Builder.Default
    private boolean isFavorite = false;

    @Builder.Default
    private int wearCount = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public enum Category {
        TOP, BOTTOM, DRESS, OUTERWEAR, SHOES, ACCESSORY, BAG, UNDERWEAR, ACTIVEWEAR
    }

    public enum Color {
        BLACK, WHITE, GRAY, RED, ORANGE, YELLOW, GREEN, BLUE,
        PURPLE, PINK, BROWN, BEIGE, NAVY
    }
}
