package com.moodfit.musinsa.controller;

import com.moodfit.musinsa.dto.ImportResultDto;
import com.moodfit.musinsa.entity.MusinsaItem;
import com.moodfit.musinsa.service.MusinsaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/musinsa")
@RequiredArgsConstructor
@Tag(name = "Musinsa", description = "무신사 크롤링 아이템 API")
public class MusinsaController {

    private final MusinsaService musinsaService;

    @GetMapping
    @Operation(summary = "아이템 목록 조회", description = "페이지네이션 + 카테고리 필터")
    public ResponseEntity<Page<MusinsaItem>> findAll(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "24") int size,
            @RequestParam(required = false)    String category
    ) {
        return ResponseEntity.ok(musinsaService.findAll(page, size, category));
    }

    @GetMapping("/{id}")
    @Operation(summary = "아이템 단건 조회")
    public ResponseEntity<MusinsaItem> findOne(@PathVariable String id) {
        return ResponseEntity.ok(musinsaService.findById(id));
    }

    @PostMapping("/import")
    @Operation(summary = "metadata.json → DB 임포트", description = "크롤링 결과를 DB에 저장")
    public ResponseEntity<ImportResultDto> importMetadata(
            @RequestParam String metadataPath
    ) throws Exception {
        return ResponseEntity.ok(musinsaService.importFromMetadata(metadataPath));
    }
}
