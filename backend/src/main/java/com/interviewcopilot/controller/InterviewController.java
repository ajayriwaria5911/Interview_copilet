// backend/src/main/java/com/interviewcopilot/controller/InterviewController.java
package com.interviewcopilot.controller;

import com.interviewcopilot.dto.*;
import com.interviewcopilot.service.InterviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
@Slf4j
public class InterviewController {

    private final InterviewService interviewService;

    @PostMapping
    public ResponseEntity<InterviewDto> createInterview(
            @Valid @RequestBody CreateInterviewRequest request,
            Authentication authentication) {

        InterviewDto interview = interviewService
                .createInterview(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(interview);
    }

    @GetMapping
    public ResponseEntity<List<InterviewDto>> getUserInterviews(
            Authentication authentication) {

        List<InterviewDto> interviews = interviewService
                .getUserInterviews(authentication.getName());
        return ResponseEntity.ok(interviews);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InterviewDto> getInterview(
            @PathVariable Long id,
            Authentication authentication) {

        InterviewDto interview = interviewService
                .getInterview(id, authentication.getName());
        return ResponseEntity.ok(interview);
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<InterviewDto>> getInterviewsByType(
            @PathVariable String type,
            Authentication authentication) {

        List<InterviewDto> interviews = interviewService
                .getUserInterviewsByType(authentication.getName(), type);
        return ResponseEntity.ok(interviews);
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<InterviewDto> startInterview(
            @PathVariable Long id,
            Authentication authentication) {

        InterviewDto interview = interviewService
                .startInterview(id, authentication.getName());
        return ResponseEntity.ok(interview);
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<InterviewDto> completeInterview(
            @PathVariable Long id,
            Authentication authentication) {

        InterviewDto interview = interviewService
                .completeInterview(id, authentication.getName());
        return ResponseEntity.ok(interview);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<InterviewDto> cancelInterview(
            @PathVariable Long id,
            Authentication authentication) {

        InterviewDto interview = interviewService
                .cancelInterview(id, authentication.getName());
        return ResponseEntity.ok(interview);
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<InterviewHistoryDto> getInterviewHistory(
            @PathVariable Long id,
            Authentication authentication) {

        InterviewHistoryDto history = interviewService
                .getInterviewHistory(id, authentication.getName());
        return ResponseEntity.ok(history);
    }

    @GetMapping("/history")
    public ResponseEntity<List<InterviewDto>> getAllHistory(
            Authentication authentication) {

        List<InterviewDto> interviews = interviewService
                .getUserInterviews(authentication.getName());
        return ResponseEntity.ok(interviews);
    }
}