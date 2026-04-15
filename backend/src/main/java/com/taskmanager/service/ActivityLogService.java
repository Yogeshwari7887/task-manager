package com.taskmanager.service;

import com.taskmanager.model.ActivityLog;
import com.taskmanager.model.User;
import com.taskmanager.repository.ActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActivityLogService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    public void log(String action, String entityType, Long entityId, User user, String details) {
        ActivityLog log = ActivityLog.builder()
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .user(user)
                .details(details)
                .build();
        activityLogRepository.save(log);
    }

    public void log(String action, String entityType, Long entityId, User user, String details, String oldValue, String newValue) {
        ActivityLog log = ActivityLog.builder()
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .user(user)
                .details(details)
                .oldValue(oldValue)
                .newValue(newValue)
                .build();
        activityLogRepository.save(log);
    }

    public List<ActivityLog> getEntityLogs(String entityType, Long entityId) {
        return activityLogRepository.findByEntityTypeAndEntityIdOrderByTimestampDesc(entityType, entityId);
    }

    public List<ActivityLog> getUserLogs(Long userId) {
        return activityLogRepository.findByUserIdOrderByTimestampDesc(userId);
    }

    public List<ActivityLog> getRecentLogs() {
        return activityLogRepository.findTop50ByOrderByTimestampDesc();
    }
}
