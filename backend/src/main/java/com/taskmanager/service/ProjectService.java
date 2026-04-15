package com.taskmanager.service;

import com.taskmanager.dto.ProjectDTO;
import com.taskmanager.exception.BadRequestException;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.model.Project;
import com.taskmanager.model.ProjectMember;
import com.taskmanager.model.User;
import com.taskmanager.repository.ProjectMemberRepository;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ProjectMemberRepository memberRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private ActivityLogService activityLogService;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public ProjectDTO createProject(ProjectDTO dto) {
        User currentUser = userService.getCurrentUser();

        Project project = Project.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .deadline(dto.getDeadline())
                .status(Project.ProjectStatus.ACTIVE)
                .owner(currentUser)
                .build();

        project = projectRepository.save(project);

        // Add owner as project member
        ProjectMember ownerMember = ProjectMember.builder()
                .project(project)
                .user(currentUser)
                .role(ProjectMember.MemberRole.OWNER)
                .build();
        memberRepository.save(ownerMember);

        activityLogService.log("CREATE", "PROJECT", project.getId(), currentUser, "Project created: " + project.getName());
        return mapToDTO(project);
    }

    public ProjectDTO getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
        return mapToDTO(project);
    }

    public List<ProjectDTO> getAllProjects() {
        return projectRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<ProjectDTO> getMyProjects() {
        User currentUser = userService.getCurrentUser();
        return projectRepository.findAllAccessibleByUser(currentUser.getId())
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional
    public ProjectDTO updateProject(Long id, ProjectDTO dto) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (dto.getName() != null) project.setName(dto.getName());
        if (dto.getDescription() != null) project.setDescription(dto.getDescription());
        if (dto.getDeadline() != null) project.setDeadline(dto.getDeadline());
        if (dto.getStatus() != null) {
            project.setStatus(Project.ProjectStatus.valueOf(dto.getStatus()));
        }

        projectRepository.save(project);
        activityLogService.log("UPDATE", "PROJECT", project.getId(), userService.getCurrentUser(), "Project updated");
        return mapToDTO(project);
    }

    @Transactional
    public void deleteProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        activityLogService.log("DELETE", "PROJECT", project.getId(), userService.getCurrentUser(), "Project deleted: " + project.getName());
        projectRepository.delete(project);
    }

    @Transactional
    public ProjectDTO addMember(Long projectId, Long userId, String role) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (memberRepository.existsByProjectIdAndUserId(projectId, userId)) {
            throw new BadRequestException("User is already a member of this project");
        }

        ProjectMember member = ProjectMember.builder()
                .project(project)
                .user(user)
                .role(ProjectMember.MemberRole.valueOf(role != null ? role : "MEMBER"))
                .build();
        memberRepository.save(member);

        notificationService.createNotification(user, "You've been added to project: " + project.getName(),
                com.taskmanager.model.Notification.NotificationType.PROJECT_INVITATION, null, project);
        activityLogService.log("ADD_MEMBER", "PROJECT", project.getId(), userService.getCurrentUser(),
                "Added member: " + user.getUsername());

        return mapToDTO(project);
    }

    @Transactional
    public ProjectDTO removeMember(Long projectId, Long userId) {
        memberRepository.deleteByProjectIdAndUserId(projectId, userId);
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        return mapToDTO(project);
    }

    public ProjectDTO mapToDTO(Project project) {
        List<ProjectMember> members = memberRepository.findByProjectId(project.getId());

        List<ProjectDTO.MemberDTO> memberDTOs = members.stream().map(m ->
                ProjectDTO.MemberDTO.builder()
                        .id(m.getId())
                        .userId(m.getUser().getId())
                        .username(m.getUser().getUsername())
                        .fullName(m.getUser().getFullName())
                        .avatar(m.getUser().getAvatar())
                        .role(m.getRole().name())
                        .joinedAt(m.getJoinedAt())
                        .build()
        ).collect(Collectors.toList());

        long totalTasks = projectRepository.countTasksByProject(project.getId());
        long completedTasks = projectRepository.countCompletedTasksByProject(project.getId());

        return ProjectDTO.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .status(project.getStatus().name())
                .deadline(project.getDeadline())
                .ownerId(project.getOwner().getId())
                .ownerName(project.getOwner().getFullName())
                .members(memberDTOs)
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }
}
