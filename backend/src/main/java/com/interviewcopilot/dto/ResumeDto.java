// backend/src/main/java/com/interviewcopilot/dto/ResumeDto.java
package com.interviewcopilot.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeDto {
    private Long id;
    private String fileName;
    private String status;
    private Double atsScore;
    private LocalDateTime uploadedAt;
    private List<String> skills;
    private Integer wordCount;
}