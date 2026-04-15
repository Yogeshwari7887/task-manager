package com.taskmanager.service;

import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.model.Habit;
import com.taskmanager.model.User;
import com.taskmanager.repository.HabitRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class HabitService {

    @Autowired private HabitRepository habitRepository;
    @Autowired private UserService userService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public Habit createHabit(Habit habit) {
        User currentUser = userService.getCurrentUser();
        habit.setUser(currentUser);
        habit.setCurrentStreak(0);
        habit.setLongestStreak(0);
        habit.setHistory("[]");
        return habitRepository.save(habit);
    }

    public List<Habit> getMyHabits() {
        User currentUser = userService.getCurrentUser();
        return habitRepository.findByUserIdAndActiveTrue(currentUser.getId());
    }

    @Transactional
    public Habit completeHabit(Long habitId) {
        Habit habit = habitRepository.findById(habitId)
                .orElseThrow(() -> new ResourceNotFoundException("Habit not found"));

        LocalDate today = LocalDate.now();

        if (today.equals(habit.getLastCompleted())) {
            return habit; // Already completed today
        }

        // Update streak
        if (habit.getLastCompleted() != null && habit.getLastCompleted().plusDays(1).equals(today)) {
            habit.setCurrentStreak(habit.getCurrentStreak() + 1);
        } else {
            habit.setCurrentStreak(1);
        }

        if (habit.getCurrentStreak() > habit.getLongestStreak()) {
            habit.setLongestStreak(habit.getCurrentStreak());
        }

        habit.setLastCompleted(today);

        // Update history
        try {
            List<String> history = objectMapper.readValue(
                    habit.getHistory() != null ? habit.getHistory() : "[]",
                    new TypeReference<List<String>>() {});
            history.add(today.toString());
            habit.setHistory(objectMapper.writeValueAsString(history));
        } catch (Exception e) {
            habit.setHistory("[\"" + today + "\"]");
        }

        return habitRepository.save(habit);
    }

    @Transactional
    public Habit updateHabit(Long id, Habit updates) {
        Habit habit = habitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Habit not found"));
        if (updates.getName() != null) habit.setName(updates.getName());
        if (updates.getDescription() != null) habit.setDescription(updates.getDescription());
        if (updates.getColor() != null) habit.setColor(updates.getColor());
        if (updates.getIcon() != null) habit.setIcon(updates.getIcon());
        return habitRepository.save(habit);
    }

    @Transactional
    public void deleteHabit(Long id) {
        Habit habit = habitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Habit not found"));
        habit.setActive(false);
        habitRepository.save(habit);
    }
}
