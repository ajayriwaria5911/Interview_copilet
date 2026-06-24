// backend/src/main/java/com/interviewcopilot/entity/Resume.java
package com.interviewcopilot.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "resumes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String storagePath;

    @Column
    private String mongoMetadataId; // Reference to MongoDB document

    @Column
    private Double atsScore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ResumeStatus status = ResumeStatus.UPLOADED;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime uploadedAt;

    public enum ResumeStatus {
        UPLOADED, PROCESSING, ANALYZED, FAILED
    }
}