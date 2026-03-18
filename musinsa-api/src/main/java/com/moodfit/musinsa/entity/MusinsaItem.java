package com.moodfit.musinsa.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "musinsa_items",
       indexes = {
           @Index(name = "idx_musinsa_id", columnList = "musinsa_id", unique = true),
           @Index(name = "idx_category",   columnList = "category")
       })
@Getter @Setter @NoArgsConstructor
public class MusinsaItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "musinsa_id", nullable = false, unique = true)
    private String musinsaId;

    @Column(nullable = false)
    private String name;

    private String brand;

    private int price;

    @Column(name = "image_url", length = 1000)
    private String imageUrl;

    @Column(name = "local_path", length = 1000)
    private String localPath;

    @Column(nullable = false)
    private String category;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
