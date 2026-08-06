// backend/src/main/java/com/interviewcopilot/repository/InterviewSessionRepository.java
package com.interviewcopilot.repository;

import com.interviewcopilot.document.InterviewSession;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewSessionRepository
        extends MongoRepository<InterviewSession, String> {

    Optional<InterviewSession> findByPostgresInterviewId(Long interviewId);
    List<InterviewSession> findByUserId(Long userId);
    List<InterviewSession> findByUserIdOrderByCreatedAtDesc(Long userId);
}