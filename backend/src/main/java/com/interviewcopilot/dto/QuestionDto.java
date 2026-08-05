// backend/src/main/java/com/interviewcopilot/dto/QuestionDto.java
package com.interviewcopilot.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionDto {

    private Long id;
    private Long interviewId;
    private String questionText;
    private String expectedAnswer;
    private String userAnswer;
    private String type;
    private String difficulty;
    private String topic;
    private Double score;
    private Integer orderIndex;
    private Boolean answered;
    private Integer timeTakenSeconds;
}