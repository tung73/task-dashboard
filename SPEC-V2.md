# Task Dashboard V2 - Full Rebuild Specification

## 1. Project Overview

**Project Name:** TaskHub AI
**Type:** Web Application (Full Stack)
**Core Functionality:** A task management dashboard with AI integration, allowing users to create tasks, upload ebooks for summarization, receive notifications, and make voice calls.
**Target Users:** Individual user working with AI assistant

---

## 2. Technology Stack

### Backend
| Component | Technology | Version |
|-----------|------------|---------|
| Runtime | Node.js | v22.x |
| Framework | Express.js | ^4.18.x |
| Database | better-sqlite3 | ^9.x |
| File Upload | multer | ^1.4.x |
| System Info | systeminformation | ^5.x |

### Frontend
| Component | Technology | Version |
|-----------|------------|---------|
| Framework | React | ^18.x |
| Build Tool | Vite | ^5.x |
| UI Library | TailwindCSS | ^3.x |
| Icons | Lucide React | latest |
| HTTP Client | Axios | ^1.6.x |

### External Services
| Service | Purpose |
|---------|---------|
| Telegram Bot | Notifications + Voice calls |
| Cloudflare Tunnel | Public URL |
| wttr.in | Weather API |

---

## 3. Feature Requirements

### 3.1 Task Management (Core)
- [x] Create task with title, description, priority, category
- [x] Task types: general, ebook_summary, message, command, research, call
- [x] Task status: pending, in_progress, completed, failed
- [x] Task timestamps: createdAt, startedAt, completedAt
- [x] Task logs: array of {timestamp, action, details}
- [x] Task result: flexible object for output data
- [x] Task attachments: file uploads
- [x] Assignee: human, ai, specific agent

### 3.2 Ebook Summary Feature
- [x] Upload epub/mobi files via drag & drop
- [x] Automatic file type detection
- [x] Extract metadata (title, author, description)
- [x] Convert mobi to epub using Python mobi library
- [x] Extract text content
- [x] AI summarization
- [x] Store summary in task result
- [x] View/download summary

### 3.3 Call Feature (ALL TYPES)
- [x] Task type: "call"
- [x] Call types supported:
  - telegram_voice: Voice call via Telegram
  - telegram_video: Video call via Telegram  
  - phone: Regular phone call
  - video_link: Generate video meeting link (Zoom/Meet/Jitsi)
  - voice_message: Send voice message via Telegram
- [x] Call status: pending, dialing, in_progress, completed, missed, failed
- [x] Call duration tracking
- [x] Call notes/results
- [x] Trigger call from task dashboard
- [x] Receive call notifications via Telegram
- [x] Generate video meeting links

### 3.4 Notification System
- [x] Telegram notifications for new tasks
- [x] Notification on task completion
- [x] Notification on call incoming
- [x] Configurable notification preferences

### 3.5 Dashboard UI
- [x] Responsive design (mobile, tablet, desktop)
- [x] Dark/Light theme toggle
- [x] Task list with filtering (status, type, priority, date)
- [x] Task search
- [x] Task detail modal/view
- [x] Activity log panel
- [x] System status panel (CPU, RAM, Disk, Uptime)
- [x] File upload dropzone
- [x] Quick action buttons

---

## 4. Database Schema

### tasks
```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT DEFAULT 'general',
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'normal',
  category TEXT DEFAULT 'general',
  assignee TEXT DEFAULT 'ai',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  started_at DATETIME,
  completed_at DATETIME,
  result TEXT,
  created_by TEXT DEFAULT 'human'
);
```

### task_logs
```sql
CREATE TABLE task_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);
```

### attachments
```sql
CREATE TABLE attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mimetype TEXT,
  size INTEGER,
  path TEXT NOT NULL,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);
```

---

## 5. API Endpoints

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tasks | List all tasks (with filters) |
| POST | /api/tasks | Create new task |
| GET | /api/tasks/:id | Get task details |
| PATCH | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |
| POST | /api/tasks/:id/log | Add log entry |
| GET | /api/tasks/:id/logs | Get task logs |
| PATCH | /api/tasks/:id/result | Save task result |

### Files
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/upload | Upload file |
| GET | /api/files/:id | Download file |
| DELETE | /api/files/:id | Delete file |

### System
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/system | Get system status |
| GET | /api/health | Health check |

### Calls
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/calls/initiate | Initiate call |
| POST | /api/calls/:id/end | End call |
| GET | /api/calls/:id/status | Get call status |

---

## 6. UI/UX Design

