// backend/src/main/java/com/interviewcopilot/dto/FeedbackDto.java
package com.interviewcopilot.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackDto {

    private Long id;
    private Long interviewId;
    private Long questionId;
    private String feedbackText;
    private String strengths;
    private String weaknesses;
    private String improvements;
    private Double score;
    private String type;
    private String aiModel;
    private LocalDateTime createdAt;
}