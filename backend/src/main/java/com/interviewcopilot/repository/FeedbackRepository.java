// backend/src/main/java/com/interviewcopilot/repository/FeedbackRepository.java
package com.interviewcopilot.repository;

import com.interviewcopilot.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    List<Feedback> findByInterviewId(Long interviewId);

    Optional<Feedback> findByInterviewIdAndType(
            Long interviewId, Feedback.FeedbackType type);

    List<Feedback> findByInterviewIdAndQuestionId(
            Long interviewId, Long questionId);

    List<Feedback> findByInterviewIdOrderByCreatedAtDesc(Long interviewId);
}