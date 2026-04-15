package com.taskmanager.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class TaskRequest {
    @NotBlank
    private String title;
    private String description;
    private String priority;
    private String status;
    private LocalDateTime deadline;
    private Long projectId;
    private Long assigneeId;
    private Long parentTaskId;
    private List<Long> tagIds;
    private boolean recurring;
    private String recurrenceType;
    private Integer recurrenceInterval;
    private boolean template;
    private String templateName;
    private String category;
    private Integer estimatedMinutes;
    private List<Long> dependsOnTaskIds;
}
