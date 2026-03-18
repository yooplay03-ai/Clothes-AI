package com.moodfit.musinsa.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.moodfit.musinsa.dto.ImportResultDto;
import com.moodfit.musinsa.entity.MusinsaItem;
import com.moodfit.musinsa.repository.MusinsaItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.util.Iterator;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MusinsaService {

    private final MusinsaItemRepository itemRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public Page<MusinsaItem> findAll(int page, int size, String category) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        if (category != null && !category.isBlank()) {
            return itemRepository.findByCategory(category, pageable);
        }
        return itemRepository.findAll(pageable);
    }

    public MusinsaItem findById(String id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found: " + id));
    }

    @Transactional
    public ImportResultDto importFromMetadata(String metadataPath) throws Exception {
        File file = new File(metadataPath);
        if (!file.exists()) {
            throw new RuntimeException("metadata.json not found: " + metadataPath);
        }

        JsonNode root = objectMapper.readTree(file);
        JsonNode categories = root.get("categories");

        int imported = 0;
        int skipped = 0;

        Iterator<Map.Entry<String, JsonNode>> catFields = categories.fields();
        while (catFields.hasNext()) {
            Map.Entry<String, JsonNode> catEntry = catFields.next();
            String category = catEntry.getKey();
            JsonNode items = catEntry.getValue().get("items");

            if (items == null || !items.isArray()) continue;

            for (JsonNode item : items) {
                String musinsaId = item.path("id").asText("");
                String imageUrl  = item.path("image_url").asText("");

                if (musinsaId.isBlank() || imageUrl.isBlank()) {
                    skipped++;
                    continue;
                }

                if (itemRepository.existsByMusinsaId(musinsaId)) {
                    skipped++;
                    continue;
                }

                MusinsaItem entity = new MusinsaItem();
                entity.setMusinsaId(musinsaId);
                entity.setName(item.path("name").asText("Unknown"));
                entity.setBrand(item.path("brand").asText(null));
                entity.setPrice(item.path("price").asInt(0));
                entity.setImageUrl(imageUrl);
                entity.setLocalPath(item.path("local_path").asText(null));
                entity.setCategory(category);

                itemRepository.save(entity);
                imported++;
            }
        }

        return new ImportResultDto(imported, skipped);
    }
}
