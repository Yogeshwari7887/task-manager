// ===== Analytics Page =====
pages.analytics = {
    async render() {
        const content = document.getElementById('page-content');
        let dash = {}, tasks = [];
        try {
            [dash, tasks] = await Promise.all([
                api.get('/dashboard').catch(() => ({})),
                api.get('/tasks/my').catch(() => [])
            ]);
        } catch (e) {}

        const statusCounts = { TODO: 0, IN_PROGRESS: 0, COMPLETED: 0, BLOCKED: 0 };
        const priorityCounts = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
        (tasks || []).forEach(t => {
            if (statusCounts[t.status] !== undefined) statusCounts[t.status]++;
            if (priorityCounts[t.priority] !== undefined) priorityCounts[t.priority]++;
        });

        content.innerHTML = `
            <div class="page-header"><h1><i class="fas fa-chart-bar"></i> Analytics</h1></div>
            <div class="stats-grid">
                <div class="stat-card"><div class="stat-icon purple"><i class="fas fa-tasks"></i></div>
                    <div class="stat-value">${dash.totalTasks || 0}</div><div class="stat-label">Total Tasks</div></div>
                <div class="stat-card"><div class="stat-icon green"><i class="fas fa-check-circle"></i></div>
                    <div class="stat-value">${dash.completedTasks || 0}</div><div class="stat-label">Completed</div></div>
                <div class="stat-card"><div class="stat-icon orange"><i class="fas fa-percentage"></i></div>
                    <div class="stat-value">${Math.round(dash.completionRate || 0)}%</div><div class="stat-label">Completion Rate</div></div>
                <div class="stat-card"><div class="stat-icon blue"><i class="fas fa-clock"></i></div>
                    <div class="stat-value">${formatMinutes(dash.totalTimeSpent || 0)}</div><div class="stat-label">Time Tracked</div></div>
            </div>
            <div class="charts-grid">
                <div class="card"><div class="card-header"><span class="card-title"><i class="fas fa-chart-pie"></i> Tasks by Status</span></div>
                    <div class="chart-container"><canvas id="status-chart"></canvas></div></div>
                <div class="card"><div class="card-header"><span class="card-title"><i class="fas fa-chart-bar"></i> Tasks by Priority</span></div>
                    <div class="chart-container"><canvas id="priority-chart"></canvas></div></div>
            </div>
        `;

        setTimeout(() => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const gridColor = isDark ? '#2a2a40' : '#e0e0e6';
            Chart.defaults.color = isDark ? '#a0a0b8' : '#555770';

            new Chart(document.getElementById('status-chart'), {
                type: 'doughnut',
                data: {
                    labels: ['To Do', 'In Progress', 'Completed', 'Blocked'],
                    datasets: [{ data: [statusCounts.TODO, statusCounts.IN_PROGRESS, statusCounts.COMPLETED, statusCounts.BLOCKED],
                        backgroundColor: ['#3b82f6', '#f59e0b', '#10b981', '#ef4444'],
                        borderWidth: 0, borderRadius: 4 }]
                },
                options: { responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true } } } }
            });

            new Chart(document.getElementById('priority-chart'), {
                type: 'bar',
                data: {
                    labels: ['Low', 'Medium', 'High', 'Critical'],
                    datasets: [{ label: 'Tasks', data: [priorityCounts.LOW, priorityCounts.MEDIUM, priorityCounts.HIGH, priorityCounts.CRITICAL],
                        backgroundColor: ['#10b981', '#f59e0b', '#ff6b35', '#ef4444'],
                        borderRadius: 8, borderSkipped: false }]
                },
                options: { responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: gridColor } },
                             x: { grid: { display: false } } } }
            });
        }, 100);
    }
};
