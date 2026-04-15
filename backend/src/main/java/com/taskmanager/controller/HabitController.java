package com.taskmanager.controller;

import com.taskmanager.model.Habit;
import com.taskmanager.service.HabitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/habits")
public class HabitController {

    @Autowired
    private HabitService habitService;

    @PostMapping
    public ResponseEntity<Habit> createHabit(@RequestBody Habit habit) {
        return ResponseEntity.ok(habitService.createHabit(habit));
    }

    @GetMapping
    public ResponseEntity<List<Habit>> getMyHabits() {
        return ResponseEntity.ok(habitService.getMyHabits());
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<Habit> completeHabit(@PathVariable Long id) {
        return ResponseEntity.ok(habitService.completeHabit(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Habit> updateHabit(@PathVariable Long id, @RequestBody Habit habit) {
        return ResponseEntity.ok(habitService.updateHabit(id, habit));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHabit(@PathVariable Long id) {
        habitService.deleteHabit(id);
        return ResponseEntity.noContent().build();
    }
}
