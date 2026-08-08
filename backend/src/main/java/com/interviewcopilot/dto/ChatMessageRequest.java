// backend/src/main/java/com/interviewcopilot/dto/ChatMessageRequest.java
package com.interviewcopilot.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ChatMessageRequest {

    @NotNull(message = "Interview ID is required")
    private Long interviewId;

    @NotBlank(message = "Message content is required")
    private String content;

    private String messageType;

    private Integer questionIndex;
}