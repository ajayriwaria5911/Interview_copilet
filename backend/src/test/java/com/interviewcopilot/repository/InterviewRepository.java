// backend/src/main/java/com/interviewcopilot/repository/InterviewRepository.java
package com.interviewcopilot.repository;

import com.interviewcopilot.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByUserId(Long userId);
    List<Interview> findByUserIdAndType(Long userId, Interview.InterviewType type);
    List<Interview> findByUserIdOrderByCreatedAtDesc(Long userId);
}