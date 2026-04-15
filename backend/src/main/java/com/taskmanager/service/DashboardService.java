package com.taskmanager.service;

import com.taskmanager.dto.DashboardDTO;
import com.taskmanager.model.Task;
import com.taskmanager.model.User;
import com.taskmanager.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
public class DashboardService {

    @Autowired private TaskRepository taskRepository;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private TimeLogRepository timeLogRepository;
    @Autowired private UserService userService;

    public DashboardDTO getAdminDashboard() {
        long totalTasks = taskRepository.count();
        long completedTasks = taskRepository.countByStatus(Task.Status.COMPLETED);
        long inProgressTasks = taskRepository.countByStatus(Task.Status.IN_PROGRESS);
        long pendingTasks = taskRepository.countByStatus(Task.Status.TODO);
        long overdueTasks = taskRepository.findOverdueTasks(LocalDateTime.now()).size();
        long totalProjects = projectRepository.count();
        long totalUsers = userRepository.count();

        double completionRate = totalTasks > 0 ? (double) completedTasks / totalTasks * 100 : 0;

        LocalDateTime todayStart = LocalDateTime.now().with(LocalTime.MIN);
        LocalDateTime todayEnd = LocalDateTime.now().with(LocalTime.MAX);
        long tasksCreatedToday = taskRepository.findTasksBetweenDates(todayStart, todayEnd).size();

        return DashboardDTO.builder()
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .pendingTasks(pendingTasks)
                .inProgressTasks(inProgressTasks)
                .overdueTasks(overdueTasks)
                .totalProjects(totalProjects)
                .totalUsers(totalUsers)
                .completionRate(Math.round(completionRate * 100.0) / 100.0)
                .tasksCreatedToday(tasksCreatedToday)
                .build();
    }

    public DashboardDTO getUserDashboard() {
        User currentUser = userService.getCurrentUser();
        Long userId = currentUser.getId();

        long completedTasks = taskRepository.countCompletedByUser(userId);
        long pendingTasks = taskRepository.countPendingByUser(userId);
        long totalTasks = completedTasks + pendingTasks;
        long totalTimeSpent = timeLogRepository.getTotalTimeByUser(userId);

        double completionRate = totalTasks > 0 ? (double) completedTasks / totalTasks * 100 : 0;

        return DashboardDTO.builder()
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .pendingTasks(pendingTasks)
                .totalTimeSpent(totalTimeSpent)
                .completionRate(Math.round(completionRate * 100.0) / 100.0)
                .build();
    }
}
