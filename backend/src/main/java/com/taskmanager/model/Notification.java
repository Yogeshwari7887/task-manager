package com.taskmanager.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"password", "assignedTasks", "projectMemberships", "role", "bio", "phone", "createdAt", "updatedAt", "lastLogin", "active"})
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "task_id")
    @JsonIgnoreProperties({"subtasks", "dependencies", "dependents", "tags", "comments", "timeLogs", "project", "assignee", "createdBy", "parentTask", "description", "attachments"})
    private Task task;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_id")
    @JsonIgnoreProperties({"members", "tasks", "owner", "description"})
    private Project project;

    @Builder.Default
    @Column(name = "is_read")
    private boolean read = false;

    @Builder.Default
    @Column(name = "email_sent")
    private boolean emailSent = false;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    public enum NotificationType {
        TASK_ASSIGNED,
        TASK_UPDATED,
        TASK_COMPLETED,
        DEADLINE_REMINDER,
        COMMENT_ADDED,
        MENTION,
        PROJECT_INVITATION,
        SYSTEM_ALERT,
        OVERDUE_WARNING,
        OVERLOAD_WARNING
    }
}
