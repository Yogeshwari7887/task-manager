// ===== WebSocket Module =====
let stompClient = null;

function connectWebSocket() {
    try {
        const socket = new SockJS(API_BASE.replace('/api', '') + '/api/ws');
        stompClient = Stomp.over(socket);
        stompClient.debug = null; // disable debug logs

        stompClient.connect({}, () => {
            console.log('WebSocket connected');

            // Subscribe to task updates
            stompClient.subscribe('/topic/tasks', (message) => {
                const data = JSON.parse(message.body);
                handleTaskUpdate(data);
            });

            // Subscribe to user-specific notifications
            if (currentUser) {
                stompClient.subscribe('/user/' + currentUser.username + '/queue/notifications', (message) => {
                    const notif = JSON.parse(message.body);
                    handleNewNotification(notif);
                });
            }
        }, (error) => {
            console.warn('WebSocket connection failed, will retry...', error);
            setTimeout(connectWebSocket, 5000);
        });
    } catch (e) {
        console.warn('WebSocket not available');
    }
}

function disconnectWebSocket() {
    if (stompClient) {
        stompClient.disconnect();
        stompClient = null;
    }
}

function handleTaskUpdate(data) {
    // Refresh current page if viewing tasks/kanban
    const page = getCurrentPage();
    if (['dashboard', 'tasks', 'kanban'].includes(page)) {
        if (typeof pages[page]?.render === 'function') {
            pages[page].render();
        }
    }
}

function handleNewNotification(notif) {
    // Update badge count
    updateNotificationBadge();
    // Show toast
    showToast(notif.message, 'info');
    // Add to notification panel
    addNotificationToPanel(notif);
}

function addNotificationToPanel(notif) {
    const list = document.getElementById('notification-list');
    const empty = list.querySelector('.notification-empty');
    if (empty) empty.remove();

    const item = document.createElement('div');
    item.className = 'notification-item unread';
    item.innerHTML = `
        <div class="notif-msg">${notif.message}</div>
        <div class="notif-time">${new Date(notif.createdAt).toLocaleString()}</div>
    `;
    list.prepend(item);
}

async function updateNotificationBadge() {
    try {
        const data = await api.get('/notifications/unread-count');
        const badge = document.getElementById('notification-badge');
        if (data && data.count > 0) {
            badge.textContent = data.count > 9 ? '9+' : data.count;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    } catch (e) { }
}
