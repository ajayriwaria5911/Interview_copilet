// backend/src/main/java/com/interviewcopilot/dto/CreateInterviewRequest.java
package com.interviewcopilot.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateInterviewRequest {

    @NotNull(message = "Interview type is required")
    private String type;

    @NotBlank(message = "Topic is required")
    private String topic;

    @NotBlank(message = "Job role is required")
    private String jobRole;

    @NotBlank(message = "Experience level is required")
    private String experienceLevel;

    private Integer totalQuestions;
    private LocalDateTime scheduledAt;
}