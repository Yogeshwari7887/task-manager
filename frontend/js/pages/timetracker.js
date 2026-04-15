// ===== Time Tracker Page =====
pages.timetracker = {
    async render() {
        const content = document.getElementById('page-content');
        let tasks = [], timeLogs = [];
        try {
            [tasks, timeLogs] = await Promise.all([
                api.get('/tasks/my').catch(() => []),
                api.get('/time/my').catch(() => [])
            ]);
        } catch (e) {}

        const activeTasks = (tasks || []).filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
        const totalMinutes = (timeLogs || []).reduce((sum, l) => sum + (l.duration || 0), 0);
        const recentLogs = (timeLogs || []).sort((a, b) => new Date(b.startTime) - new Date(a.startTime)).slice(0, 15);

        content.innerHTML = `
            <div class="page-header">
                <h1><i class="fas fa-clock"></i> Time Tracker</h1>
            </div>
            <div class="stats-grid">
                <div class="stat-card"><div class="stat-icon blue"><i class="fas fa-hourglass-half"></i></div>
                    <div class="stat-value">${formatMinutes(totalMinutes)}</div><div class="stat-label">Total Tracked</div></div>
                <div class="stat-card"><div class="stat-icon green"><i class="fas fa-tasks"></i></div>
                    <div class="stat-value">${activeTasks.length}</div><div class="stat-label">Active Tasks</div></div>
                <div class="stat-card"><div class="stat-icon purple"><i class="fas fa-list"></i></div>
                    <div class="stat-value">${(timeLogs || []).length}</div><div class="stat-label">Time Entries</div></div>
            </div>
            <div class="grid-2">
                <div class="card">
                    <div class="card-header"><span class="card-title"><i class="fas fa-play"></i> Track Time</span></div>
                    <div class="task-list">
                        ${activeTasks.length === 0 ? '<p style="color:var(--text-muted);">No active tasks</p>' :
                        activeTasks.map(t => `
                            <div class="task-item" style="cursor:default;">
                                <div class="task-content">
                                    <h4>${t.title}</h4>
                                    <div class="task-meta">
                                        <span class="task-tag priority-${t.priority}">${t.priority}</span>
                                        <span class="task-date">${formatMinutes(t.totalTimeSpent)} logged</span>
                                    </div>
                                </div>
                                <div class="task-actions">
                                    <button class="btn btn-sm btn-success" onclick="startTrackingTimer(${t.id})" title="Start">
                                        <i class="fas fa-play"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="stopTrackingTimer(${t.id})" title="Stop">
                                        <i class="fas fa-stop"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="card">
                    <div class="card-header"><span class="card-title"><i class="fas fa-history"></i> Recent Logs</span></div>
                    <div style="max-height:400px;overflow-y:auto;">
                        ${recentLogs.length === 0 ? '<p style="color:var(--text-muted);">No time logs yet</p>' :
                        `<table class="data-table">
                            <thead><tr><th>Task</th><th>Duration</th><th>Date</th></tr></thead>
                            <tbody>
                                ${recentLogs.map(l => `
                                    <tr>
                                        <td style="font-size:0.85rem;">${l.task?.title || 'Task'}</td>
                                        <td style="font-weight:600;">${formatMinutes(l.duration)}</td>
                                        <td style="font-size:0.8rem;color:var(--text-muted);">${formatDateTime(l.startTime)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>`}
                    </div>
                </div>
            </div>
        `;
    }
};

async function startTrackingTimer(taskId) {
    try { await api.post(`/time/start/${taskId}`); showToast('Timer started!', 'success'); } catch (e) { showToast(e.message || 'Failed', 'error'); }
}
async function stopTrackingTimer(taskId) {
    try { await api.post(`/time/stop/${taskId}`); showToast('Timer stopped!', 'success'); pages.timetracker.render(); } catch (e) { showToast(e.message || 'Failed', 'error'); }
}
