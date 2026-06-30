// backend/src/main/java/com/interviewcopilot/document/ResumeMetadata.java
package com.interviewcopilot.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "resume_metadata")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeMetadata {

    @Id
    private String id;

    private Long postgresResumeId;
    private Long userId;
    private String extractedText;
    private List<String> skills;
    private List<String> detectedSections;
    private Integer wordCount;
    private Integer pageCount;

    @CreatedDate
    private LocalDateTime createdAt;
}