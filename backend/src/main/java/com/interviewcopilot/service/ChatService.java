// backend/src/main/java/com/interviewcopilot/service/ChatService.java
package com.interviewcopilot.service;

import com.interviewcopilot.document.ChatMessage;
import com.interviewcopilot.dto.ChatMessageRequest;
import com.interviewcopilot.dto.ChatMessageResponse;
import com.interviewcopilot.dto.ConversationDto;
import com.interviewcopilot.entity.Interview;
import com.interviewcopilot.entity.User;
import com.interviewcopilot.repository.ChatMessageRepository;
import com.interviewcopilot.repository.InterviewRepository;
import com.interviewcopilot.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final InterviewRepository interviewRepository;
    private final UserRepository userRepository;

    private static final List<String> TECHNICAL_QUESTIONS = Arrays.asList(
        "Tell me about yourself and your technical background.",
        "What are the main principles of Object-Oriented Programming?",
        "Explain the difference between SQL and NoSQL databases.",
        "What is REST API and what are its key principles?",
        "Explain the concept of microservices architecture.",
        "What is the difference between process and thread?",
        "Explain SOLID principles in software development.",
        "What is a design pattern? Name some common ones.",
        "How does garbage collection work in Java?",
        "What is the difference between stack and heap memory?"
    );

    private static final List<String> BEHAVIORAL_QUESTIONS = Arrays.asList(
        "Tell me about a challenging project you worked on.",
        "Describe a situation where you had to work under pressure.",
        "Give an example of when you showed leadership skills.",
        "Tell me about a time you failed and what you learned.",
        "How do you handle conflicts with team members?",
        "Describe your experience working in an Agile environment.",
        "Tell me about your greatest professional achievement.",
        "How do you prioritize multiple tasks with deadlines?",
        "Describe a time you had to learn something quickly.",
        "How do you handle feedback and criticism?"
    );

    private static final List<String> CODING_QUESTIONS = Arrays.asList(
        "Write a function to reverse a string.",
        "Implement a binary search algorithm.",
        "Find the largest element in an array.",
        "Check if a string is a palindrome.",
        "Implement a stack using arrays.",
        "Write a function to find duplicate elements.",
        "Implement merge sort algorithm.",
        "Find the second largest element in an array.",
        "Check if two strings are anagrams.",
        "Implement a queue using two stacks."
    );

    public ChatMessageResponse sendMessage(
            ChatMessageRequest request, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        Interview interview = interviewRepository
                .findById(request.getInterviewId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Interview not found"));

        if (!interview.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("Access denied");
        }

        // Save user message
        ChatMessage userMessage = ChatMessage.builder()
                .interviewId(request.getInterviewId())
                .userId(user.getId())
                .role("user")
                .content(request.getContent())
                .messageType(request.getMessageType() != null
                        ? request.getMessageType() : "answer")
                .questionIndex(request.getQuestionIndex())
                .isQuestion(false)
                .build();

        chatMessageRepository.save(userMessage);

        // Generate AI response
        String aiResponse = generateResponse(
                request.getContent(),
                interview.getType(),
                request.getQuestionIndex()
        );

        // Save AI response
        ChatMessage assistantMessage = ChatMessage.builder()
                .interviewId(request.getInterviewId())
                .userId(user.getId())
                .role("assistant")
                .content(aiResponse)
                .messageType("feedback")
                .questionIndex(request.getQuestionIndex())
                .isQuestion(false)
                .build();

        ChatMessage savedAssistant = chatMessageRepository
                .save(assistantMessage);

        log.info("Message sent for interview: {}", request.getInterviewId());
        return mapToResponse(savedAssistant);
    }

    public ChatMessageResponse getNextQuestion(
            Long interviewId, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Interview not found"));

        if (!interview.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("Access denied");
        }

        long messageCount = chatMessageRepository
                .countByInterviewIdAndRole(interviewId, "assistant");

        int questionIndex = (int) messageCount;
        String question = getQuestion(interview.getType(), questionIndex);

        ChatMessage questionMessage = ChatMessage.builder()
                .interviewId(interviewId)
                .userId(user.getId())
                .role("assistant")
                .content(question)
                .messageType("question")
                .questionIndex(questionIndex)
                .isQuestion(true)
                .topic(interview.getTopic())
                .build();

        ChatMessage saved = chatMessageRepository.save(questionMessage);

        log.info("Question {} sent for interview: {}",
                questionIndex, interviewId);
        return mapToResponse(saved);
    }

    public ConversationDto getConversation(
            Long interviewId, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Interview not found"));

        if (!interview.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("Access denied");
        }

        List<ChatMessage> messages = chatMessageRepository
                .findByInterviewIdOrderByCreatedAtAsc(interviewId);

        List<ChatMessageResponse> messageResponses = messages.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        long userMessages = messages.stream()
                .filter(m -> "user".equals(m.getRole()))
                .count();

        long assistantMessages = messages.stream()
                .filter(m -> "assistant".equals(m.getRole()))
                .count();

        return ConversationDto.builder()
                .interviewId(interviewId)
                .interviewType(interview.getType().name())
                .topic(interview.getTopic())
                .jobRole(interview.getJobRole())
                .totalMessages(messages.size())
                .userMessages((int) userMessages)
                .assistantMessages((int) assistantMessages)
                .messages(messageResponses)
                .build();
    }

    public List<ChatMessageResponse> getMessages(
            Long interviewId, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Interview not found"));

        if (!interview.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("Access denied");
        }

        return chatMessageRepository
                .findByInterviewIdOrderByCreatedAtAsc(interviewId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public void clearConversation(Long interviewId, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Interview not found"));

        if (!interview.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("Access denied");
        }

        chatMessageRepository.deleteByInterviewId(interviewId);
        log.info("Conversation cleared for interview: {}", interviewId);
    }

    private String generateResponse(
            String userAnswer,
            Interview.InterviewType type,
            Integer questionIndex) {

        if (userAnswer == null || userAnswer.trim().isEmpty()) {
            return "Please provide an answer to continue.";
        }

        int wordCount = userAnswer.trim().split("\\s+").length;

        if (wordCount < 5) {
            return "Your answer seems too brief. " +
                   "Could you elaborate more on your response? " +
                   "Try to provide specific examples and details.";
        }

        return switch (type) {
            case TECHNICAL -> generateTechnicalFeedback(
                    userAnswer, questionIndex);
            case BEHAVIORAL -> generateBehavioralFeedback(
                    userAnswer, questionIndex);
            case CODING -> generateCodingFeedback(
                    userAnswer, questionIndex);
        };
    }

    private String generateTechnicalFeedback(
            String answer, Integer questionIndex) {

        String[] feedbacks = {
            "Good explanation! Your understanding of the concept is clear. " +
            "Consider adding more real-world examples to strengthen your answer.",

            "You've covered the basics well. To improve your answer, " +
            "try to mention specific use cases or trade-offs involved.",

            "Solid answer! You demonstrated good technical knowledge. " +
            "Next time, try to structure your answer with pros and cons.",

            "Your answer shows practical experience. " +
            "Consider mentioning performance implications in your next response.",

            "Well articulated! Try to add code examples when applicable " +
            "to make your technical explanations more concrete."
        };

        int index = (questionIndex != null)
                ? questionIndex % feedbacks.length : 0;
        return feedbacks[index];
    }

    private String generateBehavioralFeedback(
            String answer, Integer questionIndex) {

        String[] feedbacks = {
            "Good use of the STAR method! Your answer clearly describes " +
            "the Situation, Task, Action, and Result. Well done!",

            "Interesting experience you shared. " +
            "Try to quantify the impact of your actions in your next answer.",

            "Your answer demonstrates strong soft skills. " +
            "Consider emphasizing the lessons learned from the experience.",

            "Good storytelling! Make sure to highlight your specific " +
            "contribution to the team's success.",

            "Excellent response! Your leadership qualities shine through. " +
            "Keep focusing on measurable outcomes."
        };

        int index = (questionIndex != null)
                ? questionIndex % feedbacks.length : 0;
        return feedbacks[index];
    }

    private String generateCodingFeedback(
            String answer, Integer questionIndex) {

        String[] feedbacks = {
            "Good approach! Consider discussing the time and space " +
            "complexity of your solution.",

            "Your logic is correct. Try to think about edge cases " +
            "like empty arrays or null inputs.",

            "Nice solution! Could you think of a more optimized approach? " +
            "What would be the Big O complexity?",

            "Good thinking! Consider using built-in data structures " +
            "to simplify your solution.",

            "Correct implementation! Try to walk through your code " +
            "with a sample input to verify its correctness."
        };

        int index = (questionIndex != null)
                ? questionIndex % feedbacks.length : 0;
        return feedbacks[index];
    }

    private String getQuestion(
            Interview.InterviewType type, int index) {

        List<String> questions = switch (type) {
            case TECHNICAL -> TECHNICAL_QUESTIONS;
            case BEHAVIORAL -> BEHAVIORAL_QUESTIONS;
            case CODING -> CODING_QUESTIONS;
        };

        if (index >= questions.size()) {
            return "Thank you for completing all the questions! " +
                   "Your interview session is now complete. " +
                   "You can review your performance in the history section.";
        }

        return "Question " + (index + 1) + ": " + questions.get(index);
    }

    private ChatMessageResponse mapToResponse(ChatMessage message) {
        return ChatMessageResponse.builder()
                .id(message.getId())
                .interviewId(message.getInterviewId())
                .userId(message.getUserId())
                .role(message.getRole())
                .content(message.getContent())
                .messageType(message.getMessageType())
                .questionIndex(message.getQuestionIndex())
                .score(message.getScore())
                .isQuestion(message.getIsQuestion())
                .topic(message.getTopic())
                .createdAt(message.getCreatedAt())
                .build();
    }
}