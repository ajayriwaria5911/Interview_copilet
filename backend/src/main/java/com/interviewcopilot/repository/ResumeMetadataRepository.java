// backend/src/main/java/com/interviewcopilot/repository/ResumeMetadataRepository.java
package com.interviewcopilot.repository;

import com.interviewcopilot.document.ResumeMetadata;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeMetadataRepository extends MongoRepository<ResumeMetadata, String> {
    Optional<ResumeMetadata> findByPostgresResumeId(Long postgresResumeId);
    List<ResumeMetadata> findByUserId(Long userId);
}