### Color Palette
| Role | Light Mode | Dark Mode |
|------|------------|-----------|
| Background | #FFFFFF | #0F172A |
| Surface | #F8FAFC | #1E293B |
| Primary | #6366F1 | #818CF8 |
| Secondary | #8B5CF6 | #A78BFA |
| Accent | #10B981 | #34D399 |
| Error | #EF4444 | #F87171 |
| Warning | #F59E0B | #FBBF24 |
| Text Primary | #1E293B | #F1F5F9 |
| Text Secondary | #64748B | #94A3B8 |

### Layout
```
┌─────────────────────────────────────────────────┐
│ Header: Logo, Theme Toggle, System Status      │
├──────────┬──────────────────────────────────────┤
│ Sidebar  │ Main Content                        │
│ - Tasks  │ ┌────────────────────────────────┐ │
│ - Stats  │ │ Stats Cards                    │ │
│ - Logs   │ └────────────────────────────────┘ │
│ - Files  │ ┌────────────────────────────────┐ │
│ - Call   │ │ Task List / Detail / Upload   │ │
│          │ └────────────────────────────────┘ │
└──────────┴──────────────────────────────────────┘
```

### Responsive Breakpoints
| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 640px | Single column, bottom nav |
| Tablet | 640-1024px | Collapsible sidebar |
| Desktop | > 1024px | Full sidebar |

---

## 7. Implementation Phases

### Phase 1: Foundation (Day 1)
- [ ] Set up React + Vite project
- [ ] Configure TailwindCSS
- [ ] Set up Express server with SQLite
- [ ] Create database schema
- [ ] Basic API endpoints

### Phase 2: Task System (Day 1-2)
- [ ] Task CRUD operations
- [ ] Task filtering and search
- [ ] Task logs system
- [ ] Task status transitions

### Phase 3: File Upload & Ebook (Day 2-3)
- [ ] File upload API with multer
- [ ] File storage system
- [ ] Epub/Mobi parsing
- [ ] Text extraction
- [ ] Summary generation

### Phase 4: Call Feature (Day 3)
- [ ] Call task type
- [ ] Telegram voice call integration
- [ ] Call status tracking
- [ ] Call history

### Phase 5: UI Polish (Day 3-4)
- [ ] Dark/Light theme
- [ ] Responsive design
- [ ] Animations
- [ ] Loading states
- [ ] Error handling

### Phase 6: Deployment (Day 4)
- [ ] Test all features
- [ ] Set up Cloudflare tunnel
- [ ] Configure notifications
- [ ] Documentation

---

## 8. File Structure
```
task-dashboard/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── TaskList.jsx
│   │   │   ├── TaskCard.jsx
│   │   │   ├── TaskDetail.jsx
│   │   │   ├── TaskForm.jsx
│   │   │   ├── FileUpload.jsx
│   │   │   ├── SystemStatus.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── ThemeToggle.jsx
│   │   ├── hooks/
│   │   │   ├── useTasks.js
│   │   │   ├── useSystem.js
│   │   │   └── useTheme.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── server/                 # Express backend
│   ├── db/
│   │   ├── index.js
│   │   └── schema.sql
│   ├── routes/
│   │   ├── tasks.js
│   │   ├── files.js
│   │   ├── system.js
│   │   └── calls.js
│   ├── services/
│   │   ├── telegram.js
│   │   ├── ebook.js
│   │   └── system.js
│   ├── uploads/
│   ├── server.js
│   └── package.json
├── package.json            # Root package.json
└── README.md
```

---

## 9. Acceptance Criteria

### Must Pass
- [ ] Tasks can be created with all new fields
- [ ] Tasks can be filtered by status, type, priority
- [ ] Files can be uploaded and associated with tasks
- [ ] Epub files can be parsed and summarized
- [ ] Call tasks can be initiated via Telegram
- [ ] Dark/Light theme works
- [ ] System status displays correctly
- [ ] Mobile responsive works

### Visual Checkpoints
- [ ] Dashboard loads in < 2 seconds
- [ ] Theme toggle is smooth
- [ ] Task cards display all info
- [ ] File upload shows progress
- [ ] Mobile layout is usable

---

## 10. Questions for Final Approval

Before I implement, please confirm:

1. ✅ **Call feature** - Is Telegram voice call correct, or do you mean something else?
2. ✅ **Database** - SQLite is fine for single-user?
3. **Auth** - No login needed (single user)?
4. **Telegram** - Same bot token as current?
5. **Timeline** - Is 4 days too long? Shorter?

Let me know and I'll start implementation!
