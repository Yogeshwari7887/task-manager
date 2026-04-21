# TaskFlow Pro — Advanced Task Management System

A production-level full-stack task management system built with **Spring Boot 3.2.4**, **MariaDB** (XAMPP), **JWT authentication**, **WebSocket** real-time updates, and a premium modern frontend.

---

## 🖥️ System Requirements

| Software                  | Required Version        | Verified With              |
|---------------------------|------------------------|----------------------------|
| **Java JDK**              | 17                     | Java 17                   |
| **Apache Maven**          | 3.8+                   | Maven 3.9.14             |
| **XAMPP Control Panel**   | 3.x                    | XAMPP v3.2.2              |
| **MariaDB** (via XAMPP)   | 10.1+                  | MariaDB 10.1.30          |
| **Web Browser**           | Any modern browser     | Chrome / Edge / Firefox   |

---

## 🚀 Quick Start Guide (Step-by-Step)

### Step 1: Start XAMPP & Create the Database

1. Open **XAMPP Control Panel** (run as Administrator if needed).
2. Click **Start** next to **Apache** (needed for phpMyAdmin).
3. Click **Start** next to **MySQL**.
4. Wait until both show green "Running" status.

   ![XAMPP Running](https://img.shields.io/badge/Apache-Running-green) ![MySQL Running](https://img.shields.io/badge/MySQL-Running-green)

5. Open your browser and go to: **http://localhost/phpmyadmin**
6. Click the **"SQL"** tab at the top.
7. Paste and execute this SQL command:

```sql
CREATE DATABASE IF NOT EXISTS task_manager_db;
```

> ✅ **That's it for the database!** The application will automatically create all 14 tables when it starts.

---

### Step 2: Build & Run the Backend

Open a **Command Prompt** (or Terminal) and navigate to the backend folder:

```cmd
cd "C:\Users\91738\Desktop\My Projects\task manager\backend"
```

**Build the project:**

```cmd
mvn clean install -DskipTests
```

> ⏳ First build may take 2-5 minutes to download dependencies.

**Run the application:**

```cmd
mvn spring-boot:run
```

> ⏳ Wait for the message: `Started TaskManagerApplication in X.XXX seconds`

**Verify it's running:**
- Open your browser and go to: **http://localhost:8081/api/auth/login**
- You should see a JSON error response (not a connection error) — this means the API is running!

> ⚠️ **Keep this terminal window open!** Closing it will stop the backend server.

---

### Step 3: Run the Frontend

The frontend is a simple static HTML/CSS/JS application. You can serve it in several ways:

#### Option A: VS Code Live Server (Recommended)

1. Open VS Code.
2. Open the `frontend` folder.
3. Install the **"Live Server"** extension (by Ritwick Dey) from the Extensions tab.
4. Right-click on `index.html` → **"Open with Live Server"**.
5. It will open at **http://127.0.0.1:5500** in your browser.

#### Option B: Python HTTP Server

```cmd
cd "C:\Users\91738\Desktop\My Projects\task manager\frontend"
python -m http.server 5500
```

Then open: **http://localhost:5500**

#### Option C: Node.js (npx serve)

```cmd
cd "C:\Users\91738\Desktop\My Projects\task manager\frontend"
npx serve -l 5500
```

Then open: **http://localhost:5500**

---

### Step 4: Login & Use the Application

Open the frontend URL in your browser. Use one of these default accounts:

| Username | Password   | Role              | Description                    |
|----------|-----------|-------------------|--------------------------------|
| `admin`  | `admin123`| 🔴 Administrator   | Full system access + admin panel|
| `demo`   | `demo123` | 🟢 User            | Standard user access           |

> 💡 You can also **register a new account** from the signup page.

---

## 🛑 Troubleshooting

### Problem: `mvn` command not found

**Cause:** Maven is not in your system PATH.

**Fix:**
1. Find your Maven install directory (e.g., `C:\apache-maven-3.9.14\bin`).
2. Add it to your system PATH:
   - Search "Environment Variables" in Windows.
   - Under "System variables", find `Path` → Edit → New.
   - Add: `C:\apache-maven-3.9.14\bin`
3. Restart your Command Prompt and try again.

Alternatively, use the full path:
```cmd
"C:\apache-maven-3.9.14\bin\mvn" clean install -DskipTests
```

---

### Problem: `java` command not found

**Cause:** Java JDK 17 is not in your system PATH.

**Fix:**
1. Download Java 17 from [Oracle](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html) or [Adoptium](https://adoptium.net/).
2. Set `JAVA_HOME` environment variable to your JDK path (e.g., `C:\Program Files\Java\jdk-17`).
3. Add `%JAVA_HOME%\bin` to your system `Path`.

---

### Problem: Backend fails to start — "Cannot create JDBC connection"

**Cause:** XAMPP MySQL is not running or port conflict.

**Fix:**
1. Open XAMPP Control Panel.
2. Ensure **MySQL** shows "Running" (green).
3. If MySQL won't start, check if port 3306 is occupied:
   ```cmd
   netstat -aon | findstr :3306
   ```
4. If another process is using port 3306, stop it or change the port in `application.properties`:
   ```properties
   spring.datasource.url=jdbc:mariadb://localhost:3307/task_manager_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
   ```
   (Change `3306` to `3307` or whatever port XAMPP uses).

---

### Problem: CORS errors in browser console

**Cause:** Frontend is not running on an allowed origin.

**Fix:** Make sure the frontend is running on one of these URLs:
- `http://localhost:5500`
- `http://127.0.0.1:5500`
- `http://localhost:3000`

If using a different port, update these files:
1. `backend/src/main/java/com/taskmanager/config/CorsConfig.java`
2. `backend/src/main/java/com/taskmanager/config/SecurityConfig.java`

Add your URL to the allowed origins list, then rebuild & restart the backend.

---

### Problem: "Access Denied" error on login

**Cause:** Database password mismatch.

**Fix:** XAMPP's MariaDB uses **empty password** for root by default. Verify in `backend/src/main/resources/application.properties`:
```properties
spring.datasource.username=root
spring.datasource.password=
```

If you've set a custom password in XAMPP, update the `password` field accordingly.

---

### Problem: Build fails with "Unsupported class file major version 61"

**Cause:** Wrong Java version. This project requires Java 17.

**Fix:**
```cmd
java -version
```
Must show `java version "17.x.x"`. If not, install Java 17 and set it as default.

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
9. ✅ **Notifications** — In-app + WebSocket real-time alerts
10. ✅ **Calendar & Scheduling** — Monthly view with task deadlines
11. ✅ **Analytics Dashboard** — Charts, metrics, completion rates
12. ✅ **Risk & Alerts** — Overdue detection, overload warnings
13. ✅ **Focus Mode** — Single-task view with integrated timer
14. ✅ **Habit Tracking** — Daily habits with streak tracking
15. ✅ **Admin Dashboard** — System-wide analytics and user management
16. ✅ **Security** — BCrypt passwords, JWT, input validation, RBAC
17. ✅ **14 Database Tables** — All mandatory tables implemented

---

## 🏗️ Tech Stack

### Backend
| Technology           | Version     | Purpose                     |
|---------------------|-------------|------------------------------|
| Java                | 17          | Core language                |
| Spring Boot         | 3.2.4       | Application framework        |
| Spring Security     | 6.x         | Authentication & authorization|
| Spring Data JPA     | 3.x         | Database ORM (Hibernate 6)   |
| Spring WebSocket    | 3.x         | Real-time STOMP + SockJS     |
| MariaDB             | 10.1+       | Database (via XAMPP)         |
| JWT (jjwt)          | 0.12.5      | Token-based authentication   |
| Lombok              | Latest      | Boilerplate reduction        |
| Maven               | 3.8+        | Build tool                   |

### Frontend
| Technology           | Purpose                        |
|---------------------|--------------------------------|
| HTML5 / CSS3        | Structure & styling            |
| Vanilla JavaScript  | Application logic              |
| Chart.js            | Analytics charts               |
| SockJS + STOMP      | WebSocket client               |
| Font Awesome        | Icons                          |
| Google Fonts (Inter)| Typography                     |

---

## 📁 Project Structure

```
task-manager/
│
├── README.md
│
├── backend/
│   ├── pom.xml                           ← Maven config (dependencies)
│   └── src/main/
│       ├── resources/
│       │   └── application.properties    ← Database & server config
│       └── java/com/taskmanager/
│           ├── TaskManagerApplication.java   ← Main entry point
│           ├── config/
│           │   ├── SecurityConfig.java       ← JWT + CORS + auth rules
│           │   ├── CorsConfig.java           ← CORS filter
│           │   ├── WebSocketConfig.java      ← STOMP WebSocket config
│           │   └── DataInitializer.java      ← Creates default roles & users
│           ├── controller/    (10 REST Controllers)
│           │   ├── AuthController.java       ← POST /auth/login, /auth/register
│           │   ├── UserController.java       ← GET/PUT /users/me, admin user mgmt
│           │   ├── ProjectController.java    ← CRUD /projects, member mgmt
│           │   ├── TaskController.java       ← CRUD /tasks, kanban, calendar
│           │   ├── CommentController.java    ← POST/GET /comments/task/{id}
│           │   ├── NotificationController.java ← GET /notifications
│           │   ├── DashboardController.java  ← GET /dashboard, /dashboard/admin
│           │   ├── TimeTrackingController.java ← POST /time/start, /time/stop
│           │   ├── HabitController.java      ← CRUD /habits
│           │   └── TagController.java        ← CRUD /tags
│           ├── dto/           (9 Data Transfer Objects)
│           ├── exception/     (Global error handling)
│           ├── model/         (12 JPA Entities → 14 DB tables)
│           ├── repository/    (12 Spring Data Repositories)
│           ├── security/      (JWT Provider, Filter, UserDetailsService)
│           └── service/       (9 Service classes)
│
└── frontend/
    ├── index.html                ← SPA shell (auth, sidebar, modals, pages)
    ├── css/
    │   └── styles.css            ← Premium design system (dark/light themes)
    └── js/
        ├── api.js                ← REST API client (fetch wrapper)
        ├── auth.js               ← Login/register/logout handlers
        ├── websocket.js          ← STOMP WebSocket client
        ├── app.js                ← Router, theme toggle, utilities
        └── pages/                ← Page modules (dashboard, tasks, kanban, etc.)
```

---

## 📡 API Endpoints Reference

> Base URL: `http://localhost:8081/api`

### Authentication (Public — No token needed)
| Method | Endpoint            | Description        |
|--------|--------------------|--------------------|
| POST   | `/auth/login`       | Login, returns JWT |
| POST   | `/auth/register`    | Register new user  |

### Users
| Method | Endpoint                 | Description                |
|--------|-------------------------|----------------------------|
| GET    | `/users/me`              | Get current user profile  |
| PUT    | `/users/me`              | Update own profile        |
| GET    | `/users`                 | List all users            |
| GET    | `/users/{id}`            | Get user by ID            |
| GET    | `/users/search?q=term`   | Search users              |
| PUT    | `/users/{id}` 🔒         | Admin: update user        |
| PUT    | `/users/{id}/role` 🔒    | Admin: change role        |
| PUT    | `/users/{id}/toggle-status` 🔒 | Admin: activate/deactivate |
| DELETE | `/users/{id}` 🔒         | Admin: delete user        |

### Projects
| Method | Endpoint                         | Description            |
|--------|----------------------------------|------------------------|
| POST   | `/projects`                      | Create project         |
| GET    | `/projects`                      | My projects            |
| GET    | `/projects/all`                  | All projects           |
| GET    | `/projects/{id}`                 | Get project            |
| PUT    | `/projects/{id}`                 | Update project         |
| DELETE | `/projects/{id}`                 | Delete project         |
| POST   | `/projects/{id}/members`         | Add member             |
| DELETE | `/projects/{id}/members/{userId}`| Remove member          |

### Tasks
| Method | Endpoint                        | Description                |
|--------|---------------------------------|----------------------------|
| POST   | `/tasks`                        | Create task                |
| GET    | `/tasks/{id}`                   | Get task                   |
| PUT    | `/tasks/{id}`                   | Update task                |
| PATCH  | `/tasks/{id}/status`            | Update status only         |
| DELETE | `/tasks/{id}`                   | Delete task                |
| GET    | `/tasks/my`                     | My assigned tasks          |
| GET    | `/tasks/project/{projectId}`    | Tasks by project           |
| GET    | `/tasks/kanban/{projectId}`     | Kanban board tasks         |
| GET    | `/tasks/user/{userId}`          | Tasks by assignee          |
| GET    | `/tasks/overdue`                | Overdue tasks              |
| GET    | `/tasks/calendar?start=&end=`   | Calendar tasks             |
| GET    | `/tasks/my-calendar?start=&end=`| My calendar tasks          |
| GET    | `/tasks/templates`              | Task templates             |
| POST   | `/tasks/from-template/{id}`     | Create from template       |

### Time Tracking
| Method | Endpoint                     | Description          |
|--------|------------------------------|----------------------|
| POST   | `/time/start/{taskId}`       | Start timer          |
| POST   | `/time/stop/{taskId}`        | Stop timer           |
| GET    | `/time/task/{taskId}`        | Task time logs       |
| GET    | `/time/my`                   | My time logs         |
| GET    | `/time/task/{taskId}/total`  | Task total time      |

### Comments, Notifications, Habits, Tags, Dashboard
| Method | Endpoint                        | Description               |
|--------|---------------------------------|---------------------------|
| POST   | `/comments/task/{taskId}`       | Add comment               |
| GET    | `/comments/task/{taskId}`       | Get task comments         |
| GET    | `/notifications`                | My notifications          |
| GET    | `/notifications/unread-count`   | Unread count              |
| PUT    | `/notifications/read-all`       | Mark all read             |
| POST   | `/habits`                       | Create habit              |
| GET    | `/habits`                       | My habits                 |
| POST   | `/habits/{id}/complete`         | Complete habit today      |
| GET    | `/tags`                         | All tags                  |
| POST   | `/tags`                         | Create tag                |
| GET    | `/dashboard`                    | User dashboard            |
| GET    | `/dashboard/admin` 🔒           | Admin dashboard           |

> 🔒 = Admin-only endpoint

---

## ⚙️ Configuration Reference

### Database Config (`backend/src/main/resources/application.properties`)

| Property                          | Default Value                  | Description                       |
|-----------------------------------|-------------------------------|-----------------------------------|
| `spring.datasource.url`          | `jdbc:mariadb://localhost:3306/task_manager_db` | JDBC URL       |
| `spring.datasource.username`     | `root`                        | Database username                |
| `spring.datasource.password`     | *(empty)*                     | Database password (XAMPP default) |
| `server.port`                    | `8081`                        | Backend server port              |
| `server.servlet.context-path`    | `/api`                        | API base path                    |
| `app.jwt.secret`                 | Base64-encoded key            | JWT signing secret               |
| `app.jwt.expiration`             | `86400000` (24h)              | JWT token expiry in ms           |

---

## 🗄️ Database Tables (14 Total)

| #  | Table              | Description                        |
|----|--------------------|------------------------------------|
| 1  | `users`            | User accounts                     |
| 2  | `roles`            | User roles (USER, MANAGER, ADMIN) |
| 3  | `projects`         | Projects                          |
| 4  | `project_members`  | Project membership (user↔project) |
| 5  | `tasks`            | Tasks with full metadata          |
| 6  | `task_dependencies`| Task dependency graph             |
| 7  | `task_tags`        | Many-to-many task↔tag link        |
| 8  | `tags`             | Tag definitions                   |
| 9  | `comments`         | Threaded comments on tasks        |
| 10 | `time_logs`        | Time tracking entries             |
| 11 | `notifications`    | In-app notifications              |
| 12 | `activity_logs`    | Audit trail / activity history    |
| 13 | `habits`           | Daily habit tracker               |
| 14 | `hibernate_sequence` | Auto-generated by Hibernate     |

> All tables are **auto-created** by Hibernate on first startup (`ddl-auto=update`).

---

## 🎨 Design Features

- **Dark/Light Mode** toggle with smooth transitions
- **Glassmorphism** effects on auth cards
- **Micro-animations** on cards, lists, and interactions
- **Gradient accents** and premium color palette
- **Responsive** layout for all screen sizes
- **Custom scrollbars** and hover effects

---

## 📝 Summary of Commands

```cmd
# 1. Start XAMPP → Start Apache + MySQL

# 2. Create database (via phpMyAdmin SQL tab)
CREATE DATABASE IF NOT EXISTS task_manager_db;

# 3. Build backend
cd "C:\Users\91738\Desktop\My Projects\task manager\backend"
mvn clean install -DskipTests

# 4. Run backend (keep terminal open!)
mvn spring-boot:run

# 5. Serve frontend (new terminal)
cd "C:\Users\91738\Desktop\My Projects\task manager\frontend"
python -m http.server 5500

# 6. Open browser → http://localhost:5500
# 7. Login: admin / admin123
```

---

## 📄 License

This project is for educational purposes.
