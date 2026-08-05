// backend/src/main/java/com/interviewcopilot/repository/InterviewRepository.java
package com.interviewcopilot.repository;

import com.interviewcopilot.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {

    List<Interview> findByUserId(Long userId);

    List<Interview> findByUserIdAndType(
            Long userId, Interview.InterviewType type);

    List<Interview> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Interview> findByUserIdAndStatus(
            Long userId, Interview.InterviewStatus status);

    List<Interview> findByUserIdAndTypeAndStatus(
            Long userId,
            Interview.InterviewType type,
            Interview.InterviewStatus status);

    long countByUserId(Long userId);

    long countByUserIdAndStatus(
            Long userId, Interview.InterviewStatus status);

    long countByUserIdAndType(
            Long userId, Interview.InterviewType type);

    @Query("SELECT AVG(i.overallScore) FROM Interview i WHERE i.user.id = :userId AND i.overallScore IS NOT NULL")
    Double findAverageScoreByUserId(Long userId);

    List<Interview> findTop5ByUserIdOrderByCreatedAtDesc(Long userId);
}