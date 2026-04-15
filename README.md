# TaskFlow Pro — Advanced Task Management System

A production-level full-stack task management system with Spring Boot backend, MySQL database, JWT authentication, WebSocket real-time updates, and a premium modern frontend.

## 🚀 Tech Stack

### Backend
- **Java 17** + **Spring Boot 3.2.4**
- **Spring Security** + **JWT Authentication**
- **Spring Data JPA** / **Hibernate**
- **WebSocket** (STOMP + SockJS)
- **MySQL** Database
- **Spring Mail** for email notifications

### Frontend
- **HTML5** / **CSS3** / **Vanilla JavaScript**
- **Chart.js** for analytics charts
- **Font Awesome** icons
- **Inter** font from Google Fonts
- Premium dark/light mode with glassmorphism

---

## 📋 Features (17 Modules)

1. ✅ **Authentication & Authorization** — JWT login/register, RBAC (Admin/Manager/User)
2. ✅ **User Management** — CRUD users, role assignment, account status
3. ✅ **Project Management** — Create projects, assign members, track progress
4. ✅ **Task Management** — Full CRUD with priority, status, subtasks, dependencies, recurring tasks, templates, tags, attachments
5. ✅ **Kanban Board** — Drag-and-drop with real-time WebSocket updates
6. ✅ **Time Tracking** — Start/stop timer, log history, task totals
7. ✅ **Smart Priority** — Auto-priority based on deadline, load, dependencies
8. ✅ **Collaboration** — Threaded comments, @mentions, activity logs
9. ✅ **Notifications** — In-app + email + WebSocket real-time alerts
10. ✅ **Calendar & Scheduling** — Monthly view with task deadlines
11. ✅ **Analytics Dashboard** — Charts, metrics, completion rates
12. ✅ **Risk & Alerts** — Overdue detection, overload warnings
13. ✅ **Focus Mode** — Single-task view with integrated timer
14. ✅ **Habit Tracking** — Daily habits with streak tracking
15. ✅ **Admin Dashboard** — System-wide analytics and user management
16. ✅ **Security** — BCrypt passwords, JWT, input validation, RBAC
17. ✅ **14 Database Tables** — All mandatory tables implemented

---

## 🛠️ Setup Instructions

### Prerequisites
- Java 17+
- Maven 3.8+
- MySQL 8.0+
- A modern web browser

### 1. Database Setup
```sql
CREATE DATABASE task_manager_db;
```
> The app auto-creates tables via Hibernate `ddl-auto=update`.

### 2. Backend Setup
```bash
cd backend

# Update database credentials in src/main/resources/application.properties:
# spring.datasource.username=root
# spring.datasource.password=root

# Build and run
mvn clean install
mvn spring-boot:run
```
The API starts at `http://localhost:8080/api`

### 3. Frontend Setup
```bash
cd frontend

# Serve using any static file server, e.g.:
# Option 1: VS Code Live Server extension (right-click index.html)
# Option 2: Python
python -m http.server 5500

# Option 3: Node.js
npx serve -l 5500
```
Open `http://localhost:5500` in your browser.

### 4. Default Accounts
| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Administrator |
| demo | demo123 | User |

---

## 📁 Project Structure

```
task-manager/
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/taskmanager/
│       ├── TaskManagerApplication.java
│       ├── config/          (Security, WebSocket, DataInitializer)
│       ├── controller/      (10 REST Controllers)
│       ├── dto/             (9 DTOs)
│       ├── exception/       (Global error handling)
│       ├── model/           (12 JPA Entities)
│       ├── repository/      (12 Repositories)
│       ├── security/        (JWT Provider, Filter, UserDetailsService)
│       └── service/         (8 Service classes)
│
└── frontend/
    ├── index.html           (SPA shell with auth, sidebar, modals)
    ├── css/styles.css       (Premium design system, dark/light themes)
    └── js/
        ├── api.js           (REST API client)
        ├── auth.js          (Auth management)
        ├── websocket.js     (WebSocket client)
        ├── app.js           (Router, theme toggle, utilities)
        └── pages/           (10 page modules)
```

## 🎨 Design Features
- **Dark/Light Mode** toggle with smooth transitions
- **Glassmorphism** effects on auth cards
- **Micro-animations** on cards, lists, and interactions
- **Gradient accents** and premium color palette
- **Responsive** layout for all screen sizes
- **Custom scrollbars** and hover effects

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | User login |
| POST | /api/auth/register | User registration |
| GET/PUT | /api/users/me | Current user profile |
| CRUD | /api/projects/** | Project management |
| CRUD | /api/tasks/** | Task management |
| PATCH | /api/tasks/{id}/status | Update task status |
| GET | /api/tasks/kanban/{projectId} | Kanban board tasks |
| GET | /api/tasks/calendar | Calendar tasks |
| POST | /api/time/start/{taskId} | Start timer |
| POST | /api/time/stop/{taskId} | Stop timer |
| CRUD | /api/comments/** | Comments |
| GET | /api/notifications/** | Notifications |
| CRUD | /api/habits/** | Habits |
| GET | /api/dashboard/** | Analytics |
| CRUD | /api/tags/** | Tags |
