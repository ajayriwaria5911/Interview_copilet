// backend/src/main/java/com/interviewcopilot/dto/AtsAnalysisResult.java
package com.interviewcopilot.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtsAnalysisResult {
    private Long resumeId;
    private Double score;
    private List<String> matchedKeywords;
    private List<String> missingKeywords;
    private List<String> suggestions;
    private String summary;
    private String experienceLevel;
}