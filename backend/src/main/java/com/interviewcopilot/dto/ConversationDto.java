// backend/src/main/java/com/interviewcopilot/dto/ConversationDto.java
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
public class ConversationDto {

    private Long interviewId;
    private String interviewType;
    private String topic;
    private String jobRole;
    private Integer totalMessages;
    private Integer userMessages;
    private Integer assistantMessages;
    private List<ChatMessageResponse> messages;
}