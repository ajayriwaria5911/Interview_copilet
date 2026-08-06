// backend/src/main/java/com/interviewcopilot/service/InterviewService.java
package com.interviewcopilot.service;

import com.interviewcopilot.document.InterviewSession;
import com.interviewcopilot.dto.*;
import com.interviewcopilot.entity.Interview;
import com.interviewcopilot.entity.User;
import com.interviewcopilot.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final QuestionRepository questionRepository;
    private final FeedbackRepository feedbackRepository;
    private final InterviewSessionRepository interviewSessionRepository;
    private final UserRepository userRepository;

    @Transactional
    public InterviewDto createInterview(
            CreateInterviewRequest request, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        Interview.InterviewType type;
        try {
            type = Interview.InterviewType.valueOf(
                    request.getType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Invalid interview type: " + request.getType());
        }

        Interview interview = Interview.builder()
                .user(user)
                .type(type)
                .topic(request.getTopic())
                .jobRole(request.getJobRole())
                .experienceLevel(request.getExperienceLevel())
                .totalQuestions(request.getTotalQuestions() != null
                        ? request.getTotalQuestions() : 10)
                .status(Interview.InterviewStatus.SCHEDULED)
                .scheduledAt(request.getScheduledAt() != null
                        ? request.getScheduledAt() : LocalDateTime.now())
                .build();

        Interview saved = interviewRepository.save(interview);

        InterviewSession session = InterviewSession.builder()
                .postgresInterviewId(saved.getId())
                .userId(user.getId())
                .interviewType(type.name())
                .jobRole(request.getJobRole())
                .topic(request.getTopic())
                .build();

        InterviewSession savedSession = interviewSessionRepository.save(session);

        saved.setMongoSessionId(savedSession.getId());
        interviewRepository.save(saved);

        log.info("Interview created: id={}, type={}, user={}",
                saved.getId(), type, email);

        return mapToDto(saved);
    }

    @Transactional
    public InterviewDto startInterview(Long interviewId, String email) {

        Interview interview = getInterviewForUser(interviewId, email);

        if (interview.getStatus() != Interview.InterviewStatus.SCHEDULED) {
            throw new IllegalStateException(
                    "Interview is not in SCHEDULED status");
        }

        interview.setStatus(Interview.InterviewStatus.IN_PROGRESS);
        interview.setStartedAt(LocalDateTime.now());
        Interview saved = interviewRepository.save(interview);

        log.info("Interview started: id={}", interviewId);
        return mapToDto(saved);
    }

    @Transactional
    public InterviewDto completeInterview(Long interviewId, String email) {

        Interview interview = getInterviewForUser(interviewId, email);

        if (interview.getStatus() != Interview.InterviewStatus.IN_PROGRESS) {
            throw new IllegalStateException(
                    "Interview is not in IN_PROGRESS status");
        }

        long answeredCount = questionRepository
                .countByInterviewIdAndAnsweredTrue(interviewId);

        if (interview.getStartedAt() != null) {
            long minutes = java.time.Duration.between(
                    interview.getStartedAt(),
                    LocalDateTime.now()).toMinutes();
            interview.setDurationMinutes((int) minutes);
        }

        interview.setStatus(Interview.InterviewStatus.COMPLETED);
        interview.setCompletedAt(LocalDateTime.now());
        interview.setAnsweredQuestions((int) answeredCount);

        // ✅ FIXED: save interview not saved
        Interview result = interviewRepository.save(interview);
        log.info("Interview completed: id={}", interviewId);
        return mapToDto(result);
    }

    @Transactional
    public InterviewDto cancelInterview(Long interviewId, String email) {

        Interview interview = getInterviewForUser(interviewId, email);

        if (interview.getStatus() == Interview.InterviewStatus.COMPLETED) {
            throw new IllegalStateException(
                    "Cannot cancel a completed interview");
        }

        interview.setStatus(Interview.InterviewStatus.CANCELLED);
        Interview saved = interviewRepository.save(interview);

        log.info("Interview cancelled: id={}", interviewId);
        return mapToDto(saved);
    }

    public List<InterviewDto> getUserInterviews(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        return interviewRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<InterviewDto> getUserInterviewsByType(
            String email, String type) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        Interview.InterviewType interviewType;
        try {
            interviewType = Interview.InterviewType.valueOf(
                    type.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Invalid interview type: " + type);
        }

        return interviewRepository
                .findByUserIdAndType(user.getId(), interviewType)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public InterviewHistoryDto getInterviewHistory(
            Long interviewId, String email) {

        Interview interview = getInterviewForUser(interviewId, email);

        List<QuestionDto> questions = questionRepository
                .findByInterviewIdOrderByOrderIndexAsc(interviewId)
                .stream()
                .map(this::mapQuestionToDto)
                .collect(Collectors.toList());

        List<FeedbackDto> feedbacks = feedbackRepository
                .findByInterviewIdOrderByCreatedAtDesc(interviewId)
                .stream()
                .map(this::mapFeedbackToDto)
                .collect(Collectors.toList());

        return InterviewHistoryDto.builder()
                .id(interview.getId())
                .type(interview.getType().name())
                .status(interview.getStatus().name())
                .topic(interview.getTopic())
                .jobRole(interview.getJobRole())
                .experienceLevel(interview.getExperienceLevel())
                .overallScore(interview.getOverallScore())
                .durationMinutes(interview.getDurationMinutes())
                .totalQuestions(interview.getTotalQuestions())
                .answeredQuestions(interview.getAnsweredQuestions())
                .scheduledAt(interview.getScheduledAt())
                .startedAt(interview.getStartedAt())
                .completedAt(interview.getCompletedAt())
                .createdAt(interview.getCreatedAt())
                .questions(questions)
                .feedbacks(feedbacks)
                .build();
    }

    public InterviewDto getInterview(Long interviewId, String email) {
        return mapToDto(getInterviewForUser(interviewId, email));
    }

    private Interview getInterviewForUser(Long interviewId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Interview not found"));

        if (!interview.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("Access denied");
        }

        return interview;
    }

    private InterviewDto mapToDto(Interview interview) {
        return InterviewDto.builder()
                .id(interview.getId())
                .type(interview.getType().name())
                .status(interview.getStatus().name())
                .topic(interview.getTopic())
                .jobRole(interview.getJobRole())
                .experienceLevel(interview.getExperienceLevel())
                .overallScore(interview.getOverallScore())
                .durationMinutes(interview.getDurationMinutes())
                .totalQuestions(interview.getTotalQuestions())
                .answeredQuestions(interview.getAnsweredQuestions())
                .scheduledAt(interview.getScheduledAt())
                .startedAt(interview.getStartedAt())
                .completedAt(interview.getCompletedAt())
                .createdAt(interview.getCreatedAt())
                .build();
    }

    private QuestionDto mapQuestionToDto(
            com.interviewcopilot.entity.Question question) {
        return QuestionDto.builder()
                .id(question.getId())
                .interviewId(question.getInterview().getId())
                .questionText(question.getQuestionText())
                .expectedAnswer(question.getExpectedAnswer())
                .userAnswer(question.getUserAnswer())
                .type(question.getType().name())
                .difficulty(question.getDifficulty().name())
                .topic(question.getTopic())
                .score(question.getScore())
                .orderIndex(question.getOrderIndex())
                .answered(question.getAnswered())
                .timeTakenSeconds(question.getTimeTakenSeconds())
                .build();
    }

    private FeedbackDto mapFeedbackToDto(
            com.interviewcopilot.entity.Feedback feedback) {
        return FeedbackDto.builder()
                .id(feedback.getId())
                .interviewId(feedback.getInterview().getId())
                .questionId(feedback.getQuestion() != null
                        ? feedback.getQuestion().getId() : null)
                .feedbackText(feedback.getFeedbackText())
                .strengths(feedback.getStrengths())
                .weaknesses(feedback.getWeaknesses())
                .improvements(feedback.getImprovements())
                .score(feedback.getScore())
                .type(feedback.getType().name())
                .aiModel(feedback.getAiModel())
                .createdAt(feedback.getCreatedAt())
                .build();
    }
}