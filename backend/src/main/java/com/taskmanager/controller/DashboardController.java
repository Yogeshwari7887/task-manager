package com.taskmanager.controller;

import com.taskmanager.dto.DashboardDTO;
import com.taskmanager.model.ActivityLog;
import com.taskmanager.service.ActivityLogService;
import com.taskmanager.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private ActivityLogService activityLogService;

    @GetMapping
    public ResponseEntity<DashboardDTO> getUserDashboard() {
        return ResponseEntity.ok(dashboardService.getUserDashboard());
    }

    @GetMapping("/admin")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<DashboardDTO> getAdminDashboard() {
        return ResponseEntity.ok(dashboardService.getAdminDashboard());
    }

    @GetMapping("/activity")
    public ResponseEntity<List<ActivityLog>> getRecentActivity() {
        return ResponseEntity.ok(activityLogService.getRecentLogs());
    }

    @GetMapping("/activity/entity/{type}/{id}")
    public ResponseEntity<List<ActivityLog>> getEntityActivity(@PathVariable String type, @PathVariable Long id) {
        return ResponseEntity.ok(activityLogService.getEntityLogs(type, id));
    }
}
