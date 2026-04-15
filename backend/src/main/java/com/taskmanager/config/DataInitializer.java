package com.taskmanager.config;

import com.taskmanager.model.Role;
import com.taskmanager.model.User;
import com.taskmanager.repository.RoleRepository;
import com.taskmanager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

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
    }
}
