// backend/src/main/java/com/interviewcopilot/repository/ChatMessageRepository.java
package com.interviewcopilot.repository;

import com.interviewcopilot.document.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository
        extends MongoRepository<ChatMessage, String> {

    List<ChatMessage> findByInterviewIdOrderByCreatedAtAsc(Long interviewId);

    List<ChatMessage> findByInterviewIdAndRoleOrderByCreatedAtAsc(
            Long interviewId, String role);

    List<ChatMessage> findByUserIdOrderByCreatedAtDesc(Long userId);

    long countByInterviewId(Long interviewId);

    long countByInterviewIdAndRole(Long interviewId, String role);

    List<ChatMessage> findTop50ByInterviewIdOrderByCreatedAtDesc(
            Long interviewId);

    void deleteByInterviewId(Long interviewId);
}