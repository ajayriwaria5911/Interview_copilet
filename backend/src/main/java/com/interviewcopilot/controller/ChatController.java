// backend/src/main/java/com/interviewcopilot/controller/ChatController.java
package com.interviewcopilot.controller;

import com.interviewcopilot.dto.ChatMessageRequest;
import com.interviewcopilot.dto.ChatMessageResponse;
import com.interviewcopilot.dto.ConversationDto;
import com.interviewcopilot.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/send")
    public ResponseEntity<ChatMessageResponse> sendMessage(
            @Valid @RequestBody ChatMessageRequest request,
            Authentication authentication) {

        ChatMessageResponse response = chatService
                .sendMessage(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{interviewId}/next-question")
    public ResponseEntity<ChatMessageResponse> getNextQuestion(
            @PathVariable Long interviewId,
            Authentication authentication) {

        ChatMessageResponse question = chatService
                .getNextQuestion(interviewId, authentication.getName());
        return ResponseEntity.ok(question);
    }

    @GetMapping("/{interviewId}/messages")
    public ResponseEntity<List<ChatMessageResponse>> getMessages(
            @PathVariable Long interviewId,
            Authentication authentication) {

        List<ChatMessageResponse> messages = chatService
                .getMessages(interviewId, authentication.getName());
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/{interviewId}/conversation")
    public ResponseEntity<ConversationDto> getConversation(
            @PathVariable Long interviewId,
            Authentication authentication) {

        ConversationDto conversation = chatService
                .getConversation(interviewId, authentication.getName());
        return ResponseEntity.ok(conversation);
    }

    @DeleteMapping("/{interviewId}/clear")
    public ResponseEntity<Void> clearConversation(
            @PathVariable Long interviewId,
            Authentication authentication) {

        chatService.clearConversation(
                interviewId, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}