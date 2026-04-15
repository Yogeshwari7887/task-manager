// ===== Dashboard Page =====
pages.dashboard = {
    async render() {
        const content = document.getElementById('page-content');
        let dashData = { totalTasks: 0, completedTasks: 0, pendingTasks: 0, inProgressTasks: 0, overdueTasks: 0, completionRate: 0, totalTimeSpent: 0 };
        let recentTasks = [];
        let activity = [];

        try {
            [dashData, recentTasks, activity] = await Promise.all([
                api.get('/dashboard').catch(() => dashData),
                api.get('/tasks/my').catch(() => []),
                api.get('/dashboard/activity').catch(() => [])
            ]);
        } catch (e) {}

        const pending = recentTasks.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
        const upcoming = pending.filter(t => t.deadline).sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).slice(0, 5);

        content.innerHTML = `
            <div class="page-header">
                <h1><i class="fas fa-th-large"></i> Dashboard</h1>
                <div class="page-header-actions">
                    <button class="btn btn-primary" onclick="openTaskModal()"><i class="fas fa-plus"></i> New Task</button>
                </div>
            </div>

            <div class="stats-grid">
                <div class="stat-card animate-in">
                    <div class="stat-icon purple"><i class="fas fa-tasks"></i></div>
                    <div class="stat-value">${dashData.totalTasks || 0}</div>
                    <div class="stat-label">Total Tasks</div>
                </div>
                <div class="stat-card animate-in stagger-1">
                    <div class="stat-icon green"><i class="fas fa-check-circle"></i></div>
                    <div class="stat-value">${dashData.completedTasks || 0}</div>
                    <div class="stat-label">Completed</div>
                </div>
                <div class="stat-card animate-in stagger-2">
                    <div class="stat-icon orange"><i class="fas fa-clock"></i></div>
                    <div class="stat-value">${dashData.pendingTasks || 0}</div>
                    <div class="stat-label">Pending</div>
                </div>
                <div class="stat-card animate-in stagger-3">
                    <div class="stat-icon red"><i class="fas fa-exclamation-circle"></i></div>
                    <div class="stat-value">${dashData.overdueTasks || 0}</div>
                    <div class="stat-label">Overdue</div>
                </div>
            </div>

            <div class="grid-2">
                <div class="card animate-in">
                    <div class="card-header">
                        <span class="card-title"><i class="fas fa-chart-pie"></i> Completion Rate</span>
                    </div>
                    <div style="text-align:center;padding:20px 0;">
                        <div style="position:relative;display:inline-block;">
                            <svg width="140" height="140" viewBox="0 0 140 140">
                                <circle cx="70" cy="70" r="60" fill="none" stroke="var(--bg-tertiary)" stroke-width="12"/>
                                <circle cx="70" cy="70" r="60" fill="none" stroke="url(#grad)" stroke-width="12"
                                    stroke-dasharray="${(dashData.completionRate || 0) * 3.77} 377"
                                    stroke-linecap="round" transform="rotate(-90 70 70)"
                                    style="transition: stroke-dasharray 1s ease;"/>
                                <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" style="stop-color:#6366f1"/><stop offset="100%" style="stop-color:#a78bfa"/>
                                </linearGradient></defs>
                            </svg>
                            <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:1.5rem;font-weight:800;">${Math.round(dashData.completionRate || 0)}%</div>
                        </div>
                        <div style="margin-top:12px;font-size:0.85rem;color:var(--text-muted);">
                            ${dashData.completedTasks || 0} of ${dashData.totalTasks || 0} tasks completed
                        </div>
                    </div>
                </div>

                <div class="card animate-in stagger-1">
                    <div class="card-header">
                        <span class="card-title"><i class="fas fa-bolt"></i> Upcoming Deadlines</span>
                    </div>
                    ${upcoming.length === 0 ? '<div class="empty-state" style="padding:20px;"><p>No upcoming deadlines</p></div>' :
                    '<div class="task-list">' + upcoming.map(t => `
                        <div class="task-item" onclick="openTaskDetail(${t.id})" style="animation-delay:${upcoming.indexOf(t) * 0.05}s">
                            <div class="task-checkbox ${t.status === 'COMPLETED' ? 'completed' : ''}" onclick="event.stopPropagation();quickToggleStatus(${t.id}, '${t.status}')">
                                ${t.status === 'COMPLETED' ? '<i class="fas fa-check" style="font-size:0.7rem;"></i>' : ''}
                            </div>
                            <div class="task-content ${t.status === 'COMPLETED' ? 'done' : ''}">
                                <h4>${t.title}</h4>
                                <div class="task-meta">
                                    <span class="task-tag priority-${t.priority}">${priorityIcon(t.priority)} ${t.priority}</span>
                                    <span class="task-date"><i class="fas fa-calendar"></i> ${formatDate(t.deadline)}</span>
                                </div>
                            </div>
                        </div>
                    `).join('') + '</div>'}
                </div>
            </div>

            <div class="card animate-in stagger-2" style="margin-top:16px;">
                <div class="card-header">
                    <span class="card-title"><i class="fas fa-history"></i> Recent Activity</span>
                </div>
                ${(activity || []).length === 0 ? '<p style="color:var(--text-muted);padding:12px;">No recent activity</p>' :
                '<div style="max-height:300px;overflow-y:auto;">' + (activity || []).slice(0, 10).map(a => `
                    <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border-color);">
                        <div class="avatar-circle" style="width:28px;height:28px;font-size:0.65rem;flex-shrink:0;">${(a.user?.fullName || 'U').charAt(0)}</div>
                        <div style="flex:1;min-width:0;">
                            <div style="font-size:0.85rem;"><strong>${a.user?.fullName || 'User'}</strong> ${a.action.toLowerCase()} ${a.entityType.toLowerCase()}</div>
                            <div style="font-size:0.75rem;color:var(--text-muted);">${a.details || ''} · ${timeAgo(a.timestamp)}</div>
                        </div>
                    </div>
                `).join('') + '</div>'}
            </div>
        `;
    }
};

