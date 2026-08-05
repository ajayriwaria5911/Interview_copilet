// backend/src/main/java/com/interviewcopilot/entity/Interview.java
package com.interviewcopilot.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "interviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InterviewType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private InterviewStatus status = InterviewStatus.SCHEDULED;

    @Column
    private String topic;

    @Column
    private String jobRole;

    @Column
    private String experienceLevel;

    @Column
    private String mongoSessionId;

    @Column
    private Double overallScore;

    @Column
    private Integer durationMinutes;

    @Column
    private Integer totalQuestions;

    @Column
    private Integer answeredQuestions;

    @OneToMany(mappedBy = "interview",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY)
    private List<Question> questions;

    @OneToMany(mappedBy = "interview",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY)
    private List<Feedback> feedbacks;

    @Column
    private LocalDateTime scheduledAt;

    @Column
    private LocalDateTime startedAt;

    @Column
    private LocalDateTime completedAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum InterviewType {
        TECHNICAL, BEHAVIORAL, CODING
    }

    public enum InterviewStatus {
        SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
    }
}