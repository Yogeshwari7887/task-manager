// ===== Main App Module =====
let activePage = 'dashboard';
const pages = {};

// App initialization
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden');
        if (isLoggedIn()) {
            initApp();
        } else {
            document.getElementById('auth-container').classList.remove('hidden');
        }
    }, 800);
});

function initApp() {
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');

    // Set user info in topbar
    if (currentUser) {
        document.getElementById('topbar-username').textContent = currentUser.fullName || currentUser.username;
        document.getElementById('topbar-role').textContent = formatRole(currentUser.role);
        const initials = (currentUser.fullName || currentUser.username).split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        document.getElementById('user-avatar-circle').innerHTML = initials;

        // Show admin nav if admin
        if (currentUser.role === 'ROLE_ADMIN') {
            document.getElementById('admin-nav').style.display = 'block';
        }
    }

    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.getElementById('theme-label').textContent = savedTheme === 'dark' ? 'Dark Mode' : 'Light Mode';

    // Connect WebSocket
    connectWebSocket();

    // Load notifications
    updateNotificationBadge();
    loadNotifications();

    // Navigate to dashboard
    navigateTo('dashboard');
}

function getCurrentPage() { return activePage; }

function navigateTo(page) {
    activePage = page;
    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('mobile-open');

    // Render page
    const content = document.getElementById('page-content');
    content.innerHTML = '<div style="text-align:center;padding:60px;"><i class="fas fa-spinner fa-spin" style="font-size:2rem;color:var(--accent);"></i></div>';

    if (pages[page] && typeof pages[page].render === 'function') {
        setTimeout(() => pages[page].render(), 50);
    } else {
        content.innerHTML = `<div class="empty-state"><i class="fas fa-tools"></i><h3>Coming Soon</h3><p>${page} page is under construction</p></div>`;
    }
}

// Theme toggle
function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    document.getElementById('theme-label').textContent = next === 'dark' ? 'Dark Mode' : 'Light Mode';

    // Re-render charts if on analytics
    if (activePage === 'analytics' && pages.analytics) pages.analytics.render();
}

// Sidebar toggle
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth <= 768) {
        sidebar.classList.toggle('mobile-open');
    } else {
        sidebar.classList.toggle('collapsed');
    }
}

// User menu
function toggleUserMenu() {
    document.getElementById('user-dropdown').classList.toggle('hidden');
}
document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-menu')) {
        document.getElementById('user-dropdown').classList.add('hidden');
    }
});

// Notification panel
function toggleNotificationPanel() {
    document.getElementById('notification-panel').classList.toggle('hidden');
}
document.addEventListener('click', (e) => {
    if (!e.target.closest('.notification-btn') && !e.target.closest('.notification-panel')) {
        document.getElementById('notification-panel').classList.add('hidden');
    }
});

async function loadNotifications() {
    try {
        const notifs = await api.get('/notifications');
        const list = document.getElementById('notification-list');
        if (!notifs || notifs.length === 0) {
            list.innerHTML = '<div class="notification-empty"><i class="fas fa-bell-slash"></i><p>No notifications</p></div>';
            return;
        }
        list.innerHTML = notifs.slice(0, 20).map(n => `
            <div class="notification-item ${n.read ? '' : 'unread'}" onclick="markNotifRead(${n.id})">
                <div class="notif-msg">${n.message}</div>
                <div class="notif-time">${timeAgo(n.createdAt)}</div>
            </div>
        `).join('');
    } catch (e) { }
}

async function markNotifRead(id) {
    try { await api.put(`/notifications/${id}/read`); updateNotificationBadge(); } catch (e) { }
}

async function markAllNotificationsRead() {
    try { await api.put('/notifications/read-all'); updateNotificationBadge(); loadNotifications(); } catch (e) { }
}

// Modals
function openModal(modalId) {
    document.getElementById('modal-overlay').classList.remove('hidden');
    document.getElementById(modalId).classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
    document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
}

// Toast notifications
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const icons = { success: 'check-circle', error: 'exclamation-circle', info: 'info-circle', warning: 'exclamation-triangle' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas fa-${icons[type]}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(50px)'; setTimeout(() => toast.remove(), 300); }, 3500);
}

