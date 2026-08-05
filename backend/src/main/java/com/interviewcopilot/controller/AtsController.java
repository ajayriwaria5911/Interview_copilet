// backend/src/main/java/com/interviewcopilot/controller/AtsController.java
package com.interviewcopilot.controller;

import com.interviewcopilot.dto.AtsAnalysisResult;
import com.interviewcopilot.entity.Resume;
import com.interviewcopilot.entity.User;
import com.interviewcopilot.repository.ResumeRepository;
import com.interviewcopilot.repository.UserRepository;
import com.interviewcopilot.service.AtsAnalysisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ats")
@RequiredArgsConstructor
@Slf4j
public class AtsController {

    private final AtsAnalysisService atsAnalysisService;
    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;

    @PostMapping("/analyze/{resumeId}")
    public ResponseEntity<AtsAnalysisResult> analyzeResume(
            @PathVariable Long resumeId,
            Authentication authentication) {

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new IllegalArgumentException("Resume not found"));

        if (!resume.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("Access denied");
        }

        AtsAnalysisResult result = atsAnalysisService.analyzeResume(resumeId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/result/{resumeId}")
    public ResponseEntity<AtsAnalysisResult> getAnalysisResult(
            @PathVariable Long resumeId,
            Authentication authentication) {

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new IllegalArgumentException("Resume not found"));

        if (!resume.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("Access denied");
        }

        AtsAnalysisResult result = atsAnalysisService.analyzeResume(resumeId);
        return ResponseEntity.ok(result);
    }
}