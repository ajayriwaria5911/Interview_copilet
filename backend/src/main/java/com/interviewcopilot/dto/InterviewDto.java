// backend/src/main/java/com/interviewcopilot/dto/InterviewDto.java
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
public class InterviewDto {

    private Long id;
    private String type;
    private String status;
    private String topic;
    private String jobRole;
    private String experienceLevel;
    private Double overallScore;
    private Integer durationMinutes;
    private Integer totalQuestions;
    private Integer answeredQuestions;
    private LocalDateTime scheduledAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
}