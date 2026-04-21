// ===== API Client =====
const API_BASE = 'http://localhost:8081/api';

const api = {
    token: localStorage.getItem('token'),

    setToken(token) {
        this.token = token;
        if (token) localStorage.setItem('token', token);
        else localStorage.removeItem('token');
    },

    async request(method, endpoint, body = null) {
        const headers = { 'Content-Type': 'application/json' };
        if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
        const config = { method, headers };
        if (body) config.body = JSON.stringify(body);
        try {
            const res = await fetch(`${API_BASE}${endpoint}`, config);
            if (res.status === 401) { handleLogout(); return null; }
            if (res.status === 204) return null;
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Request failed');
            return data;
        } catch (err) {
            console.error(`API Error [${method} ${endpoint}]:`, err);
            throw err;
        }
    },

    get(endpoint) { return this.request('GET', endpoint); },
    post(endpoint, body) { return this.request('POST', endpoint, body); },
    put(endpoint, body) { return this.request('PUT', endpoint, body); },
    patch(endpoint, body) { return this.request('PATCH', endpoint, body); },
    delete(endpoint) { return this.request('DELETE', endpoint); },
};
