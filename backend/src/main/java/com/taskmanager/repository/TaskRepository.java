package com.taskmanager.repository;

import com.taskmanager.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectId(Long projectId);
    List<Task> findByAssigneeId(Long assigneeId);
    List<Task> findByStatus(Task.Status status);
    List<Task> findByProjectIdAndStatus(Long projectId, Task.Status status);
    List<Task> findByParentTaskId(Long parentTaskId);
    List<Task> findByParentTaskIsNull();
    List<Task> findByTemplateTrue();
    List<Task> findByRecurringTrue();

    @Query("SELECT t FROM Task t WHERE t.assignee.id = :userId AND t.status != 'COMPLETED' AND t.status != 'CANCELLED'")
    List<Task> findPendingTasksByUser(@Param("userId") Long userId);

    @Query("SELECT t FROM Task t WHERE t.deadline < :now AND t.status != 'COMPLETED' AND t.status != 'CANCELLED'")
    List<Task> findOverdueTasks(@Param("now") LocalDateTime now);

    @Query("SELECT t FROM Task t WHERE t.deadline BETWEEN :start AND :end")
    List<Task> findTasksBetweenDates(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT t FROM Task t WHERE t.assignee.id = :userId AND t.deadline BETWEEN :start AND :end")
    List<Task> findUserTasksBetweenDates(@Param("userId") Long userId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignee.id = :userId AND t.status = 'COMPLETED'")
    long countCompletedByUser(@Param("userId") Long userId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignee.id = :userId AND t.status != 'COMPLETED' AND t.status != 'CANCELLED'")
    long countPendingByUser(@Param("userId") Long userId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.status = :status")
    long countByStatus(@Param("status") Task.Status status);

    @Query("SELECT t FROM Task t WHERE t.project.id = :projectId ORDER BY COALESCE(t.computedPriority, 0) DESC")
    List<Task> findByProjectIdOrderByPriority(@Param("projectId") Long projectId);

    @Query("SELECT t FROM Task t WHERE t.nextRecurrence IS NOT NULL AND t.nextRecurrence <= :now")
    List<Task> findTasksDueForRecurrence(@Param("now") LocalDateTime now);

    @Query("SELECT t FROM Task t WHERE t.assignee.id = :userId AND t.status = 'IN_PROGRESS' ORDER BY COALESCE(t.computedPriority, 0) DESC")
    List<Task> findActiveTasksByUser(@Param("userId") Long userId);
}
