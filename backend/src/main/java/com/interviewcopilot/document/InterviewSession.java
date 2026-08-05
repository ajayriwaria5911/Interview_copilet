// backend/src/main/java/com/interviewcopilot/document/InterviewSession.java
package com.interviewcopilot.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "interview_sessions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewSession {

    @Id
    private String id;

    private Long postgresInterviewId;
    private Long userId;
    private String interviewType;
    private String jobRole;
    private String topic;

    private List<SessionMessage> messages;
    private List<String> coveredTopics;

    private String overallSummary;
    private List<String> strengths;
    private List<String> weaknesses;
    private List<String> recommendations;

    private Double confidenceScore;
    private Double technicalScore;
    private Double communicationScore;

    @CreatedDate
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SessionMessage {
        private String role;
        private String content;
        private LocalDateTime timestamp;
        private Long questionId;
        private Double messageScore;
    }
}