async function openTaskDetail(taskId) {
    try {
        const task = await api.get(`/tasks/${taskId}`);
        const comments = await api.get(`/comments/task/${taskId}`).catch(() => []);
        const timeLogs = await api.get(`/time/task/${taskId}`).catch(() => []);

        document.getElementById('task-detail-body').innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap;gap:16px;">
                <div style="flex:1;min-width:300px;">
                    <h2 style="margin-bottom:8px;">${task.title}</h2>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">
                        <span class="task-tag priority-${task.priority}">${priorityIcon(task.priority)} ${task.priority}</span>
                        <span class="task-tag status-${task.status}">${statusLabel(task.status)}</span>
                        ${task.category ? `<span class="task-tag" style="background:var(--info-bg);color:var(--info);">${task.category}</span>` : ''}
                    </div>
                    <p style="color:var(--text-secondary);margin-bottom:16px;">${task.description || 'No description'}</p>
                    
                    <div class="grid-2" style="gap:12px;margin-bottom:16px;">
                        <div><strong style="font-size:0.8rem;color:var(--text-muted);">Assignee</strong><br>${task.assigneeName || 'Unassigned'}</div>
                        <div><strong style="font-size:0.8rem;color:var(--text-muted);">Deadline</strong><br>${formatDateTime(task.deadline)}</div>
                        <div><strong style="font-size:0.8rem;color:var(--text-muted);">Project</strong><br>${task.projectName || 'None'}</div>
                        <div><strong style="font-size:0.8rem;color:var(--text-muted);">Time Spent</strong><br>${formatMinutes(task.totalTimeSpent)}</div>
                    </div>

                    <div style="display:flex;gap:8px;margin-bottom:20px;">
                        <button class="btn btn-sm btn-ghost" onclick="openTaskModal(${task.id})"><i class="fas fa-edit"></i> Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteTaskConfirm(${task.id})"><i class="fas fa-trash"></i> Delete</button>
                    </div>
                </div>
            </div>

            <div style="border-top:1px solid var(--border-color);padding-top:16px;">
                <h3 style="margin-bottom:12px;"><i class="fas fa-comments"></i> Comments (${(comments || []).length})</h3>
                <div class="comment-input" style="margin-bottom:16px;">
                    <input type="text" id="comment-input-${task.id}" placeholder="Add a comment... use @username to mention" style="flex:1;">
                    <button class="btn btn-sm btn-primary" onclick="postComment(${task.id})"><i class="fas fa-paper-plane"></i></button>
                </div>
                <div id="comments-list-${task.id}">
                    ${(comments || []).map(c => `
                        <div class="comment-item">
                            <div class="comment-avatar">${(c.user?.fullName || 'U').charAt(0)}</div>
                            <div class="comment-content">
                                <div class="comment-header">
                                    <span class="comment-author">${c.user?.fullName || c.user?.username || 'User'}</span>
                                    <span class="comment-time">${timeAgo(c.createdAt)}</span>
                                </div>
                                <div class="comment-text">${c.content}</div>
                            </div>
                        </div>
                    `).join('') || '<p style="color:var(--text-muted);font-size:0.85rem;">No comments yet</p>'}
                </div>
            </div>
        `;
        openModal('task-detail-modal');
    } catch (e) {
        showToast('Failed to load task details', 'error');
    }
}

async function postComment(taskId) {
    const input = document.getElementById(`comment-input-${taskId}`);
    if (!input.value.trim()) return;
    try {
        await api.post(`/comments/task/${taskId}`, { content: input.value });
        showToast('Comment added', 'success');
        openTaskDetail(taskId);
    } catch (e) { showToast('Failed to add comment', 'error'); }
}

async function quickToggleStatus(taskId, currentStatus) {
    const next = currentStatus === 'COMPLETED' ? 'TODO' : currentStatus === 'TODO' ? 'IN_PROGRESS' : 'COMPLETED';
    try {
        await api.patch(`/tasks/${taskId}/status`, { status: next });
        navigateTo(activePage);
    } catch (e) { showToast(e.message || 'Failed to update', 'error'); }
}

async function deleteTaskConfirm(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        try {
            await api.delete(`/tasks/${taskId}`);
            showToast('Task deleted', 'success');
            closeModal();
            navigateTo(activePage);
        } catch (e) { showToast('Failed to delete task', 'error'); }
    }
}
