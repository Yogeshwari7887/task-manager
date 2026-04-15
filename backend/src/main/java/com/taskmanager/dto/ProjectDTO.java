package com.taskmanager.dto;

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
public class ProjectDTO {
    private Long id;
    private String name;
    private String description;
    private String status;
    private LocalDateTime deadline;
    private Long ownerId;
    private String ownerName;
    private List<MemberDTO> members;
    private long totalTasks;
    private long completedTasks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MemberDTO {
        private Long id;
        private Long userId;
        private String username;
        private String fullName;
        private String avatar;
        private String role;
        private LocalDateTime joinedAt;
    }
}
