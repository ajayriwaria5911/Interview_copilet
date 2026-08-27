// backend/src/main/java/com/interviewcopilot/dto/AIQuestionRequest.java
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
public class AIQuestionRequest {
    private String jobRole;
    private String topic;
    private String interviewType;
    private String experienceLevel;
    private Integer numQuestions;
    private String difficulty;
    private List<String> previousQuestions;
}