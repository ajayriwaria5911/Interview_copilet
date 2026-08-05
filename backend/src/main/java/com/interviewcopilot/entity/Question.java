// backend/src/main/java/com/interviewcopilot/entity/Question.java
package com.interviewcopilot.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id", nullable = false)
    private Interview interview;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @Column(columnDefinition = "TEXT")
    private String expectedAnswer;

    @Column(columnDefinition = "TEXT")
    private String userAnswer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestionType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DifficultyLevel difficulty;

    @Column
    private String topic;

    @Column
    private Double score;

    @Column
    private Integer orderIndex;

    @Column
    private Boolean answered;

    @Column
    private Integer timeTakenSeconds;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    public enum QuestionType {
        TECHNICAL, BEHAVIORAL, CODING, SYSTEM_DESIGN, HR
    }

    public enum DifficultyLevel {
        EASY, MEDIUM, HARD
    }
}