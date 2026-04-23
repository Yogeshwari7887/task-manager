package com.taskmanager.config;

import com.taskmanager.model.Role;
import com.taskmanager.model.Project;
import com.taskmanager.model.Task;
import com.taskmanager.model.User;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.RoleRepository;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Override
    public void run(String... args) {
        // Create roles if they don't exist
        if (!roleRepository.existsByName(Role.RoleName.ROLE_USER)) {
            roleRepository.save(Role.builder().name(Role.RoleName.ROLE_USER).description("Standard User").build());
        }
        if (!roleRepository.existsByName(Role.RoleName.ROLE_MANAGER)) {
            roleRepository.save(Role.builder().name(Role.RoleName.ROLE_MANAGER).description("Project Manager").build());
        }
        if (!roleRepository.existsByName(Role.RoleName.ROLE_ADMIN)) {
            roleRepository.save(Role.builder().name(Role.RoleName.ROLE_ADMIN).description("System Administrator").build());
        }

        // Create default admin user if not exists
        if (!userRepository.existsByUsername("admin")) {
            Role adminRole = roleRepository.findByName(Role.RoleName.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("Admin role not found"));

            User admin = User.builder()
                    .username("admin")
                    .email("admin@taskmanager.com")
                    .password(passwordEncoder.encode("admin123"))
                    .fullName("System Administrator")
                    .role(adminRole)
                    .active(true)
                    .build();

            userRepository.save(admin);
        }

        // Create demo user
        if (!userRepository.existsByUsername("demo")) {
            Role userRole = roleRepository.findByName(Role.RoleName.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("User role not found"));

            User demo = User.builder()
                    .username("demo")
                    .email("demo@taskmanager.com")
                    .password(passwordEncoder.encode("demo123"))
                    .fullName("Demo User")
                    .role(userRole)
                    .active(true)
                    .build();

            userRepository.save(demo);
        }

        seedDemoTasks();
    }

    private void seedDemoTasks() {
        User demoUser = userRepository.findByUsername("demo")
                .orElseThrow(() -> new RuntimeException("Demo user not found"));

        if (!taskRepository.findByAssigneeId(demoUser.getId()).isEmpty()) {
            return;
        }

        Project sprintProject = projectRepository.save(Project.builder()
                .name("Website Revamp Sprint")
                .description("UI polish, performance cleanup, and launch prep tasks.")
                .owner(demoUser)
                .status(Project.ProjectStatus.ACTIVE)
                .deadline(LocalDateTime.now().plusDays(14))
                .build());

        Project marketingProject = projectRepository.save(Project.builder()
                .name("Marketing Campaign Q2")
                .description("Content, social, and outreach planning for quarter campaign.")
                .owner(demoUser)
                .status(Project.ProjectStatus.ACTIVE)
                .deadline(LocalDateTime.now().plusDays(30))
                .build());

        List<Task> demoTasks = List.of(
                Task.builder()
                        .title("Finalize homepage hero copy")
                        .description("Update headline, subtext, and CTA for conversion testing.")
                        .priority(Task.Priority.HIGH)
                        .status(Task.Status.TODO)
                        .deadline(LocalDateTime.now().plusDays(2))
                        .project(sprintProject)
                        .assignee(demoUser)
                        .createdBy(demoUser)
                        .category("Content")
                        .estimatedMinutes(90)
                        .build(),
                Task.builder()
                        .title("Create onboarding illustrations")
                        .description("Design 3 lightweight SVG illustrations for signup flow.")
                        .priority(Task.Priority.MEDIUM)
                        .status(Task.Status.IN_PROGRESS)
                        .deadline(LocalDateTime.now().plusDays(4))
                        .project(sprintProject)
                        .assignee(demoUser)
                        .createdBy(demoUser)
                        .category("Design")
                        .estimatedMinutes(180)
                        .build(),
                Task.builder()
                        .title("Optimize dashboard API calls")
                        .description("Reduce duplicate requests and improve first load timing.")
                        .priority(Task.Priority.CRITICAL)
                        .status(Task.Status.TODO)
                        .deadline(LocalDateTime.now().plusDays(1))
                        .project(sprintProject)
                        .assignee(demoUser)
                        .createdBy(demoUser)
                        .category("Backend")
                        .estimatedMinutes(120)
                        .build(),
                Task.builder()
                        .title("Setup campaign landing page")
                        .description("Publish first version with signup form and analytics events.")
                        .priority(Task.Priority.HIGH)
                        .status(Task.Status.IN_PROGRESS)
                        .deadline(LocalDateTime.now().plusDays(5))
                        .project(marketingProject)
                        .assignee(demoUser)
                        .createdBy(demoUser)
                        .category("Marketing")
                        .estimatedMinutes(150)
                        .build(),
                Task.builder()
                        .title("Publish social media content calendar")
                        .description("Schedule post plan for next 2 weeks across channels.")
                        .priority(Task.Priority.MEDIUM)
                        .status(Task.Status.COMPLETED)
                        .deadline(LocalDateTime.now().minusDays(1))
                        .project(marketingProject)
                        .assignee(demoUser)
                        .createdBy(demoUser)
                        .category("Social")
                        .estimatedMinutes(60)
                        .completedAt(LocalDateTime.now().minusHours(8))
                        .build(),
                Task.builder()
                        .title("Draft weekly newsletter #12")
                        .description("Prepare intro, feature highlights, and call-to-action blocks.")
                        .priority(Task.Priority.LOW)
                        .status(Task.Status.TODO)
                        .deadline(LocalDateTime.now().plusDays(3))
                        .project(marketingProject)
                        .assignee(demoUser)
                        .createdBy(demoUser)
                        .category("Email")
                        .estimatedMinutes(75)
                        .build()
        );

        taskRepository.saveAll(demoTasks);
    }
}
