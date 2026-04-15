// ===== Alerts Page =====
pages.alerts = {
    async render() {
        const content = document.getElementById('page-content');
        let overdue = [], tasks = [];
        try {
            [overdue, tasks] = await Promise.all([
                api.get('/tasks/overdue').catch(() => []),
                api.get('/tasks/my').catch(() => [])
            ]);
        } catch(e){}
        const pending = (tasks||[]).filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
        const overloaded = pending.length > 10;
        const deadlineRisks = pending.filter(t => {
            if (!t.deadline) return false;
            const h = (new Date(t.deadline) - new Date()) / 3600000;
            return h > 0 && h < 48;
        });

        content.innerHTML = `
            <div class="page-header"><h1><i class="fas fa-exclamation-triangle"></i> Risk & Alerts</h1></div>
            <div class="stats-grid">
                <div class="stat-card"><div class="stat-icon red"><i class="fas fa-clock"></i></div>
                    <div class="stat-value">${(overdue||[]).length}</div><div class="stat-label">Overdue Tasks</div></div>
                <div class="stat-card"><div class="stat-icon orange"><i class="fas fa-exclamation"></i></div>
                    <div class="stat-value">${deadlineRisks.length}</div><div class="stat-label">At Risk (48h)</div></div>
                <div class="stat-card"><div class="stat-icon ${overloaded?'red':'green'}"><i class="fas fa-layer-group"></i></div>
                    <div class="stat-value">${pending.length}</div><div class="stat-label">Pending Tasks</div></div>
            </div>
            ${overloaded ? '<div class="alert-card alert-warning" style="margin-bottom:16px;"><i class="fas fa-exclamation-triangle alert-card-icon"></i><div class="alert-card-content"><h4>Task Overload Warning</h4><p>You have '+pending.length+' pending tasks. Consider completing or delegating some.</p></div></div>' : ''}
            <div class="grid-2">
                <div class="card"><div class="card-header"><span class="card-title" style="color:var(--danger);"><i class="fas fa-clock"></i> Overdue Tasks</span></div>
                    ${(overdue||[]).length === 0 ? '<p style="color:var(--text-muted);">No overdue tasks 🎉</p>' :
                    '<div class="task-list">'+(overdue||[]).map(t => `
                        <div class="alert-card alert-danger" style="margin-bottom:8px;cursor:pointer;" onclick="openTaskDetail(${t.id})">
                            <i class="fas fa-exclamation-circle alert-card-icon"></i>
                            <div class="alert-card-content"><h4>${t.title}</h4><p>Due: ${formatDateTime(t.deadline)}</p></div>
                        </div>`).join('')+'</div>'}
                </div>
                <div class="card"><div class="card-header"><span class="card-title" style="color:var(--warning);"><i class="fas fa-exclamation-triangle"></i> Deadline Risks</span></div>
                    ${deadlineRisks.length === 0 ? '<p style="color:var(--text-muted);">No deadline risks</p>' :
                    '<div class="task-list">'+deadlineRisks.map(t => `
                        <div class="alert-card alert-warning" style="margin-bottom:8px;cursor:pointer;" onclick="openTaskDetail(${t.id})">
                            <i class="fas fa-clock alert-card-icon"></i>
                            <div class="alert-card-content"><h4>${t.title}</h4><p>Due: ${formatDateTime(t.deadline)}</p></div>
                        </div>`).join('')+'</div>'}
                </div>
            </div>`;
    }
};
