package com.taskmanager.service;

import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.model.Comment;
import com.taskmanager.model.Notification;
import com.taskmanager.model.Task;
import com.taskmanager.model.User;
import com.taskmanager.repository.CommentRepository;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class CommentService {

    @Autowired private CommentRepository commentRepository;
    @Autowired private TaskRepository taskRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private UserService userService;
    @Autowired private NotificationService notificationService;
    @Autowired private ActivityLogService activityLogService;
    @Autowired private SimpMessagingTemplate messagingTemplate;

    @Transactional
    public Comment addComment(Long taskId, String content, Long parentCommentId) {
        User currentUser = userService.getCurrentUser();
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        Comment comment = Comment.builder()
                .content(content)
                .task(task)
                .user(currentUser)
                .build();

        if (parentCommentId != null) {
            Comment parent = commentRepository.findById(parentCommentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Parent comment not found"));
            comment.setParentComment(parent);
        }

        // Parse @mentions
        List<String> mentions = parseMentions(content);
        if (!mentions.isEmpty()) {
            comment.setMentions(String.join(",", mentions));
            for (String username : mentions) {
                userRepository.findByUsername(username).ifPresent(user -> {
                    notificationService.createNotification(user,
                            currentUser.getFullName() + " mentioned you in a comment on '" + task.getTitle() + "'",
                            Notification.NotificationType.MENTION, task, task.getProject());
                });
            }
        }

        comment = commentRepository.save(comment);

        // Notify task assignee
        if (task.getAssignee() != null && !task.getAssignee().getId().equals(currentUser.getId())) {
            notificationService.createNotification(task.getAssignee(),
                    currentUser.getFullName() + " commented on '" + task.getTitle() + "'",
                    Notification.NotificationType.COMMENT_ADDED, task, task.getProject());
        }

        activityLogService.log("COMMENT", "TASK", taskId, currentUser, "Comment added");

        // WebSocket broadcast
        messagingTemplate.convertAndSend("/topic/tasks/" + taskId + "/comments",
                Map.of("type", "COMMENT_ADDED", "taskId", taskId));

        return comment;
    }

    public List<Comment> getTaskComments(Long taskId) {
        return commentRepository.findByTaskIdAndParentCommentIsNullOrderByCreatedAtDesc(taskId);
    }

    @Transactional
    public void deleteComment(Long commentId) {
        commentRepository.deleteById(commentId);
    }

    private List<String> parseMentions(String content) {
        List<String> mentions = new ArrayList<>();
        Pattern pattern = Pattern.compile("@(\\w+)");
        Matcher matcher = pattern.matcher(content);
        while (matcher.find()) {
            mentions.add(matcher.group(1));
        }
        return mentions;
    }
}
