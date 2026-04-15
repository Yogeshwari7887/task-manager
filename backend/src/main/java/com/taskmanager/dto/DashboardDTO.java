package com.taskmanager.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {
    private long totalTasks;
    private long completedTasks;
    private long pendingTasks;
    private long inProgressTasks;
    private long overdueTasks;
    private long totalProjects;
    private long totalUsers;
    private long totalTimeSpent;
    private double completionRate;
    private long tasksCreatedToday;
    private long tasksCompletedToday;
}
