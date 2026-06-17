package com.taskmanager.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "activity_logs")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String action;

    @Column(nullable = false)
    private String entityType;

    private Long entityId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"password", "assignedTasks", "projectMemberships", "role", "bio", "phone", "createdAt", "updatedAt", "lastLogin", "active", "email"})
    private User user;

    @Column(columnDefinition = "TEXT")
    private String details;

    private String oldValue;

    private String newValue;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime timestamp;
}
