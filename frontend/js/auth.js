// ===== Auth Module =====
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

function isLoggedIn() {
    return !!api.token && !!currentUser;
}

function saveUser(userData) {
    currentUser = userData;
    localStorage.setItem('currentUser', JSON.stringify(userData));
}

function clearAuth() {
    currentUser = null;
    api.setToken(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
}

function showLogin() {
    document.getElementById('login-page').classList.remove('hidden');
    document.getElementById('register-page').classList.add('hidden');
}

function showRegister() {
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('register-page').classList.remove('hidden');
}

function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    const icon = btn.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

// Login handler
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('login-error');
    const btn = document.getElementById('login-btn');
    errorEl.classList.add('hidden');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
    btn.disabled = true;

    try {
        const data = await api.request('POST', '/auth/login', {
            username: document.getElementById('login-username').value,
            password: document.getElementById('login-password').value
        });
        api.setToken(data.token);
        saveUser(data);
        showToast('Welcome back, ' + (data.fullName || data.username) + '!', 'success');
        initApp();
    } catch (err) {
        errorEl.textContent = err.message || 'Invalid credentials';
        errorEl.classList.remove('hidden');
    } finally {
        btn.innerHTML = '<span>Sign In</span><i class="fas fa-arrow-right"></i>';
        btn.disabled = false;
    }
});

// Register handler
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('register-error');
    const btn = document.getElementById('register-btn');
    errorEl.classList.add('hidden');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
    btn.disabled = true;

    try {
        const data = await api.request('POST', '/auth/register', {
            fullName: document.getElementById('reg-fullname').value,
            username: document.getElementById('reg-username').value,
            email: document.getElementById('reg-email').value,
            password: document.getElementById('reg-password').value
        });
        api.setToken(data.token);
        saveUser(data);
        showToast('Account created! Welcome to TaskFlow Pro!', 'success');
        initApp();
    } catch (err) {
        errorEl.textContent = err.message || 'Registration failed';
        errorEl.classList.remove('hidden');
    } finally {
        btn.innerHTML = '<span>Create Account</span><i class="fas fa-rocket"></i>';
        btn.disabled = false;
    }
});

function handleLogout() {
    clearAuth();
    disconnectWebSocket();
    document.getElementById('app-container').classList.add('hidden');
    document.getElementById('auth-container').classList.remove('hidden');
    showLogin();
    showToast('You have been logged out', 'info');
}
