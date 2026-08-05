// backend/src/main/java/com/interviewcopilot/repository/QuestionRepository.java
package com.interviewcopilot.repository;

import com.interviewcopilot.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findByInterviewId(Long interviewId);

    List<Question> findByInterviewIdOrderByOrderIndexAsc(Long interviewId);

    List<Question> findByInterviewIdAndType(
            Long interviewId, Question.QuestionType type);

    List<Question> findByInterviewIdAndDifficulty(
            Long interviewId, Question.DifficultyLevel difficulty);

    long countByInterviewId(Long interviewId);

    long countByInterviewIdAndAnsweredTrue(Long interviewId);
}