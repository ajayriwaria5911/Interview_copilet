// backend/src/main/java/com/interviewcopilot/service/AIQuestionService.java
package com.interviewcopilot.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@Slf4j
public class AIQuestionService {

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public Map generateQuestions(Map<String, Object> request) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity =
                    new HttpEntity<>(request, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    aiServiceUrl + "/api/questions/generate",
                    entity,
                    Map.class
            );

            log.info("Generated questions successfully");
            return response.getBody();

        } catch (Exception e) {
            log.error("AI service error: {}", e.getMessage());
            throw new RuntimeException(
                    "AI service unavailable. Please try again.");
        }
    }

    public Map generateFeedback(Map<String, String> request) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> entity =
                    new HttpEntity<>(request, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    aiServiceUrl + "/api/questions/feedback",
                    entity,
                    Map.class
            );

            return response.getBody();

        } catch (Exception e) {
            log.error("AI feedback error: {}", e.getMessage());
            throw new RuntimeException("AI feedback service unavailable.");
        }
    }

    public Map getAvailableTopics() {
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(
                    aiServiceUrl + "/api/questions/topics",
                    Map.class
            );
            return response.getBody();
        } catch (Exception e) {
            log.error("AI topics error: {}", e.getMessage());
            throw new RuntimeException("AI service unavailable.");
        }
    }
}