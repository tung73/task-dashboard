# Task Dashboard - Enhancement Specification

## 1. Current System Status

### Hardware/Resources
| Resource | Usage |
|----------|-------|
| CPU | ~1-2% (node process) |
| RAM | 68MB (node), 471MB (cloudflared) |
| Disk | 1% used (952GB free) |
| Load | 0.04 (very low) |

### Current Integrations
| Service | Status | Purpose |
|---------|--------|---------|
| Node.js | ✅ Active | Web server |
| Express | ✅ Active | API backend |
| Telegram Bot | ✅ Active | Notifications |
| Cloudflare Tunnel | ✅ Active | Public URL |
| ebooklib | ✅ Installed | Read epub files |
| mobi library | ✅ Installed | Read mobi files |
| wttr.in | ✅ Available | Weather data |

---

## 2. Enhancement Requirements

### 2.1 Task System Upgrades

**Current Fields:**
- id, title, priority, category, completed, createdAt

**New Fields (Required):**
| Field | Type | Description |
|-------|------|-------------|
| `createdAt` | datetime | ✅ Already exists |
| `completedAt` | datetime | NEW - When task was completed |
| `status` | enum | NEW - pending, in_progress, completed, failed |
| `taskType` | enum | general, ebook_summary, message, command, research |
| `logs` | array | NEW - Array of {timestamp, action, details} |
| `result` | object | NEW - Task execution results |
| ` attachments` | array | File paths or URLs |
| `assignedTo` | string | AI, human, or specific agent |

### 2.2 Ebook Summary Feature

**Workflow:**
1. User uploads epub/mobi file via dashboard
2. System stores file, creates task
3. AI extracts and summarizes content
4. Summary stored in task result
5. User can view/download summary

**Data Structure:**
```javascript
{
  taskType: "ebook_summary",
  attachment: {
    filename: "book.epub",
    path: "/uploads/book.epub",
    size: 1234567,
    type: "epub"
  },
  result: {
    title: "Book Title",
    author: "Author Name", 
    summary: "...",
    keyPoints: ["point1", "point2"],
    wordCount: 5000
  }
}
```

### 2.3 Dashboard UI Improvements

**Current:** Simple vanilla HTML/CSS

**Proposed:**
- Dark/Light theme toggle
- Task filtering (by status, type, date)
- Task search
- File upload dropzone
- Activity log panel
- System status panel (CPU, RAM, uptime)
- Better mobile responsive design

---

## 3. Technical Architecture

### Proposed Stack
| Layer | Technology | Notes |
|-------|------------|-------|
| Frontend | React or Vue.js | Better state management |
| Backend | Express.js | Keep existing |
| Storage | SQLite | Better than JSON, still simple |
| File Storage | Local ./uploads | Or could use S3 |
| Auth | Optional | Could add basic auth |

### New API Endpoints Needed
```
POST   /api/tasks/:id/log     - Add log entry
GET    /api/tasks/:id/logs    - Get all logs
POST   /api/upload            - Upload file
GET    /api/system            - System status
PATCH  /api/tasks/:id/result  - Save result
```

---

## 4. Flexibility Evaluation

| Aspect | Current | Proposed | Rating |
|--------|---------|----------|--------|
| Data Storage | JSON | SQLite | ⭐⭐⭐⭐⭐ |
| File Handling | None | Upload system | ⭐⭐⭐⭐⭐ |
| Task Types | Limited | Extensible | ⭐⭐⭐⭐⭐ |
| UI | Basic | Professional | ⭐⭐⭐ |
| Search/Filter | None | Full-text | ⭐⭐⭐⭐⭐ |
| Theme | Single | Toggle | ⭐⭐⭐ |
| Mobile | Basic | Responsive | ⭐⭐⭐⭐ |

---

## 5. Implementation Options

### Option A: Incremental (Recommended)
- Keep Express + JSON for now
- Add new fields to existing data structure
- Enhance UI with vanilla JS
- Add file upload
- Simple migration

**Pros:** Fast, no breaking changes
**Cons:** Still limited scalability

### Option B: Full Rebuild
- New frontend (React/Vue)
- SQLite database
- File upload system
- System monitoring

**Pros:** Professional, scalable, modern
**Cons:** More work, bigger change

---

## 6. Recommended Next Steps

1. **Confirm requirements** - Which features do you want?
2. **Choose option** - Incremental or Full Rebuild?
3. **Scope Phase 1** - What to implement first?
4. **Deploy** - New app URL or replace existing?

---

## 7. Questions for You

- [ ] Which features are must-have vs nice-to-have?
- [ ] Prefer incremental or full rebuild?
- [ ] Want auth (login) added?
- [ ] How many users will access?
- [ ] Keep same URL or new one?
- [ ] Budget for any paid services?