// ===== Task Modal =====
async function openTaskModal(taskId = null) {
    document.getElementById('task-edit-id').value = taskId || '';
    document.getElementById('task-modal-title').innerHTML = taskId
        ? '<i class="fas fa-edit"></i> Edit Task'
        : '<i class="fas fa-plus-circle"></i> New Task';

    // Load project and user dropdowns
    try {
        const [projects, users] = await Promise.all([api.get('/projects'), api.get('/users')]);
        const projSelect = document.getElementById('task-project');
        projSelect.innerHTML = '<option value="">No Project</option>' +
            (projects || []).map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        const userSelect = document.getElementById('task-assignee');
        userSelect.innerHTML = '<option value="">Unassigned</option>' +
            (users || []).map(u => `<option value="${u.id}">${u.fullName || u.username}</option>`).join('');
    } catch (e) { }

    // If editing, populate fields
    if (taskId) {
        try {
            const task = await api.get(`/tasks/${taskId}`);
            document.getElementById('task-title').value = task.title || '';
            document.getElementById('task-description').value = task.description || '';
            document.getElementById('task-priority').value = task.priority || 'MEDIUM';
            document.getElementById('task-status').value = task.status || 'TODO';
            document.getElementById('task-deadline').value = task.deadline ? task.deadline.slice(0, 16) : '';
            document.getElementById('task-project').value = task.projectId || '';
            document.getElementById('task-assignee').value = task.assigneeId || '';
            document.getElementById('task-category').value = task.category || '';
            document.getElementById('task-estimated').value = task.estimatedMinutes || '';
        } catch (e) { }
    } else {
        document.getElementById('task-form').reset();
    }

    openModal('task-modal');
}

async function saveTask() {
    const editId = document.getElementById('task-edit-id').value;
    const body = {
        title: document.getElementById('task-title').value,
        description: document.getElementById('task-description').value,
        priority: document.getElementById('task-priority').value,
        status: document.getElementById('task-status').value,
        deadline: document.getElementById('task-deadline').value ? document.getElementById('task-deadline').value + ':00' : null,
        projectId: document.getElementById('task-project').value || null,
        assigneeId: document.getElementById('task-assignee').value || null,
        category: document.getElementById('task-category').value || null,
        estimatedMinutes: document.getElementById('task-estimated').value ? parseInt(document.getElementById('task-estimated').value) : null,
        recurring: document.getElementById('task-recurring').checked,
        recurrenceType: document.getElementById('task-recurring').checked ? document.getElementById('task-recurrence-type').value : null,
    };

    try {
        if (editId) {
            await api.put(`/tasks/${editId}`, body);
            showToast('Task updated!', 'success');
        } else {
            await api.post('/tasks', body);
            showToast('Task created!', 'success');
        }
        closeModal();
        navigateTo(activePage);
    } catch (err) {
        showToast(err.message || 'Failed to save task', 'error');
    }
}

// Recurring toggle
document.getElementById('task-recurring')?.addEventListener('change', (e) => {
    document.getElementById('recurrence-options').style.display = e.target.checked ? 'block' : 'none';
});

// Project Modal
function openProjectModal(projectId = null) {
    document.getElementById('project-edit-id').value = projectId || '';
    document.getElementById('project-modal-title').innerHTML = projectId
        ? '<i class="fas fa-edit"></i> Edit Project'
        : '<i class="fas fa-folder-plus"></i> New Project';
    if (!projectId) document.getElementById('project-form').reset();
    openModal('project-modal');
}

async function saveProject() {
    const editId = document.getElementById('project-edit-id').value;
    const body = {
        name: document.getElementById('project-name').value,
        description: document.getElementById('project-description').value,
        deadline: document.getElementById('project-deadline').value ? document.getElementById('project-deadline').value + ':00' : null,
    };
    try {
        if (editId) {
            await api.put(`/projects/${editId}`, body);
            showToast('Project updated!', 'success');
        } else {
            await api.post('/projects', body);
            showToast('Project created!', 'success');
        }
        closeModal();
        navigateTo('projects');
    } catch (err) {
        showToast(err.message || 'Failed to save project', 'error');
    }
}

// Utility functions
function formatRole(role) {
    const map = { 'ROLE_ADMIN': 'Administrator', 'ROLE_MANAGER': 'Manager', 'ROLE_USER': 'User' };
    return map[role] || role;
}

function timeAgo(dateStr) {
    if (!dateStr) return '';
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
    return date.toLocaleDateString();
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatMinutes(minutes) {
    if (!minutes) return '0m';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function priorityIcon(p) {
    const map = { LOW: '🟢', MEDIUM: '🟡', HIGH: '🟠', CRITICAL: '🔴' };
    return map[p] || '⚪';
}

function statusLabel(s) {
    const map = { TODO: 'To Do', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed', BLOCKED: 'Blocked', CANCELLED: 'Cancelled' };
    return map[s] || s;
}
