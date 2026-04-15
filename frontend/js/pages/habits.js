// ===== Habits Page =====
pages.habits = {
    async render() {
        const content = document.getElementById('page-content');
        let habits = [];
        try { habits = await api.get('/habits') || []; } catch (e) {}

        const today = new Date().toISOString().split('T')[0];

        content.innerHTML = `
            <div class="page-header">
                <h1><i class="fas fa-fire"></i> Habit Tracker</h1>
                <div class="page-header-actions">
                    <button class="btn btn-primary" onclick="showCreateHabit()"><i class="fas fa-plus"></i> New Habit</button>
                </div>
            </div>
            <div id="create-habit-form" class="card hidden" style="margin-bottom:16px;">
                <div class="form-row">
                    <div class="form-group"><label>Habit Name</label><input type="text" id="habit-name" placeholder="e.g. Morning meditation"></div>
                    <div class="form-group"><label>Description</label><input type="text" id="habit-desc" placeholder="Optional description"></div>
                </div>
                <div style="display:flex;gap:8px;margin-top:8px;">
                    <button class="btn btn-primary btn-sm" onclick="createHabit()"><i class="fas fa-save"></i> Save</button>
                    <button class="btn btn-ghost btn-sm" onclick="document.getElementById('create-habit-form').classList.add('hidden')">Cancel</button>
                </div>
            </div>
            <div class="grid-2" id="habits-grid">
                ${habits.length === 0 ? `<div class="empty-state" style="grid-column:1/-1;"><i class="fas fa-fire"></i><h3>No habits yet</h3><p>Start tracking daily habits to build consistency</p></div>` :
                habits.map((h, i) => {
                    const completedToday = h.lastCompleted === today;
                    return `
                    <div class="habit-card animate-in" style="animation-delay:${i * 0.05}s;">
                        <div class="habit-check ${completedToday ? 'done' : ''}" onclick="completeHabitAction(${h.id})">
                            ${completedToday ? '<i class="fas fa-check"></i>' : '<i class="far fa-circle"></i>'}
                        </div>
                        <div class="habit-info">
                            <div class="habit-name">${h.name}</div>
                            <div style="display:flex;align-items:center;gap:12px;margin-top:4px;">
                                <span class="streak-badge"><i class="fas fa-fire"></i> ${h.currentStreak} day streak</span>
                                <span style="font-size:0.75rem;color:var(--text-muted);">Best: ${h.longestStreak}</span>
                            </div>
                        </div>
                        <button class="btn btn-icon btn-ghost" onclick="deleteHabitAction(${h.id})" style="flex-shrink:0;" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>`;
                }).join('')}
            </div>
        `;
    }
};

function showCreateHabit() { document.getElementById('create-habit-form').classList.remove('hidden'); }

async function createHabit() {
    const name = document.getElementById('habit-name').value;
    if (!name.trim()) return showToast('Name is required', 'warning');
    try {
        await api.post('/habits', { name, description: document.getElementById('habit-desc').value });
        showToast('Habit created!', 'success');
        pages.habits.render();
    } catch (e) { showToast('Failed to create habit', 'error'); }
}

async function completeHabitAction(id) {
    try { await api.post(`/habits/${id}/complete`); showToast('Habit completed! 🔥', 'success'); pages.habits.render(); }
    catch (e) { showToast('Failed', 'error'); }
}

async function deleteHabitAction(id) {
    if (confirm('Delete this habit?')) {
        try { await api.delete(`/habits/${id}`); showToast('Habit removed', 'info'); pages.habits.render(); }
        catch (e) { showToast('Failed', 'error'); }
    }
}
