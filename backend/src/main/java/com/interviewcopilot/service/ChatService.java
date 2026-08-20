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

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final InterviewRepository interviewRepository;
    private final UserRepository userRepository;

    // ── Dynamic questions by topic/role ──────────────────────────────

    private static final Map<String, List<String>> TOPIC_QUESTIONS = new HashMap<>();
    private static final Map<String, List<String>> BEHAVIORAL_QUESTIONS = new HashMap<>();

    static {
        // Java Spring Boot
        TOPIC_QUESTIONS.put("java spring boot", Arrays.asList(
            "Explain the difference between @Component, @Service, and @Repository in Spring.",
            "How does Spring Boot auto-configuration work?",
            "What is Dependency Injection and how does Spring implement it?",
            "Explain the Spring Bean lifecycle.",
            "What is the difference between @RestController and @Controller?",
            "How does JPA/Hibernate work with Spring Boot?",
            "Explain Spring Security and how to implement JWT authentication.",
            "What is the difference between @Transactional and manual transaction management?",
            "How do you handle exceptions in Spring Boot globally?",
            "Explain microservices architecture using Spring Cloud."
        ));

        // React Frontend
        TOPIC_QUESTIONS.put("react frontend", Arrays.asList(
            "Explain the Virtual DOM and how React uses it.",
            "What is the difference between useState and useReducer?",
            "How does useEffect work and when do you use cleanup functions?",
            "Explain React Context API and when to use it vs Redux.",
            "What are React hooks rules and why are they important?",
            "How does React handle component re-rendering optimization?",
            "Explain the difference between controlled and uncontrolled components.",
            "What is code splitting and lazy loading in React?",
            "How do you handle state management in large React applications?",
            "Explain React's reconciliation algorithm."
        ));

        // Node.js Backend
        TOPIC_QUESTIONS.put("node.js backend", Arrays.asList(
            "Explain the Node.js event loop and how it handles async operations.",
            "What is the difference between require() and import in Node.js?",
            "How does Express.js middleware work?",
            "Explain clustering in Node.js and when to use it.",
            "What are streams in Node.js and why are they useful?",
            "How do you handle errors in async/await Node.js code?",
            "Explain the difference between process.nextTick and setImmediate.",
            "How do you secure a Node.js REST API?",
            "What is PM2 and how does it help in production?",
            "Explain database connection pooling in Node.js."
        ));

        // Python Django
        TOPIC_QUESTIONS.put("python django", Arrays.asList(
            "Explain Django's MTV architecture pattern.",
            "What is the Django ORM and how does it work?",
            "How do Django migrations work?",
            "Explain Django REST Framework serializers.",
            "What is Django middleware and how do you create custom middleware?",
            "How does Django handle authentication and authorization?",
            "Explain Django signals and when to use them.",
            "What is Celery and how does it integrate with Django?",
            "How do you optimize Django database queries?",
            "Explain Django class-based views vs function-based views."
        ));

        // Data Structures
        TOPIC_QUESTIONS.put("data structures", Arrays.asList(
            "Explain the difference between an array and a linked list.",
            "What is a hash map and how does it handle collisions?",
            "Explain binary search trees and their time complexity.",
            "What is a stack and queue? Give real-world examples.",
            "Explain graph traversal algorithms: BFS and DFS.",
            "What is dynamic programming? Give an example problem.",
            "Explain the concept of Big O notation.",
            "What is a heap data structure and where is it used?",
            "Explain merge sort vs quick sort.",
            "What is a trie and when would you use it?"
        ));

        // System Design
        TOPIC_QUESTIONS.put("system design", Arrays.asList(
            "How would you design a URL shortener like bit.ly?",
            "Explain horizontal vs vertical scaling.",
            "How would you design a real-time chat application?",
            "What is a CDN and how does it improve performance?",
            "Explain the CAP theorem in distributed systems.",
            "How would you design a rate limiter?",
            "What is database sharding and when would you use it?",
            "How would you design a notification system?",
            "Explain load balancing strategies.",
            "How would you design YouTube's video upload system?"
        ));

        // DevOps
        TOPIC_QUESTIONS.put("devops", Arrays.asList(
            "Explain the difference between Docker and virtual machines.",
            "What is Kubernetes and how does it manage containers?",
            "Explain CI/CD pipelines and their importance.",
            "What is Infrastructure as Code? Give examples.",
            "How does container orchestration work?",
            "Explain blue-green deployment strategy.",
            "What is a service mesh and when would you use it?",
            "How do you monitor applications in production?",
            "Explain the difference between Docker Compose and Kubernetes.",
            "What is GitOps and how does it improve deployment?"
        ));

        // Machine Learning
        TOPIC_QUESTIONS.put("machine learning", Arrays.asList(
            "Explain the difference between supervised and unsupervised learning.",
            "What is overfitting and how do you prevent it?",
            "Explain gradient descent and its variants.",
            "What is the bias-variance tradeoff?",
            "Explain how neural networks learn through backpropagation.",
            "What is cross-validation and why is it important?",
            "Explain the difference between classification and regression.",
            "What is regularization in machine learning?",
            "Explain how decision trees and random forests work.",
            "What is transfer learning and when is it useful?"
        ));

        // Microservices
        TOPIC_QUESTIONS.put("microservices", Arrays.asList(
            "What are the key principles of microservices architecture?",
            "How do microservices communicate with each other?",
            "Explain the API Gateway pattern.",
            "What is service discovery and how does it work?",
            "How do you handle distributed transactions in microservices?",
            "What is the Circuit Breaker pattern?",
            "Explain event-driven architecture with message queues.",
            "How do you manage configuration across microservices?",
            "What is the Saga pattern for distributed transactions?",
            "How do you implement security in microservices?"
        ));

        // Database Design
        TOPIC_QUESTIONS.put("database design", Arrays.asList(
            "Explain the difference between SQL and NoSQL databases.",
            "What is database normalization? Explain 1NF, 2NF, 3NF.",
            "How do database indexes work and when should you use them?",
            "Explain ACID properties in database transactions.",
            "What is the difference between clustered and non-clustered indexes?",
            "How do you optimize slow database queries?",
            "Explain database replication strategies.",
            "What is connection pooling and why is it important?",
            "Explain the difference between optimistic and pessimistic locking.",
            "How would you design a database schema for an e-commerce application?"
        ));

        // Behavioral questions by role
        BEHAVIORAL_QUESTIONS.put("backend developer", Arrays.asList(
            "Tell me about a challenging backend system you designed.",
            "How do you handle production incidents and outages?",
            "Describe a time you improved system performance significantly.",
            "How do you approach code reviews in your team?",
            "Tell me about a time you had to refactor legacy code.",
            "How do you prioritize technical debt vs new features?",
            "Describe your approach to API design.",
            "Tell me about a time you worked with a difficult team member.",
            "How do you stay updated with new backend technologies?",
            "Describe your experience with database optimization."
        ));

        BEHAVIORAL_QUESTIONS.put("frontend developer", Arrays.asList(
            "Tell me about a complex UI component you built.",
            "How do you ensure cross-browser compatibility?",
            "Describe a time you improved application performance.",
            "How do you collaborate with designers?",
            "Tell me about a challenging CSS/layout problem you solved.",
            "How do you approach accessibility in your applications?",
            "Describe your experience with responsive design.",
            "Tell me about a time you had to meet a tight deadline.",
            "How do you handle conflicting feedback from stakeholders?",
            "Describe your testing strategy for frontend code."
        ));

        BEHAVIORAL_QUESTIONS.put("full stack developer", Arrays.asList(
            "Tell me about a full-stack feature you built end-to-end.",
            "How do you decide when to use client-side vs server-side rendering?",
            "Describe a time you had to make architectural decisions.",
            "How do you balance frontend and backend work?",
            "Tell me about your experience with API design.",
            "How do you handle database schema changes in production?",
            "Describe your approach to security in web applications.",
            "Tell me about a time you debugged a complex production issue.",
            "How do you ensure code quality across the full stack?",
            "Describe your experience with cloud deployment."
        ));

        BEHAVIORAL_QUESTIONS.put("default", Arrays.asList(
            "Tell me about yourself and your professional background.",
            "Describe your greatest professional achievement.",
            "Tell me about a challenging project you worked on.",
            "How do you handle conflicts in a team?",
            "Describe a time you failed and what you learned.",
            "How do you prioritize multiple tasks with deadlines?",
            "Tell me about a time you showed leadership.",
            "How do you handle feedback and criticism?",
            "Describe your experience working in an Agile environment.",
            "Where do you see yourself in 5 years?"
        ));

        // Coding questions
        TOPIC_QUESTIONS.put("coding", Arrays.asList(
            "Write a function to reverse a string without using built-in methods.",
            "Implement a binary search algorithm and explain its complexity.",
            "Find all pairs in an array that sum to a target value.",
            "Implement a stack that supports push, pop, and getMin in O(1).",
            "Write a function to detect if a linked list has a cycle.",
            "Implement merge sort and explain its time complexity.",
            "Find the longest substring without repeating characters.",
            "Implement a LRU Cache with get and put operations.",
            "Write a function to validate balanced parentheses.",
            "Find the kth largest element in an unsorted array."
        ));
    }

    public ChatMessageResponse sendMessage(
            ChatMessageRequest request, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        Interview interview = interviewRepository
                .findById(request.getInterviewId())
                .orElseThrow(() -> new IllegalArgumentException("Interview not found"));

        if (!interview.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("Access denied");
        }

        // Save user message
        ChatMessage userMessage = ChatMessage.builder()
                .interviewId(request.getInterviewId())
                .userId(user.getId())
                .role("user")
                .content(request.getContent())
                .messageType(request.getMessageType() != null ? request.getMessageType() : "answer")
                .questionIndex(request.getQuestionIndex())
                .isQuestion(false)
                .build();

        chatMessageRepository.save(userMessage);

        // Generate AI feedback
        String feedback = generateFeedback(
                request.getContent(),
                interview.getType(),
                interview.getJobRole(),
                request.getQuestionIndex()
        );

        ChatMessage assistantMessage = ChatMessage.builder()
                .interviewId(request.getInterviewId())
                .userId(user.getId())
                .role("assistant")
                .content(feedback)
                .messageType("feedback")
                .questionIndex(request.getQuestionIndex())
                .isQuestion(false)
                .build();

        ChatMessage saved = chatMessageRepository.save(assistantMessage);
        return mapToResponse(saved);
    }

    public ChatMessageResponse getNextQuestion(Long interviewId, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new IllegalArgumentException("Interview not found"));

        if (!interview.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("Access denied");
        }

        long messageCount = chatMessageRepository
                .countByInterviewIdAndRole(interviewId, "assistant");

        int questionIndex = (int) messageCount;

        // Always start with an introduction question
        String question;
        if (questionIndex == 0) {
            question = "Question 1: Please introduce yourself. " +
                       "Tell me about your background, experience, " +
                       "and what motivated you to apply for the " +
                       interview.getJobRole() + " position.";
        } else {
            question = getQuestion(
                    interview.getType(),
                    interview.getTopic(),
                    interview.getJobRole(),
                    questionIndex
            );
        }

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
        return mapToResponse(saved);
    }

    private String getQuestion(
            Interview.InterviewType type,
            String topic,
            String jobRole,
            int index) {

        List<String> questions;

        if (type == Interview.InterviewType.BEHAVIORAL) {
            // Get behavioral questions based on job role
            String roleKey = jobRole != null ? jobRole.toLowerCase() : "default";
            questions = BEHAVIORAL_QUESTIONS.entrySet().stream()
                    .filter(e -> roleKey.contains(e.getKey()))
                    .findFirst()
                    .map(Map.Entry::getValue)
                    .orElse(BEHAVIORAL_QUESTIONS.get("default"));
        } else if (type == Interview.InterviewType.CODING) {
            questions = TOPIC_QUESTIONS.getOrDefault("coding",
                    TOPIC_QUESTIONS.get("data structures"));
        } else {
            // Technical — match by topic
            String topicKey = topic != null ? topic.toLowerCase() : "";
            questions = TOPIC_QUESTIONS.entrySet().stream()
                    .filter(e -> topicKey.contains(e.getKey()) || e.getKey().contains(topicKey))
                    .findFirst()
                    .map(Map.Entry::getValue)
                    .orElse(getDefaultTechnicalQuestions(jobRole));
        }

        if (questions == null || questions.isEmpty()) {
            questions = getDefaultTechnicalQuestions(jobRole);
        }

        // Since index 0 is now reserved for the introduction question,
        // shift by 1 when pulling from the topic question bank so the
        // introduction doesn't consume/skip the first real question.
        int bankIndex = index - 1;

        if (bankIndex < 0) {
            bankIndex = 0;
        }

        if (bankIndex >= questions.size()) {
            return "Thank you for completing all the questions! " +
                   "Your interview session is now complete. " +
                   "You can review your performance in the history section.";
        }

        return "Question " + (index + 1) + ": " + questions.get(bankIndex);
    }

    private List<String> getDefaultTechnicalQuestions(String jobRole) {
        return Arrays.asList(
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
    }

    private String generateFeedback(
            String answer,
            Interview.InterviewType type,
            String jobRole,
            Integer questionIndex) {

        if (answer == null || answer.trim().isEmpty() ||
                answer.contains("Time's up")) {
            return "No answer was provided for this question. " +
                   "Try to manage your time better and provide at least " +
                   "a brief answer for each question.";
        }

        int wordCount = answer.trim().split("\\s+").length;

        if (wordCount < 5) {
            return "Your answer is too brief. Try to elaborate more with " +
                   "specific examples and details relevant to " +
                   (jobRole != null ? jobRole + " role." : "the question.");
        }

        return switch (type) {
            case TECHNICAL -> generateTechnicalFeedback(answer, jobRole, questionIndex);
            case BEHAVIORAL -> generateBehavioralFeedback(answer, jobRole, questionIndex);
            case CODING -> generateCodingFeedback(answer, questionIndex);
        };
    }

    private String generateTechnicalFeedback(String answer, String jobRole, Integer qi) {
        String[] feedbacks = {
            String.format("Good technical explanation! For a %s role, consider also mentioning real-world implementation examples.", jobRole != null ? jobRole : "developer"),
            "Solid answer! Try to include performance implications and trade-offs in your next response.",
            String.format("You've covered the basics well. As a %s, elaborate on how you've used this in production.", jobRole != null ? jobRole : "developer"),
            "Good understanding demonstrated. Consider mentioning edge cases and error handling approaches.",
            "Nice answer! Try to quantify your experience — mention specific projects or scale you've worked with."
        };
        return feedbacks[(qi != null ? qi : 0) % feedbacks.length];
    }

    private String generateBehavioralFeedback(String answer, String jobRole, Integer qi) {
        String[] feedbacks = {
            "Good use of the STAR method! Quantify the impact of your actions with specific metrics.",
            String.format("Strong answer for a %s position. Emphasize your specific contribution to the team.", jobRole != null ? jobRole : "developer"),
            "Good storytelling! Make sure to highlight what YOU did specifically, not just the team.",
            "Excellent response! The outcome you described shows strong problem-solving skills.",
            "Good answer! Next time, mention what you learned and how it changed your approach."
        };
        return feedbacks[(qi != null ? qi : 0) % feedbacks.length];
    }

    private String generateCodingFeedback(String answer, Integer qi) {
        String[] feedbacks = {
            "Good approach! Discuss the time and space complexity of your solution.",
            "Your logic is correct. Consider edge cases like empty inputs or null values.",
            "Nice solution! Think about whether there's a more optimized approach with better Big O.",
            "Good thinking! Walk through your solution with a sample input to verify correctness.",
            "Correct implementation! Consider using built-in data structures to simplify the code."
        };
        return feedbacks[(qi != null ? qi : 0) % feedbacks.length];
    }

    public ConversationDto getConversation(Long interviewId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new IllegalArgumentException("Interview not found"));

        if (!interview.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("Access denied");
        }

        List<ChatMessage> messages = chatMessageRepository
                .findByInterviewIdOrderByCreatedAtAsc(interviewId);

        List<ChatMessageResponse> messageResponses = messages.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        long userMessages = messages.stream().filter(m -> "user".equals(m.getRole())).count();
        long assistantMessages = messages.stream().filter(m -> "assistant".equals(m.getRole())).count();

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

    public List<ChatMessageResponse> getMessages(Long interviewId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new IllegalArgumentException("Interview not found"));

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
                .orElseThrow(() -> new IllegalArgumentException("Interview not found"));

        if (!interview.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("Access denied");
        }

        chatMessageRepository.deleteByInterviewId(interviewId);
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