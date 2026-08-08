// backend/src/main/java/com/interviewcopilot/dto/SendMessageRequest.java
package com.interviewcopilot.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SendMessageRequest {

    @NotBlank(message = "Message content cannot be empty")
    private String content;

    private Long questionId;
}