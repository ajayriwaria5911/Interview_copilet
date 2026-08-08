// backend/src/main/java/com/interviewcopilot/document/ChatMessage.java
package com.interviewcopilot.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;

@Document(collection = "chat_messages")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    @Id
    private String id;

    @Indexed
    private Long interviewId;

    private Long userId;

    private String role; // user, assistant, system

    private String content;

    private String messageType; // question, answer, feedback, hint

    private Integer questionIndex;

    private Double score;

    private Boolean isQuestion;

    private String topic;

    @CreatedDate
    private LocalDateTime createdAt;
}