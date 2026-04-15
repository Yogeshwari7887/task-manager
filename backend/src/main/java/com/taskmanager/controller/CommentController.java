package com.taskmanager.controller;

import com.taskmanager.model.Comment;
import com.taskmanager.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @PostMapping("/task/{taskId}")
    public ResponseEntity<Comment> addComment(@PathVariable Long taskId, @RequestBody Map<String, Object> body) {
        String content = body.get("content").toString();
        Long parentId = body.containsKey("parentCommentId") && body.get("parentCommentId") != null
                ? Long.valueOf(body.get("parentCommentId").toString()) : null;
        return ResponseEntity.ok(commentService.addComment(taskId, content, parentId));
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<Comment>> getComments(@PathVariable Long taskId) {
        return ResponseEntity.ok(commentService.getTaskComments(taskId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        commentService.deleteComment(id);
        return ResponseEntity.noContent().build();
    }
}
