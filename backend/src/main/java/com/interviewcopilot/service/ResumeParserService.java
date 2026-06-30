// backend/src/main/java/com/interviewcopilot/service/ResumeParserService.java
package com.interviewcopilot.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

@Service
@Slf4j
public class ResumeParserService {

    private static final List<String> COMMON_SKILLS = Arrays.asList(
            "java", "python", "javascript", "typescript", "react", "angular",
            "vue", "spring", "spring boot", "node.js", "express", "django",
            "flask", "sql", "mongodb", "postgresql", "mysql", "redis",
            "docker", "kubernetes", "aws", "azure", "gcp", "git", "ci/cd",
            "rest api", "graphql", "microservices", "html", "css", "tailwind"
    );

    public ParsedResume parse(byte[] pdfBytes) {
        try (PDDocument document = Loader.loadPDF(pdfBytes)) {

            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            int pageCount = document.getNumberOfPages();

            List<String> detectedSkills = detectSkills(text);
            int wordCount = text.trim().isEmpty() ? 0 : text.trim().split("\\s+").length;

            return ParsedResume.builder()
                    .text(text)
                    .skills(detectedSkills)
                    .pageCount(pageCount)
                    .wordCount(wordCount)
                    .build();

        } catch (IOException e) {
            log.error("Failed to parse PDF", e);
            throw new RuntimeException("Could not parse resume: " + e.getMessage());
        }
    }

    private List<String> detectSkills(String text) {
        String lowerText = text.toLowerCase(Locale.ROOT);
        List<String> found = new ArrayList<>();

        for (String skill : COMMON_SKILLS) {
            if (lowerText.contains(skill)) {
                found.add(skill);
            }
        }
        return found;
    }

    public static class ParsedResume {
        public String text;
        public List<String> skills;
        public Integer pageCount;
        public Integer wordCount;

        public static ParsedResumeBuilder builder() {
            return new ParsedResumeBuilder();
        }

        public static class ParsedResumeBuilder {
            private String text;
            private List<String> skills;
            private Integer pageCount;
            private Integer wordCount;

            public ParsedResumeBuilder text(String text) {
                this.text = text;
                return this;
            }

            public ParsedResumeBuilder skills(List<String> skills) {
                this.skills = skills;
                return this;
            }

            public ParsedResumeBuilder pageCount(Integer pageCount) {
                this.pageCount = pageCount;
                return this;
            }

            public ParsedResumeBuilder wordCount(Integer wordCount) {
                this.wordCount = wordCount;
                return this;
            }

            public ParsedResume build() {
                ParsedResume r = new ParsedResume();
                r.text = this.text;
                r.skills = this.skills;
                r.pageCount = this.pageCount;
                r.wordCount = this.wordCount;
                return r;
            }
        }
    }
}