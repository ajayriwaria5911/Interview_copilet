// backend/src/main/java/com/interviewcopilot/controller/AIQuestionController.java
package com.interviewcopilot.controller;

import com.interviewcopilot.service.AIQuestionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
public class AIQuestionController {

    private final AIQuestionService aiQuestionService;

    @PostMapping("/questions/generate")
    public ResponseEntity<Map> generateQuestions(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {

        log.info("Generating questions for user: {}",
                authentication.getName());
        return ResponseEntity.ok(
                aiQuestionService.generateQuestions(request));
    }

    @PostMapping("/questions/feedback")
    public ResponseEntity<Map> generateFeedback(
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        return ResponseEntity.ok(
                aiQuestionService.generateFeedback(request));
    }

    @GetMapping("/questions/topics")
    public ResponseEntity<Map> getTopics() {
        return ResponseEntity.ok(
                aiQuestionService.getAvailableTopics());
    }
}