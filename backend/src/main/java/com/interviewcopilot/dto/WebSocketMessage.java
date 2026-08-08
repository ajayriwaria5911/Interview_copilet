// backend/src/main/java/com/interviewcopilot/dto/WebSocketMessage.java
package com.interviewcopilot.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebSocketMessage {

    private String type;
    private String sessionId;
    private String userId;
    private String interviewId;
    private Object payload;
    private String timestamp;

    public enum MessageType {
        JOIN_SESSION,
        LEAVE_SESSION,
        QUESTION,
        ANSWER,
        FEEDBACK,
        TYPING,
        SESSION_STARTED,
        SESSION_ENDED,
        ERROR,
        PING,
        PONG
    }
}