package com.taskmanager.repository;

import com.taskmanager.model.TimeLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TimeLogRepository extends JpaRepository<TimeLog, Long> {
    List<TimeLog> findByTaskId(Long taskId);
    List<TimeLog> findByUserId(Long userId);
    List<TimeLog> findByTaskIdAndUserId(Long taskId, Long userId);
    Optional<TimeLog> findByTaskIdAndUserIdAndRunningTrue(Long taskId, Long userId);
    List<TimeLog> findByRunningTrue();

    @Query("SELECT COALESCE(SUM(tl.duration), 0) FROM TimeLog tl WHERE tl.task.id = :taskId")
    Long getTotalTimeByTask(@Param("taskId") Long taskId);

    @Query("SELECT COALESCE(SUM(tl.duration), 0) FROM TimeLog tl WHERE tl.user.id = :userId")
    Long getTotalTimeByUser(@Param("userId") Long userId);
}
