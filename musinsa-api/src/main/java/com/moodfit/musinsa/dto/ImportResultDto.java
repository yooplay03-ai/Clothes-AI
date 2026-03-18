package com.moodfit.musinsa.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ImportResultDto {
    private int imported;
    private int skipped;
}
