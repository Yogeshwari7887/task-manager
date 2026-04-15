// ===== Projects Page =====
pages.projects = {
    async render() {
        const content = document.getElementById('page-content');
        let projects = [];
        try { projects = await api.get('/projects') || []; } catch (e) {}

        content.innerHTML = `
            <div class="page-header">
                <h1><i class="fas fa-folder-open"></i> Projects</h1>
                <div class="page-header-actions">
                    <button class="btn btn-primary" onclick="openProjectModal()"><i class="fas fa-plus"></i> New Project</button>
                </div>
            </div>
            <div class="grid-3" id="projects-grid">
                ${projects.length === 0 ? `<div class="empty-state" style="grid-column:1/-1;"><i class="fas fa-folder-open"></i><h3>No projects yet</h3><p>Create your first project</p></div>` :
                projects.map((p, i) => {
                    const progress = p.totalTasks > 0 ? Math.round((p.completedTasks / p.totalTasks) * 100) : 0;
                    const statusColors = { ACTIVE: 'var(--success)', ON_HOLD: 'var(--warning)', COMPLETED: 'var(--accent)', ARCHIVED: 'var(--text-muted)' };
                    return `
                    <div class="card animate-in" style="animation-delay:${i * 0.05}s;cursor:pointer;" onclick="viewProject(${p.id})">
                        <div class="card-header">
                            <span class="card-title" style="font-size:0.95rem;">${p.name}</span>
                            <span style="width:8px;height:8px;border-radius:50%;background:${statusColors[p.status] || 'var(--text-muted)'};"></span>
                        </div>
                        <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:12px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">
                            ${p.description || 'No description'}
                        </p>
                        <div style="margin-bottom:12px;">
                            <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--text-muted);margin-bottom:4px;">
                                <span>Progress</span><span>${progress}%</span>
                            </div>
                            <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.75rem;color:var(--text-muted);">
                            <span><i class="fas fa-tasks"></i> ${p.totalTasks || 0} tasks</span>
                            <span><i class="fas fa-users"></i> ${(p.members || []).length} members</span>
                            ${p.deadline ? `<span><i class="fas fa-calendar"></i> ${formatDate(p.deadline)}</span>` : ''}
                        </div>
                    </div>`;
                }).join('')}
            </div>
        `;
    }
};

async function viewProject(projectId) {
    try {
        const [project, tasks] = await Promise.all([
            api.get(`/projects/${projectId}`),
            api.get(`/tasks/project/${projectId}`).catch(() => [])
        ]);
        const content = document.getElementById('page-content');
        const progress = project.totalTasks > 0 ? Math.round((project.completedTasks / project.totalTasks) * 100) : 0;

        content.innerHTML = `
            <div class="page-header">
                <h1><i class="fas fa-arrow-left" style="cursor:pointer;opacity:0.5;" onclick="navigateTo('projects')"></i> ${project.name}</h1>
                <div class="page-header-actions">
                    <button class="btn btn-ghost" onclick="openProjectModal(${project.id})"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn btn-primary" onclick="openTaskModal()"><i class="fas fa-plus"></i> Add Task</button>
                </div>
            </div>
            <div class="stats-grid">
                <div class="stat-card"><div class="stat-icon purple"><i class="fas fa-tasks"></i></div><div class="stat-value">${project.totalTasks || 0}</div><div class="stat-label">Total Tasks</div></div>
                <div class="stat-card"><div class="stat-icon green"><i class="fas fa-check"></i></div><div class="stat-value">${project.completedTasks || 0}</div><div class="stat-label">Completed</div></div>
                <div class="stat-card"><div class="stat-icon orange"><i class="fas fa-percentage"></i></div><div class="stat-value">${progress}%</div><div class="stat-label">Progress</div></div>
            </div>
            <div class="grid-2">
                <div class="card">
                    <div class="card-header"><span class="card-title"><i class="fas fa-list"></i> Tasks</span></div>
                    <div class="task-list">${renderTaskList(tasks || [])}</div>
                </div>
                <div class="card">
                    <div class="card-header"><span class="card-title"><i class="fas fa-users"></i> Members (${(project.members || []).length})</span></div>
                    ${(project.members || []).map(m => `
                        <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border-color);">
                            <div class="avatar-circle" style="width:32px;height:32px;font-size:0.7rem;">${(m.fullName || m.username || 'U').charAt(0)}</div>
                            <div><div style="font-weight:600;font-size:0.85rem;">${m.fullName || m.username}</div>
                            <div style="font-size:0.75rem;color:var(--text-muted);">${m.role}</div></div>
                        </div>
                    `).join('') || '<p style="color:var(--text-muted);">No members</p>'}
                </div>
            </div>
        `;
    } catch (e) { showToast('Failed to load project', 'error'); }
}
