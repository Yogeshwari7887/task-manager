package com.taskmanager.controller;

import com.taskmanager.model.TimeLog;
import com.taskmanager.service.TimeTrackingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/time")
public class TimeTrackingController {

    @Autowired
    private TimeTrackingService timeTrackingService;

    @PostMapping("/start/{taskId}")
    public ResponseEntity<TimeLog> startTimer(@PathVariable Long taskId) {
        return ResponseEntity.ok(timeTrackingService.startTimer(taskId));
    }

    @PostMapping("/stop/{taskId}")
    public ResponseEntity<TimeLog> stopTimer(@PathVariable Long taskId) {
        return ResponseEntity.ok(timeTrackingService.stopTimer(taskId));
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<TimeLog>> getTaskLogs(@PathVariable Long taskId) {
        return ResponseEntity.ok(timeTrackingService.getTaskTimeLogs(taskId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<TimeLog>> getMyLogs() {
        return ResponseEntity.ok(timeTrackingService.getMyTimeLogs());
    }

    @GetMapping("/task/{taskId}/total")
    public ResponseEntity<Map<String, Long>> getTaskTotal(@PathVariable Long taskId) {
        return ResponseEntity.ok(Map.of("totalMinutes", timeTrackingService.getTotalTimeForTask(taskId)));
    }
}
