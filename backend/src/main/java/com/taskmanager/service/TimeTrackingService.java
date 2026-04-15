package com.taskmanager.service;

import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.model.Task;
import com.taskmanager.model.TimeLog;
import com.taskmanager.model.User;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.TimeLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TimeTrackingService {

    @Autowired private TimeLogRepository timeLogRepository;
    @Autowired private TaskRepository taskRepository;
    @Autowired private UserService userService;

    @Transactional
    public TimeLog startTimer(Long taskId) {
        User currentUser = userService.getCurrentUser();
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        Optional<TimeLog> running = timeLogRepository.findByTaskIdAndUserIdAndRunningTrue(taskId, currentUser.getId());
        if (running.isPresent()) {
            return running.get();
        }

        TimeLog log = TimeLog.builder()
                .task(task)
                .user(currentUser)
                .startTime(LocalDateTime.now())
                .running(true)
                .build();

        return timeLogRepository.save(log);
    }

    @Transactional
    public TimeLog stopTimer(Long taskId) {
        User currentUser = userService.getCurrentUser();
        TimeLog log = timeLogRepository.findByTaskIdAndUserIdAndRunningTrue(taskId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("No running timer found for this task"));

        log.setEndTime(LocalDateTime.now());
        log.setRunning(false);
        log.setDuration(Duration.between(log.getStartTime(), log.getEndTime()).toMinutes());

        timeLogRepository.save(log);

        // Update task total time
        Task task = log.getTask();
        Long totalTime = timeLogRepository.getTotalTimeByTask(taskId);
        task.setTotalTimeSpent(totalTime);
        taskRepository.save(task);

        return log;
    }

    public List<TimeLog> getTaskTimeLogs(Long taskId) {
        return timeLogRepository.findByTaskId(taskId);
    }

    public List<TimeLog> getUserTimeLogs(Long userId) {
        return timeLogRepository.findByUserId(userId);
    }

    public List<TimeLog> getMyTimeLogs() {
        User currentUser = userService.getCurrentUser();
        return timeLogRepository.findByUserId(currentUser.getId());
    }

    public Long getTotalTimeForTask(Long taskId) {
        return timeLogRepository.getTotalTimeByTask(taskId);
    }

    public Long getTotalTimeForUser(Long userId) {
        return timeLogRepository.getTotalTimeByUser(userId);
    }
}
