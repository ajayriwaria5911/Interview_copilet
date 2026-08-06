// backend/src/main/java/com/interviewcopilot/controller/ResumeController.java
package com.interviewcopilot.controller;

import com.interviewcopilot.document.ResumeMetadata;
import com.interviewcopilot.dto.ResumeDto;
import com.interviewcopilot.dto.ResumeUploadResponse;
import com.interviewcopilot.entity.Resume;
import com.interviewcopilot.entity.User;
import com.interviewcopilot.repository.ResumeMetadataRepository;
import com.interviewcopilot.repository.ResumeRepository;
import com.interviewcopilot.repository.UserRepository;
import com.interviewcopilot.service.FileStorageService;
import com.interviewcopilot.service.ResumeParserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
@Slf4j
public class ResumeController {

    private final FileStorageService fileStorageService;
    private final ResumeParserService resumeParserService;
    private final ResumeRepository resumeRepository;
    private final ResumeMetadataRepository resumeMetadataRepository;
    private final UserRepository userRepository;

    @PostMapping("/upload")
    public ResponseEntity<ResumeUploadResponse> uploadResume(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        fileStorageService.validateFile(file);

        String storagePath = fileStorageService.storeFile(file, user.getId());

        Resume resume = Resume.builder()
                .user(user)
                .fileName(file.getOriginalFilename())
                .storagePath(storagePath)
                .status(Resume.ResumeStatus.PROCESSING)
                .build();

        Resume savedResume = resumeRepository.save(resume);

        try {
            byte[] fileBytes = fileStorageService.loadFile(storagePath);
            ResumeParserService.ParsedResume parsed = resumeParserService.parse(fileBytes);

            ResumeMetadata metadata = ResumeMetadata.builder()
                    .postgresResumeId(savedResume.getId())
                    .userId(user.getId())
                    .extractedText(parsed.text)
                    .skills(parsed.skills)
                    .wordCount(parsed.wordCount)
                    .pageCount(parsed.pageCount)
                    .build();

            resumeMetadataRepository.save(metadata);

            savedResume.setStatus(Resume.ResumeStatus.ANALYZED);
            savedResume.setMongoMetadataId(metadata.getId());
            resumeRepository.save(savedResume);

        } catch (Exception e) {
            log.error("Resume parsing failed", e);
            savedResume.setStatus(Resume.ResumeStatus.FAILED);
            resumeRepository.save(savedResume);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(
                ResumeUploadResponse.builder()
                        .resumeId(savedResume.getId())
                        .fileName(savedResume.getFileName())
                        .status(savedResume.getStatus().name())
                        .message("Resume uploaded successfully")
                        .build());
    }

    @GetMapping
    public ResponseEntity<List<ResumeDto>> getUserResumes(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        List<Resume> resumes = resumeRepository.findByUserIdOrderByUploadedAtDesc(user.getId());

        List<ResumeDto> dtos = resumes.stream().map(resume -> {
            List<String> skills = resumeMetadataRepository
                    .findByPostgresResumeId(resume.getId())
                    .map(ResumeMetadata::getSkills)
                    .orElse(List.of());

            Integer wordCount = resumeMetadataRepository
                    .findByPostgresResumeId(resume.getId())
                    .map(ResumeMetadata::getWordCount)
                    .orElse(0);

            return ResumeDto.builder()
                    .id(resume.getId())
                    .fileName(resume.getFileName())
                    .status(resume.getStatus().name())
                    .atsScore(resume.getAtsScore())
                    .uploadedAt(resume.getUploadedAt())
                    .skills(skills)
                    .wordCount(wordCount)
                    .build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResumeDto> getResumeById(
            @PathVariable Long id,
            Authentication authentication) {

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        Resume resume = resumeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resume not found"));

        if (!resume.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("Access denied");
        }

        List<String> skills = resumeMetadataRepository
                .findByPostgresResumeId(resume.getId())
                .map(ResumeMetadata::getSkills)
                .orElse(List.of());

        return ResponseEntity.ok(
                ResumeDto.builder()
                        .id(resume.getId())
                        .fileName(resume.getFileName())
                        .status(resume.getStatus().name())
                        .atsScore(resume.getAtsScore())
                        .uploadedAt(resume.getUploadedAt())
                        .skills(skills)
                        .build());
    }
    @GetMapping("/{id}/download")
public ResponseEntity<byte[]> downloadResume(
        @PathVariable Long id,
        Authentication authentication) {

    String email = authentication.getName();
    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalStateException("User not found"));

    Resume resume = resumeRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Resume not found"));

    if (!resume.getUser().getId().equals(user.getId())) {
        throw new IllegalStateException("Access denied");
    }

    byte[] fileBytes = fileStorageService.loadFile(resume.getStoragePath());

    return ResponseEntity.ok()
            .header("Content-Type", "application/pdf")
            .header("Content-Disposition",
                    "inline; filename=\"" + resume.getFileName() + "\"")
            .body(fileBytes);
}

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResume(
            @PathVariable Long id,
            Authentication authentication) {

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        Resume resume = resumeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resume not found"));

        if (!resume.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("Access denied");
        }

        fileStorageService.deleteFile(resume.getStoragePath());
        resumeMetadataRepository.findByPostgresResumeId(resume.getId())
                .ifPresent(resumeMetadataRepository::delete);
        resumeRepository.delete(resume);

        return ResponseEntity.noContent().build();
    }
}