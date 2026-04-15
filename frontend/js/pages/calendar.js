// ===== Calendar Page =====
pages.calendar = {
    currentDate: new Date(),

    async render() {
        const content = document.getElementById('page-content');
        const d = this.currentDate;
        const year = d.getFullYear(), month = d.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

        // Fetch tasks for this month
        const start = new Date(year, month, 1).toISOString();
        const end = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
        let tasks = [];
        try { tasks = await api.get(`/tasks/my-calendar?start=${start}&end=${end}`) || []; } catch (e) {}

        const tasksByDate = {};
        tasks.forEach(t => {
            if (t.deadline) {
                const key = new Date(t.deadline).getDate();
                if (!tasksByDate[key]) tasksByDate[key] = [];
                tasksByDate[key].push(t);
            }
        });

        const today = new Date();
        let daysHtml = '';
        const dayHeaders = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        daysHtml += dayHeaders.map(d => `<div class="calendar-day-header">${d}</div>`).join('');

        // Previous month padding
        const prevMonthDays = new Date(year, month, 0).getDate();
        for (let i = firstDay - 1; i >= 0; i--) {
            daysHtml += `<div class="calendar-day other-month"><span class="calendar-day-number">${prevMonthDays - i}</span></div>`;
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const dayTasks = tasksByDate[day] || [];
            daysHtml += `
                <div class="calendar-day ${isToday ? 'today' : ''}">
                    <span class="calendar-day-number">${day}</span>
                    ${dayTasks.slice(0, 3).map(t => `<div class="calendar-event priority-${t.priority}" onclick="openTaskDetail(${t.id})" title="${t.title}">${t.title}</div>`).join('')}
                    ${dayTasks.length > 3 ? `<div style="font-size:0.65rem;color:var(--text-muted);">+${dayTasks.length - 3} more</div>` : ''}
                </div>
            `;
        }

        // Next month padding
        const totalCells = firstDay + daysInMonth;
        const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
        for (let i = 1; i <= remaining; i++) {
            daysHtml += `<div class="calendar-day other-month"><span class="calendar-day-number">${i}</span></div>`;
        }

        content.innerHTML = `
            <div class="page-header">
                <h1><i class="fas fa-calendar-alt"></i> Calendar</h1>
                <div class="page-header-actions">
                    <button class="btn btn-primary" onclick="openTaskModal()"><i class="fas fa-plus"></i> New Task</button>
                </div>
            </div>
            <div class="calendar-container animate-in">
                <div class="calendar-header">
                    <div class="calendar-nav">
                        <button onclick="calendarNav(-1)"><i class="fas fa-chevron-left"></i></button>
                        <button onclick="calendarNav(1)"><i class="fas fa-chevron-right"></i></button>
                    </div>
                    <h2>${monthNames[month]} ${year}</h2>
                    <button class="btn btn-sm btn-ghost" onclick="calendarToday()">Today</button>
                </div>
                <div class="calendar-grid">${daysHtml}</div>
            </div>
        `;
    }
};

function calendarNav(dir) {
    const d = pages.calendar.currentDate;
    d.setMonth(d.getMonth() + dir);
    pages.calendar.render();
}

function calendarToday() {
    pages.calendar.currentDate = new Date();
    pages.calendar.render();
}
