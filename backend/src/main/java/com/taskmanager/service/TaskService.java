package com.taskmanager.service;

import com.taskmanager.dto.TaskDTO;
import com.taskmanager.dto.TaskRequest;
import com.taskmanager.dto.TagDTO;
import com.taskmanager.exception.BadRequestException;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.model.*;
import com.taskmanager.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TaskService {

    @Autowired private TaskRepository taskRepository;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private TagRepository tagRepository;
    @Autowired private TaskDependencyRepository dependencyRepository;
    @Autowired private CommentRepository commentRepository;
    @Autowired private UserService userService;
    @Autowired private ActivityLogService activityLogService;
    @Autowired private NotificationService notificationService;
    @Autowired private SimpMessagingTemplate messagingTemplate;

    @Transactional
    public TaskDTO createTask(TaskRequest request) {
        User currentUser = userService.getCurrentUser();

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority() != null ? Task.Priority.valueOf(request.getPriority()) : Task.Priority.MEDIUM)
                .status(request.getStatus() != null ? Task.Status.valueOf(request.getStatus()) : Task.Status.TODO)
                .deadline(request.getDeadline())
                .recurring(request.isRecurring())
                .recurrenceType(request.getRecurrenceType() != null ? Task.RecurrenceType.valueOf(request.getRecurrenceType()) : null)
                .recurrenceInterval(request.getRecurrenceInterval())
                .template(request.isTemplate())
                .templateName(request.getTemplateName())
                .category(request.getCategory())
                .estimatedMinutes(request.getEstimatedMinutes())
                .createdBy(currentUser)
                .build();

        // Set project
        if (request.getProjectId() != null) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
            task.setProject(project);
        }

        // Set assignee
        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee not found"));
            task.setAssignee(assignee);
        }

        // Set parent task (subtask)
        if (request.getParentTaskId() != null) {
            Task parent = taskRepository.findById(request.getParentTaskId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent task not found"));
            task.setParentTask(parent);
        }

        // Set tags
        if (request.getTagIds() != null && !request.getTagIds().isEmpty()) {
            Set<Tag> tags = new HashSet<>(tagRepository.findAllById(request.getTagIds()));
            task.setTags(tags);
        }

        // Set recurring
        if (task.isRecurring() && task.getRecurrenceType() != null) {
            task.setNextRecurrence(calculateNextRecurrence(LocalDateTime.now(), task.getRecurrenceType(), task.getRecurrenceInterval()));
        }

        // Calculate smart priority
        task.setComputedPriority(calculateSmartPriority(task));

        task = taskRepository.save(task);

        // Set dependencies
        if (request.getDependsOnTaskIds() != null) {
            for (Long depId : request.getDependsOnTaskIds()) {
                Task depTask = taskRepository.findById(depId)
                        .orElseThrow(() -> new ResourceNotFoundException("Dependency task not found: " + depId));
                TaskDependency dep = TaskDependency.builder().task(task).dependsOn(depTask).build();
                dependencyRepository.save(dep);
            }
        }

        // Notify assignee
        if (task.getAssignee() != null && !task.getAssignee().getId().equals(currentUser.getId())) {
            notificationService.createNotification(task.getAssignee(),
                    "You've been assigned task: " + task.getTitle(),
                    Notification.NotificationType.TASK_ASSIGNED, task, task.getProject());
        }

        activityLogService.log("CREATE", "TASK", task.getId(), currentUser, "Task created: " + task.getTitle());

        // WebSocket broadcast
        TaskDTO dto = mapToDTO(task);
        messagingTemplate.convertAndSend("/topic/tasks", Map.of("type", "TASK_CREATED", "data", dto));

        return dto;
    }

    @Transactional
    public TaskDTO updateTask(Long id, TaskRequest request) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        User currentUser = userService.getCurrentUser();
        String oldStatus = task.getStatus().name();

        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getPriority() != null) task.setPriority(Task.Priority.valueOf(request.getPriority()));
        if (request.getStatus() != null) {
            Task.Status newStatus = Task.Status.valueOf(request.getStatus());
            task.setStatus(newStatus);
            if (newStatus == Task.Status.COMPLETED && task.getCompletedAt() == null) {
                task.setCompletedAt(LocalDateTime.now());
            }
        }
        if (request.getDeadline() != null) task.setDeadline(request.getDeadline());
        if (request.getCategory() != null) task.setCategory(request.getCategory());
        if (request.getEstimatedMinutes() != null) task.setEstimatedMinutes(request.getEstimatedMinutes());

        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee not found"));
            if (task.getAssignee() == null || !task.getAssignee().getId().equals(assignee.getId())) {
                task.setAssignee(assignee);
                notificationService.createNotification(assignee,
                        "You've been assigned task: " + task.getTitle(),
                        Notification.NotificationType.TASK_ASSIGNED, task, task.getProject());
            }
        }

        if (request.getProjectId() != null) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
            task.setProject(project);
        }

        if (request.getTagIds() != null) {
            Set<Tag> tags = new HashSet<>(tagRepository.findAllById(request.getTagIds()));
            task.setTags(tags);
        }

        task.setComputedPriority(calculateSmartPriority(task));
        taskRepository.save(task);

        activityLogService.log("UPDATE", "TASK", task.getId(), currentUser, "Task updated",
                oldStatus, task.getStatus().name());

        TaskDTO dto = mapToDTO(task);
        messagingTemplate.convertAndSend("/topic/tasks", Map.of("type", "TASK_UPDATED", "data", dto));

        return dto;
    }

    @Transactional
    public TaskDTO updateTaskStatus(Long id, String status) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        User currentUser = userService.getCurrentUser();

        // Check dependencies
        List<TaskDependency> deps = dependencyRepository.findByTaskId(id);
        for (TaskDependency dep : deps) {
            if (dep.getDependsOn().getStatus() != Task.Status.COMPLETED) {
                throw new BadRequestException("Cannot update status. Dependent task '" + dep.getDependsOn().getTitle() + "' must be completed first.");
            }
        }

        String oldStatus = task.getStatus().name();
        task.setStatus(Task.Status.valueOf(status));
        if (task.getStatus() == Task.Status.COMPLETED) {
            task.setCompletedAt(LocalDateTime.now());
            // Handle recurring task
            if (task.isRecurring() && task.getRecurrenceType() != null) {
                createRecurringTaskInstance(task);
            }
        }

        task.setComputedPriority(calculateSmartPriority(task));
        taskRepository.save(task);

        if (task.getAssignee() != null) {
            notificationService.createNotification(task.getAssignee(),
                    "Task '" + task.getTitle() + "' status changed to " + status,
                    Notification.NotificationType.TASK_UPDATED, task, task.getProject());
        }

        activityLogService.log("STATUS_CHANGE", "TASK", task.getId(), currentUser,
                "Status changed from " + oldStatus + " to " + status, oldStatus, status);

        TaskDTO dto = mapToDTO(task);
        messagingTemplate.convertAndSend("/topic/tasks", Map.of("type", "TASK_STATUS_CHANGED", "data", dto));

        return dto;
    }

    public TaskDTO getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        return mapToDTO(task);
    }

    public List<TaskDTO> getTasksByProject(Long projectId) {
        return taskRepository.findByProjectId(projectId).stream()
                .filter(t -> t.getParentTask() == null)
                .map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<TaskDTO> getTasksByAssignee(Long userId) {
        return taskRepository.findByAssigneeId(userId).stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<TaskDTO> getMyTasks() {
        User currentUser = userService.getCurrentUser();
        return taskRepository.findByAssigneeId(currentUser.getId()).stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<TaskDTO> getKanbanTasks(Long projectId) {
        return taskRepository.findByProjectId(projectId).stream()
                .filter(t -> t.getParentTask() == null)
                .map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<TaskDTO> getTasksByDateRange(LocalDateTime start, LocalDateTime end) {
        return taskRepository.findTasksBetweenDates(start, end).stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<TaskDTO> getMyTasksByDateRange(LocalDateTime start, LocalDateTime end) {
        User currentUser = userService.getCurrentUser();
        return taskRepository.findUserTasksBetweenDates(currentUser.getId(), start, end)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<TaskDTO> getOverdueTasks() {
        return taskRepository.findOverdueTasks(LocalDateTime.now()).stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<TaskDTO> getTemplates() {
        return taskRepository.findByTemplateTrue().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional
    public TaskDTO createFromTemplate(Long templateId, TaskRequest overrides) {
        Task template = taskRepository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("Template not found"));

        TaskRequest request = new TaskRequest();
        request.setTitle(overrides.getTitle() != null ? overrides.getTitle() : template.getTitle());
        request.setDescription(template.getDescription());
        request.setPriority(template.getPriority().name());
        request.setCategory(template.getCategory());
        request.setEstimatedMinutes(template.getEstimatedMinutes());
        request.setProjectId(overrides.getProjectId());
        request.setAssigneeId(overrides.getAssigneeId());
        request.setDeadline(overrides.getDeadline());

        return createTask(request);
    }

    @Transactional
    public void deleteTask(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        activityLogService.log("DELETE", "TASK", id, userService.getCurrentUser(), "Task deleted: " + task.getTitle());
        taskRepository.delete(task);
        messagingTemplate.convertAndSend("/topic/tasks", Map.of("type", "TASK_DELETED", "data", Map.of("id", id)));
    }

    // Smart Priority Algorithm
    public Double calculateSmartPriority(Task task) {
        double score = 0;

        // Base priority score
        switch (task.getPriority()) {
            case CRITICAL: score += 40; break;
            case HIGH: score += 30; break;
            case MEDIUM: score += 20; break;
            case LOW: score += 10; break;
        }

        // Deadline proximity
        if (task.getDeadline() != null) {
            long hoursUntilDeadline = java.time.Duration.between(LocalDateTime.now(), task.getDeadline()).toHours();
            if (hoursUntilDeadline < 0) {
                score += 50; // Overdue
            } else if (hoursUntilDeadline < 24) {
                score += 40;
            } else if (hoursUntilDeadline < 72) {
                score += 30;
            } else if (hoursUntilDeadline < 168) {
                score += 20;
            } else {
                score += 10;
            }
        }

        // Pending tasks load for assignee
        if (task.getAssignee() != null) {
            long pendingCount = taskRepository.countPendingByUser(task.getAssignee().getId());
            if (pendingCount > 10) score += 15;
            else if (pendingCount > 5) score += 10;
            else score += 5;
        }

        // Dependencies (tasks that depend on this one increase priority)
        List<TaskDependency> dependents = dependencyRepository.findByDependsOnId(task.getId());
        score += dependents.size() * 5;

        return score;
    }

    public void recalculateAllPriorities() {
        List<Task> tasks = taskRepository.findAll();
        for (Task task : tasks) {
            if (task.getStatus() != Task.Status.COMPLETED && task.getStatus() != Task.Status.CANCELLED) {
                task.setComputedPriority(calculateSmartPriority(task));
                taskRepository.save(task);
            }
        }
    }

    private void createRecurringTaskInstance(Task original) {
        Task newTask = Task.builder()
                .title(original.getTitle())
                .description(original.getDescription())
                .priority(original.getPriority())
                .status(Task.Status.TODO)
                .project(original.getProject())
                .assignee(original.getAssignee())
                .createdBy(original.getCreatedBy())
                .recurring(true)
                .recurrenceType(original.getRecurrenceType())
                .recurrenceInterval(original.getRecurrenceInterval())
                .category(original.getCategory())
                .estimatedMinutes(original.getEstimatedMinutes())
                .tags(new HashSet<>(original.getTags()))
                .build();

        LocalDateTime nextDeadline = calculateNextRecurrence(original.getDeadline(), original.getRecurrenceType(), original.getRecurrenceInterval());
        newTask.setDeadline(nextDeadline);
        newTask.setNextRecurrence(calculateNextRecurrence(nextDeadline, original.getRecurrenceType(), original.getRecurrenceInterval()));
        newTask.setComputedPriority(calculateSmartPriority(newTask));

        taskRepository.save(newTask);
    }

    private LocalDateTime calculateNextRecurrence(LocalDateTime from, Task.RecurrenceType type, Integer interval) {
        if (from == null) from = LocalDateTime.now();
        int qty = interval != null ? interval : 1;
        return switch (type) {
            case DAILY -> from.plusDays(qty);
            case WEEKLY -> from.plusWeeks(qty);
            case MONTHLY -> from.plusMonths(qty);
            case YEARLY -> from.plusYears(qty);
        };
    }

    public TaskDTO mapToDTO(Task task) {
        List<TaskDTO> subtaskDTOs = task.getSubtasks() != null ?
                task.getSubtasks().stream().map(this::mapToDTO).collect(Collectors.toList()) : null;

        Set<TagDTO> tagDTOs = task.getTags() != null ?
                task.getTags().stream().map(t -> TagDTO.builder()
                        .id(t.getId()).name(t.getName()).color(t.getColor()).build())
                        .collect(Collectors.toSet()) : null;

        long comments = commentRepository.countByTaskId(task.getId());

        return TaskDTO.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .priority(task.getPriority().name())
                .status(task.getStatus().name())
                .deadline(task.getDeadline())
                .computedPriority(task.getComputedPriority())
                .projectId(task.getProject() != null ? task.getProject().getId() : null)
                .projectName(task.getProject() != null ? task.getProject().getName() : null)
                .assigneeId(task.getAssignee() != null ? task.getAssignee().getId() : null)
                .assigneeName(task.getAssignee() != null ? task.getAssignee().getFullName() : null)
                .assigneeAvatar(task.getAssignee() != null ? task.getAssignee().getAvatar() : null)
                .createdById(task.getCreatedBy() != null ? task.getCreatedBy().getId() : null)
                .createdByName(task.getCreatedBy() != null ? task.getCreatedBy().getFullName() : null)
                .parentTaskId(task.getParentTask() != null ? task.getParentTask().getId() : null)
                .subtasks(subtaskDTOs)
                .tags(tagDTOs)
                .recurring(task.isRecurring())
                .recurrenceType(task.getRecurrenceType() != null ? task.getRecurrenceType().name() : null)
                .recurrenceInterval(task.getRecurrenceInterval())
                .template(task.isTemplate())
                .templateName(task.getTemplateName())
                .attachments(task.getAttachments())
                .category(task.getCategory())
                .estimatedMinutes(task.getEstimatedMinutes())
                .totalTimeSpent(task.getTotalTimeSpent())
                .commentCount(comments)
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .completedAt(task.getCompletedAt())
                .build();
    }
}
