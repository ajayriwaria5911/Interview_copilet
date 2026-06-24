// backend/src/main/java/com/interviewcopilot/repository/ResumeRepository.java
package com.interviewcopilot.repository;

import com.interviewcopilot.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {
    List<Resume> findByUserId(Long userId);
    List<Resume> findByUserIdOrderByUploadedAtDesc(Long userId);
}