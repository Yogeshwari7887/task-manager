// ===== Tasks Page =====
pages.tasks = {
    async render() {
        const content = document.getElementById('page-content');
        let tasks = [];
        try { tasks = await api.get('/tasks/my') || []; } catch (e) {}

        const filterHtml = `
            <div class="filter-bar">
                <div class="filter-chip active" onclick="filterTasks('all', this)">All</div>
                <div class="filter-chip" onclick="filterTasks('TODO', this)">To Do</div>
                <div class="filter-chip" onclick="filterTasks('IN_PROGRESS', this)">In Progress</div>
                <div class="filter-chip" onclick="filterTasks('COMPLETED', this)">Completed</div>
                <select onchange="sortTasks(this.value)" style="margin-left:auto;">
                    <option value="priority">Sort by Priority</option>
                    <option value="deadline">Sort by Deadline</option>
                    <option value="created">Sort by Created</option>
                    <option value="status">Sort by Status</option>
                </select>
            </div>
        `;

        content.innerHTML = `
            <div class="page-header">
                <h1><i class="fas fa-check-square"></i> My Tasks</h1>
                <div class="page-header-actions">
                    <button class="btn btn-primary" onclick="openTaskModal()">
                        <i class="fas fa-plus"></i> New Task
                    </button>
                </div>
            </div>
            ${filterHtml}
            <div class="task-list" id="tasks-list">
                ${renderTaskList(tasks)}
            </div>
        `;

        // Store tasks for filtering
        window._allTasks = tasks;
    }
};

function renderTaskList(tasks) {
    if (!tasks || tasks.length === 0) {
        return `<div class="empty-state">
            <i class="fas fa-clipboard-check"></i>
            <h3>No tasks yet</h3>
            <p>Create your first task to get started</p>
            <button class="btn btn-primary" onclick="openTaskModal()"><i class="fas fa-plus"></i> Create Task</button>
        </div>`;
    }

    return tasks.map((t, i) => `
        <div class="task-item" data-status="${t.status}" onclick="openTaskDetail(${t.id})" style="animation-delay:${i * 0.03}s">
            <div class="task-checkbox ${t.status === 'COMPLETED' ? 'completed' : ''}"
                 onclick="event.stopPropagation();quickToggleStatus(${t.id}, '${t.status}')">
                ${t.status === 'COMPLETED' ? '<i class="fas fa-check" style="font-size:0.7rem;"></i>' : ''}
            </div>
            <div class="task-content ${t.status === 'COMPLETED' ? 'done' : ''}">
                <h4>${t.title}</h4>
                <div class="task-meta">
                    <span class="task-tag priority-${t.priority}">${priorityIcon(t.priority)} ${t.priority}</span>
                    <span class="task-tag status-${t.status}">${statusLabel(t.status)}</span>
                    ${t.projectName ? `<span class="task-tag" style="background:var(--info-bg);color:var(--info);"><i class="fas fa-folder"></i> ${t.projectName}</span>` : ''}
                    ${t.deadline ? `<span class="task-date"><i class="fas fa-calendar"></i> ${formatDate(t.deadline)}</span>` : ''}
                    ${t.commentCount > 0 ? `<span class="task-date"><i class="fas fa-comment"></i> ${t.commentCount}</span>` : ''}
                </div>
            </div>
            <div class="task-actions">
                <button onclick="event.stopPropagation();openTaskModal(${t.id})" title="Edit"><i class="fas fa-edit"></i></button>
                <button onclick="event.stopPropagation();deleteTaskConfirm(${t.id})" title="Delete"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function filterTasks(status, chip) {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');

    const tasks = window._allTasks || [];
    const filtered = status === 'all' ? tasks : tasks.filter(t => t.status === status);
    document.getElementById('tasks-list').innerHTML = renderTaskList(filtered);
}

function sortTasks(by) {
    const tasks = [...(window._allTasks || [])];
    const sorters = {
        priority: (a, b) => { const o = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }; return (o[b.priority] || 0) - (o[a.priority] || 0); },
        deadline: (a, b) => (a.deadline || '9') > (b.deadline || '9') ? 1 : -1,
        created: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        status: (a, b) => { const o = { TODO: 1, IN_PROGRESS: 2, COMPLETED: 3 }; return (o[a.status] || 0) - (o[b.status] || 0); }
    };
    tasks.sort(sorters[by] || sorters.priority);
    window._allTasks = tasks;
    document.getElementById('tasks-list').innerHTML = renderTaskList(tasks);
}
