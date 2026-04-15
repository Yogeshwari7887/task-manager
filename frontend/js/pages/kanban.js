// ===== Kanban Board =====
pages.kanban = {
    async render() {
        const content = document.getElementById('page-content');
        let projects = [], tasks = [];
        try { projects = await api.get('/projects') || []; } catch (e) {}

        const projOptions = projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        const selectedProject = window._kanbanProject || (projects[0]?.id || '');

        if (selectedProject) {
            try { tasks = await api.get(`/tasks/kanban/${selectedProject}`) || []; } catch (e) {}
        }

        const columns = [
            { key: 'TODO', label: 'To Do', icon: 'fa-clipboard-list', color: 'var(--info)' },
            { key: 'IN_PROGRESS', label: 'In Progress', icon: 'fa-spinner', color: 'var(--warning)' },
            { key: 'COMPLETED', label: 'Completed', icon: 'fa-check-circle', color: 'var(--success)' }
        ];

        content.innerHTML = `
            <div class="page-header">
                <h1><i class="fas fa-columns"></i> Kanban Board</h1>
                <div class="page-header-actions">
                    <select id="kanban-project-select" onchange="switchKanbanProject(this.value)" style="padding:8px 12px;">
                        <option value="">Select Project</option>
                        ${projOptions}
                    </select>
                    <button class="btn btn-primary" onclick="openTaskModal()"><i class="fas fa-plus"></i> Add Task</button>
                </div>
            </div>
            <div class="kanban-board" id="kanban-board">
                ${columns.map(col => {
                    const colTasks = tasks.filter(t => t.status === col.key);
                    return `
                    <div class="kanban-column" data-status="${col.key}">
                        <div class="kanban-column-header">
                            <span class="kanban-column-title">
                                <i class="fas ${col.icon}" style="color:${col.color}"></i> ${col.label}
                            </span>
                            <span class="kanban-count">${colTasks.length}</span>
                        </div>
                        <div class="kanban-tasks" data-status="${col.key}"
                             ondragover="event.preventDefault();this.classList.add('drag-over')"
                             ondragleave="this.classList.remove('drag-over')"
                             ondrop="handleKanbanDrop(event, '${col.key}')">
                            ${colTasks.map(t => `
                                <div class="kanban-card" draggable="true"
                                     data-task-id="${t.id}"
                                     ondragstart="event.dataTransfer.setData('taskId','${t.id}');this.classList.add('dragging')"
                                     ondragend="this.classList.remove('dragging')"
                                     onclick="openTaskDetail(${t.id})">
                                    <div class="kanban-card-title">${t.title}</div>
                                    <div class="kanban-card-meta">
                                        <span class="task-tag priority-${t.priority}" style="font-size:0.65rem;">${priorityIcon(t.priority)} ${t.priority}</span>
                                        ${t.deadline ? `<span style="font-size:0.7rem;color:var(--text-muted);"><i class="fas fa-clock"></i> ${formatDate(t.deadline)}</span>` : ''}
                                        ${t.assigneeName ? `<div class="kanban-card-avatar" title="${t.assigneeName}">${t.assigneeName.charAt(0)}</div>` : ''}
                                    </div>
                                </div>
                            `).join('') || '<p style="text-align:center;color:var(--text-muted);font-size:0.8rem;padding:20px;">No tasks</p>'}
                        </div>
                    </div>`;
                }).join('')}
            </div>
        `;

        if (selectedProject) {
            document.getElementById('kanban-project-select').value = selectedProject;
        }
    }
};

function switchKanbanProject(projectId) {
    window._kanbanProject = projectId;
    pages.kanban.render();
}

async function handleKanbanDrop(event, newStatus) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
    const taskId = event.dataTransfer.getData('taskId');
    if (!taskId) return;
    try {
        await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
        showToast('Task moved to ' + statusLabel(newStatus), 'success');
        pages.kanban.render();
    } catch (e) {
        showToast(e.message || 'Failed to move task', 'error');
    }
}
