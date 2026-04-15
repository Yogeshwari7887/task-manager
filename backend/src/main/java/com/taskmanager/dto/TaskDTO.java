package com.taskmanager.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskDTO {
    private Long id;
    private String title;
    private String description;
    private String priority;
    private String status;
    private LocalDateTime deadline;
    private Double computedPriority;
    private Long projectId;
    private String projectName;
    private Long assigneeId;
    private String assigneeName;
    private String assigneeAvatar;
    private Long createdById;
    private String createdByName;
    private Long parentTaskId;
    private List<TaskDTO> subtasks;
    private Set<TagDTO> tags;
    private boolean recurring;
    private String recurrenceType;
    private Integer recurrenceInterval;
    private boolean template;
    private String templateName;
    private String attachments;
    private String category;
    private Integer estimatedMinutes;
    private Long totalTimeSpent;
    private long commentCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;
}
