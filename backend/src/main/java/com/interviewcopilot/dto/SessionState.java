// backend/src/main/java/com/interviewcopilot/dto/SessionState.java
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
public class SessionState {

    private String sessionId;
    private Long interviewId;
    private Long userId;
    private String status;
    private Integer currentQuestionIndex;
    private Integer totalQuestions;
    private List<String> answeredQuestions;
    private LocalDateTime startedAt;
    private LocalDateTime lastActivityAt;
}