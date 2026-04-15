// ===== Admin Pages =====
pages['admin-users'] = {
    async render() {
        const content = document.getElementById('page-content');
        let users = [];
        try { users = await api.get('/users') || []; } catch(e){}
        content.innerHTML = `
            <div class="page-header"><h1><i class="fas fa-users-cog"></i> User Management</h1></div>
            <div class="card">
                <table class="data-table">
                    <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
                    <tbody>
                        ${users.map(u => `<tr>
                            <td><div style="display:flex;align-items:center;gap:8px;">
                                <div class="avatar-circle" style="width:30px;height:30px;font-size:0.65rem;">${(u.fullName||u.username||'U').charAt(0)}</div>
                                <div><div style="font-weight:600;font-size:0.85rem;">${u.fullName||u.username}</div>
                                <div style="font-size:0.75rem;color:var(--text-muted);">@${u.username}</div></div>
                            </div></td>
                            <td style="font-size:0.85rem;">${u.email}</td>
                            <td><select onchange="changeUserRole(${u.id},this.value)" style="padding:4px 8px;font-size:0.8rem;">
                                <option value="ROLE_USER" ${u.role==='ROLE_USER'?'selected':''}>User</option>
                                <option value="ROLE_MANAGER" ${u.role==='ROLE_MANAGER'?'selected':''}>Manager</option>
                                <option value="ROLE_ADMIN" ${u.role==='ROLE_ADMIN'?'selected':''}>Admin</option>
                            </select></td>
                            <td><span class="status-dot ${u.active?'active':'inactive'}"></span>${u.active?'Active':'Inactive'}</td>
                            <td style="font-size:0.8rem;color:var(--text-muted);">${formatDate(u.createdAt)}</td>
                            <td><button class="btn btn-sm btn-ghost" onclick="toggleUserStatusAdmin(${u.id})">${u.active?'Deactivate':'Activate'}</button></td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>`;
    }
};

pages['admin-dashboard'] = {
    async render() {
        const content = document.getElementById('page-content');
        let dash = {}, activity = [];
        try {
            [dash, activity] = await Promise.all([
                api.get('/dashboard/admin').catch(() => ({})),
                api.get('/dashboard/activity').catch(() => [])
            ]);
        } catch(e){}
        content.innerHTML = `
            <div class="page-header"><h1><i class="fas fa-tachometer-alt"></i> Admin Dashboard</h1></div>
            <div class="stats-grid">
                <div class="stat-card"><div class="stat-icon purple"><i class="fas fa-tasks"></i></div>
                    <div class="stat-value">${dash.totalTasks||0}</div><div class="stat-label">Total Tasks</div></div>
                <div class="stat-card"><div class="stat-icon green"><i class="fas fa-check"></i></div>
                    <div class="stat-value">${dash.completedTasks||0}</div><div class="stat-label">Completed</div></div>
                <div class="stat-card"><div class="stat-icon blue"><i class="fas fa-folder"></i></div>
                    <div class="stat-value">${dash.totalProjects||0}</div><div class="stat-label">Projects</div></div>
                <div class="stat-card"><div class="stat-icon orange"><i class="fas fa-users"></i></div>
                    <div class="stat-value">${dash.totalUsers||0}</div><div class="stat-label">Users</div></div>
            </div>
            <div class="card">
                <div class="card-header"><span class="card-title"><i class="fas fa-history"></i> System Activity</span></div>
                <div style="max-height:400px;overflow-y:auto;">
                    ${(activity||[]).slice(0,20).map(a => `
                        <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border-color);">
                            <div class="avatar-circle" style="width:28px;height:28px;font-size:0.6rem;">${(a.user?.fullName||'U').charAt(0)}</div>
                            <div style="flex:1;"><div style="font-size:0.85rem;"><strong>${a.user?.fullName||'User'}</strong> ${a.action} ${a.entityType}</div>
                            <div style="font-size:0.75rem;color:var(--text-muted);">${a.details||''} · ${timeAgo(a.timestamp)}</div></div>
                        </div>`).join('')||'<p style="color:var(--text-muted);">No activity</p>'}
                </div>
            </div>`;
    }
};

// Profile page
pages.profile = {
    async render() {
        const content = document.getElementById('page-content');
        let user = currentUser;
        try { user = await api.get('/users/me'); } catch(e){}
        const initials = (user.fullName||user.username||'U').split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
        content.innerHTML = `
            <div class="page-header"><h1><i class="fas fa-user-circle"></i> Profile</h1></div>
            <div class="profile-header animate-in">
                <div class="profile-avatar">${initials}</div>
                <div><h2>${user.fullName||user.username}</h2>
                <p style="color:var(--text-muted);">@${user.username} · ${formatRole(user.role)}</p>
                <p style="color:var(--text-muted);font-size:0.85rem;">${user.email}</p></div>
            </div>
            <div class="card"><div class="card-header"><span class="card-title">Edit Profile</span></div>
                <div class="form-row">
                    <div class="form-group"><label>Full Name</label><input type="text" id="profile-name" value="${user.fullName||''}"></div>
                    <div class="form-group"><label>Phone</label><input type="text" id="profile-phone" value="${user.phone||''}"></div>
                </div>
                <div class="form-group" style="margin-top:12px;"><label>Bio</label><textarea id="profile-bio" rows="3">${user.bio||''}</textarea></div>
                <button class="btn btn-primary" style="margin-top:12px;" onclick="updateProfile()"><i class="fas fa-save"></i> Save</button>
            </div>`;
    }
};

async function updateProfile() {
    try {
        await api.put('/users/me', { fullName: document.getElementById('profile-name').value, phone: document.getElementById('profile-phone').value, bio: document.getElementById('profile-bio').value });
        showToast('Profile updated!', 'success');
    } catch(e) { showToast('Failed to update', 'error'); }
}

async function changeUserRole(userId, role) {
    try { await api.put(`/users/${userId}/role`, { role }); showToast('Role updated', 'success'); } catch(e) { showToast('Failed', 'error'); }
}

async function toggleUserStatusAdmin(userId) {
    try { await api.put(`/users/${userId}/toggle-status`); showToast('Status updated', 'success'); pages['admin-users'].render(); } catch(e) { showToast('Failed', 'error'); }
}
