package com.taskmanager.service;

import com.taskmanager.dto.NotificationDTO;
import com.taskmanager.model.Notification;
import com.taskmanager.model.Project;
import com.taskmanager.model.Task;
import com.taskmanager.model.User;
import com.taskmanager.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public Notification createNotification(User user, String message, Notification.NotificationType type, Task task, Project project) {
        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .type(type)
                .task(task)
                .project(project)
                .read(false)
                .emailSent(false)
                .build();

        notification = notificationRepository.save(notification);

        // Send real-time notification via WebSocket (use HashMap to allow null values safely)
        try {
            Map<String, Object> wsPayload = new HashMap<>();
            wsPayload.put("id", notification.getId());
            wsPayload.put("message", message);
            wsPayload.put("type", type.name());
            wsPayload.put("taskId", task != null ? task.getId() : null);
            wsPayload.put("createdAt", notification.getCreatedAt() != null ? notification.getCreatedAt().toString() : null);
            messagingTemplate.convertAndSendToUser(user.getUsername(), "/queue/notifications", wsPayload);
        } catch (Exception e) {
            // Don't let WebSocket failures break notification creation
            System.err.println("WebSocket notification failed: " + e.getMessage());
        }

        return notification;
    }

    public List<NotificationDTO> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<NotificationDTO> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    private NotificationDTO mapToDTO(Notification n) {
        return NotificationDTO.builder()
                .id(n.getId())
                .message(n.getMessage())
                .type(n.getType() != null ? n.getType().name() : null)
                .taskId(n.getTask() != null ? n.getTask().getId() : null)
                .taskTitle(n.getTask() != null ? n.getTask().getTitle() : null)
                .projectId(n.getProject() != null ? n.getProject().getId() : null)
                .projectName(n.getProject() != null ? n.getProject().getName() : null)
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
