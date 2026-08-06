// backend/src/main/java/com/interviewcopilot/dto/InterviewHistoryDto.java
package com.interviewcopilot.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewHistoryDto {

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
    private List<QuestionDto> questions;
    private List<FeedbackDto> feedbacks;
}