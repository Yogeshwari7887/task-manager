// ===== Focus Mode =====
let focusInterval = null, focusSeconds = 0, focusRunning = false;

pages.focus = {
    async render() {
        const content = document.getElementById('page-content');
        let tasks = [];
        try { tasks = (await api.get('/tasks/my') || []).filter(t => t.status === 'IN_PROGRESS'); } catch (e) {}

        const activeTask = tasks[0];

        content.innerHTML = `
            <div class="focus-container animate-in">
                <h1 style="margin-bottom:8px;"><i class="fas fa-bullseye" style="color:var(--accent);"></i> Focus Mode</h1>
                <p style="color:var(--text-muted);margin-bottom:32px;">Block distractions and focus on one task at a time</p>
                
                <div class="card" style="max-width:500px;margin:0 auto;">
                    ${activeTask ? `
                        <div class="focus-task-title">${activeTask.title}</div>
                        <div style="display:flex;gap:8px;justify-content:center;margin-bottom:16px;">
                            <span class="task-tag priority-${activeTask.priority}">${activeTask.priority}</span>
                            ${activeTask.projectName ? `<span class="task-tag" style="background:var(--info-bg);color:var(--info);">${activeTask.projectName}</span>` : ''}
                        </div>
                        <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:24px;">${activeTask.description || ''}</p>
                    ` : `
                        <p style="color:var(--text-muted);margin-bottom:16px;">No active task. Select a task:</p>
                        <select id="focus-task-select" style="width:100%;margin-bottom:16px;">
                            <option value="">Choose a task...</option>
                        </select>
                    `}
                    
                    <div class="focus-timer" id="focus-timer">00:00:00</div>

                    <div class="focus-controls">
                        <button class="btn btn-success" id="focus-start-btn" onclick="toggleFocusTimer(${activeTask?.id || 0})">
                            <i class="fas fa-play"></i> Start
                        </button>
                        <button class="btn btn-ghost" onclick="resetFocusTimer()">
                            <i class="fas fa-redo"></i> Reset
                        </button>
                        ${activeTask ? `<button class="btn btn-primary" onclick="quickToggleStatus(${activeTask.id}, 'IN_PROGRESS')"><i class="fas fa-check"></i> Complete</button>` : ''}
                    </div>
                </div>

                ${activeTask ? `
                <div class="card" style="max-width:500px;margin:24px auto 0;text-align:left;">
                    <div class="card-header"><span class="card-title"><i class="fas fa-info-circle"></i> Task Details</span></div>
                    <div class="grid-2" style="gap:8px;">
                        <div><strong style="font-size:0.8rem;color:var(--text-muted);">Deadline</strong><br>${formatDateTime(activeTask.deadline)}</div>
                        <div><strong style="font-size:0.8rem;color:var(--text-muted);">Time Spent</strong><br>${formatMinutes(activeTask.totalTimeSpent)}</div>
                        <div><strong style="font-size:0.8rem;color:var(--text-muted);">Estimated</strong><br>${formatMinutes(activeTask.estimatedMinutes)}</div>
                        <div><strong style="font-size:0.8rem;color:var(--text-muted);">Assignee</strong><br>${activeTask.assigneeName || 'You'}</div>
                    </div>
                </div>
                ` : ''}
            </div>
        `;
    }
};

function toggleFocusTimer(taskId) {
    const btn = document.getElementById('focus-start-btn');
    if (focusRunning) {
        clearInterval(focusInterval);
        focusRunning = false;
        btn.innerHTML = '<i class="fas fa-play"></i> Resume';
        btn.className = 'btn btn-success';
        if (taskId) stopTrackingTimer(taskId).catch(() => {});
    } else {
        focusRunning = true;
        btn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        btn.className = 'btn btn-warning';
        if (taskId) startTrackingTimer(taskId).catch(() => {});
        focusInterval = setInterval(() => {
            focusSeconds++;
            const h = String(Math.floor(focusSeconds / 3600)).padStart(2, '0');
            const m = String(Math.floor((focusSeconds % 3600) / 60)).padStart(2, '0');
            const s = String(focusSeconds % 60).padStart(2, '0');
            const el = document.getElementById('focus-timer');
            if (el) el.textContent = `${h}:${m}:${s}`;
        }, 1000);
    }
}

function resetFocusTimer() {
    clearInterval(focusInterval);
    focusRunning = false;
    focusSeconds = 0;
    const el = document.getElementById('focus-timer');
    if (el) el.textContent = '00:00:00';
    const btn = document.getElementById('focus-start-btn');
    if (btn) { btn.innerHTML = '<i class="fas fa-play"></i> Start'; btn.className = 'btn btn-success'; }
}
