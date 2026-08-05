// backend/src/main/java/com/interviewcopilot/service/AtsAnalysisService.java
package com.interviewcopilot.service;

import com.interviewcopilot.document.ResumeMetadata;
import com.interviewcopilot.dto.AtsAnalysisResult;
import com.interviewcopilot.entity.Resume;
import com.interviewcopilot.repository.ResumeMetadataRepository;
import com.interviewcopilot.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AtsAnalysisService {

    private final ResumeRepository resumeRepository;
    private final ResumeMetadataRepository resumeMetadataRepository;

    private static final List<String> REQUIRED_KEYWORDS = Arrays.asList(
            "experience", "education", "skills", "projects",
            "achievements", "certifications", "summary", "objective"
    );

    private static final List<String> TECH_KEYWORDS = Arrays.asList(
            "java", "python", "javascript", "typescript", "react",
            "angular", "vue", "spring", "spring boot", "node.js",
            "express", "django", "flask", "sql", "mongodb",
            "postgresql", "mysql", "redis", "docker", "kubernetes",
            "aws", "azure", "gcp", "git", "ci/cd", "rest api",
            "graphql", "microservices", "html", "css", "tailwind",
            "linux", "agile", "scrum", "jira", "confluence"
    );

    // Skill count needed to earn full skill-score marks.
    // Chosen higher than REQUIRED_KEYWORDS size so skills alone can't fully
    // offset missing resume sections.
    private static final int SKILL_TARGET_COUNT = 15;

    public AtsAnalysisResult analyzeResume(Long resumeId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new IllegalArgumentException("Resume not found"));

        ResumeMetadata metadata = resumeMetadataRepository
                .findByPostgresResumeId(resumeId)
                .orElseThrow(() -> new IllegalArgumentException("Resume metadata not found"));

        String text = metadata.getExtractedText().toLowerCase();
        List<String> detectedSkills = metadata.getSkills();

        // Keyword matching
        List<String> matchedKeywords = new ArrayList<>();
        List<String> missingKeywords = new ArrayList<>();

        for (String keyword : REQUIRED_KEYWORDS) {
            if (text.contains(keyword)) {
                matchedKeywords.add(keyword);
            } else {
                missingKeywords.add(keyword);
            }
        }

        // Tech keyword analysis
        List<String> missingTechKeywords = TECH_KEYWORDS.stream()
                .filter(k -> !detectedSkills.contains(k))
                .limit(10)
                .collect(Collectors.toList());

        missingKeywords.addAll(missingTechKeywords);

        // ── Score calculation ────────────────────────────────────────────
        // Section score: 50 points max, proportional to required sections found.
        // Missing sections directly reduce this — no longer maskable by skills.
        double sectionScore = (double) matchedKeywords.size() / REQUIRED_KEYWORDS.size() * 50;

        // Skill score: 50 points max, proportional to skills detected,
        // capped so it can never exceed 50 regardless of skill count.
        double skillScore = Math.min(
                (double) detectedSkills.size() / SKILL_TARGET_COUNT * 50, 50);

        double totalScore = sectionScore + skillScore;
        totalScore = Math.min(totalScore, 100);
        totalScore = Math.round(totalScore * 100.0) / 100.0;

        // Generate suggestions
        List<String> suggestions = generateSuggestions(
                matchedKeywords, missingKeywords, detectedSkills, totalScore);

        // Detect experience level
        String experienceLevel = detectExperienceLevel(text);

        // Generate summary
        String summary = generateSummary(totalScore, detectedSkills.size(),
                matchedKeywords.size(), experienceLevel);

        // Update ATS score in database
        resume.setAtsScore(totalScore);
        resumeRepository.save(resume);

        log.info("ATS analysis complete for resume {}: score={} (sectionScore={}, skillScore={})",
                resumeId, totalScore, sectionScore, skillScore);

        return AtsAnalysisResult.builder()
                .resumeId(resumeId)
                .score(totalScore)
                .matchedKeywords(matchedKeywords)
                .missingKeywords(missingKeywords.stream().limit(10).collect(Collectors.toList()))
                .suggestions(suggestions)
                .summary(summary)
                .experienceLevel(experienceLevel)
                .build();
    }

    private List<String> generateSuggestions(
            List<String> matched,
            List<String> missing,
            List<String> skills,
            double score) {

        List<String> suggestions = new ArrayList<>();

        if (!matched.contains("summary") && !matched.contains("objective")) {
            suggestions.add("Add a professional summary or objective section");
        }
        if (!matched.contains("achievements")) {
            suggestions.add("Include quantifiable achievements with numbers and metrics");
        }
        if (!matched.contains("certifications")) {
            suggestions.add("Add relevant certifications to boost your profile");
        }
        if (skills.size() < 5) {
            suggestions.add("Add more technical skills relevant to your target role");
        }
        if (score < 60) {
            suggestions.add("Use more industry-standard keywords throughout your resume");
        }
        if (score < 80) {
            suggestions.add("Tailor your resume for each specific job description");
        }
        suggestions.add("Use action verbs at the start of each bullet point");
        suggestions.add("Keep resume to 1-2 pages for optimal ATS performance");

        return suggestions;
    }

    private String detectExperienceLevel(String text) {
        if (text.contains("10+ years") || text.contains("senior") ||
                text.contains("lead") || text.contains("architect")) {
            return "Senior";
        } else if (text.contains("5+ years") || text.contains("mid-level") ||
                text.contains("intermediate")) {
            return "Mid-Level";
        } else if (text.contains("fresher") || text.contains("graduate") ||
                text.contains("intern") || text.contains("entry")) {
            return "Entry-Level";
        }
        return "Mid-Level";
    }

    private String generateSummary(double score, int skillCount,
            int sectionCount, String level) {
        if (score >= 80) {
            return String.format(
                "Excellent resume! %d skills detected, %d key sections found. " +
                "Your resume is well-optimized for ATS systems.", skillCount, sectionCount);
        } else if (score >= 60) {
            return String.format(
                "Good resume with room for improvement. %d skills detected. " +
                "Follow the suggestions to boost your ATS score.", skillCount);
        } else {
            return String.format(
                "Your resume needs optimization. Only %d skills detected. " +
                "Add missing sections and keywords to improve visibility.", skillCount);
        }
    }
}