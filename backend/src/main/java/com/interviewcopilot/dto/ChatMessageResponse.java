// backend/src/main/java/com/interviewcopilot/dto/ChatMessageResponse.java
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
public class ChatMessageResponse {

    private String id;
    private Long interviewId;
    private Long userId;
    private String role;
    private String content;
    private String messageType;
    private Integer questionIndex;
    private Double score;
    private Boolean isQuestion;
    private String topic;
    private LocalDateTime createdAt;
}