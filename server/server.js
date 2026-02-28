import express from 'express';
import cors from 'cors';
import multer from 'multer';
import Database from 'better-sqlite3';
import si from 'systeminformation';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Database setup
const db = new Database(path.join(__dirname, 'database.sqlite'));

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
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

  CREATE TABLE IF NOT EXISTS task_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS attachments (
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
`);

// Telegram config
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8268460963:AAFUXoInuM6JMuoykbhZ15pjV1opFuHhVNw';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '461489467';

// Helper: Send Telegram notification
function sendTelegram(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${encodeURIComponent(message)}&parse_mode=markdown`;
  https.get(url).on('error', () => {});
}

// ==================== TASK API ====================

// Get all tasks (with filters)
app.get('/api/tasks', (req, res) => {
  const { status, type, priority, search } = req.query;
  let query = 'SELECT * FROM tasks WHERE 1=1';
  const params = [];
  
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  if (type) {
    query += ' AND task_type = ?';
    params.push(type);
  }
  if (priority) {
    query += ' AND priority = ?';
    params.push(priority);
  }
  if (search) {
    query += ' AND (title LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  
  query += ' ORDER BY created_at DESC';
  
  const tasks = db.prepare(query).all(...params);
  res.json(tasks);
});

// Create task
app.post('/api/tasks', (req, res) => {
  const { title, description, task_type, priority, category, assignee } = req.body;
  
  const stmt = db.prepare(`
    INSERT INTO tasks (title, description, task_type, priority, category, assignee)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    title,
    description || null,
    task_type || 'general',
    priority || 'normal',
    category || 'general',
    assignee || 'ai'
  );
  
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
  
  // Add log
  db.prepare('INSERT INTO task_logs (task_id, action, details) VALUES (?, ?, ?)').run(
    task.id, 'created', `Task created: ${title}`
  );
  
  // Send notification
  sendTelegram(`📝 *New Task*\n\n*${title}*\nType: ${task.task_type}\nPriority: ${task.priority}`);
  
  res.json(task);
});

// Get task by ID
app.get('/api/tasks/:id', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  
  const logs = db.prepare('SELECT * FROM task_logs WHERE task_id = ? ORDER BY timestamp DESC').all(req.params.id);
  const attachments = db.prepare('SELECT * FROM attachments WHERE task_id = ?').all(req.params.id);
  
  res.json({ ...task, logs, attachments });
});

// Update task
app.patch('/api/tasks/:id', (req, res) => {
  const { title, description, task_type, status, priority, category, assignee } = req.body;
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  
  const updates = [];
  const params = [];
  
  if (title !== undefined) { updates.push('title = ?'); params.push(title); }
  if (description !== undefined) { updates.push('description = ?'); params.push(description); }
  if (task_type !== undefined) { updates.push('task_type = ?'); params.push(task_type); }
  if (priority !== undefined) { updates.push('priority = ?'); params.push(priority); }
  if (category !== undefined) { updates.push('category = ?'); params.push(category); }
  if (assignee !== undefined) { updates.push('assignee = ?'); params.push(assignee); }
  
  if (status !== undefined) {
    updates.push('status = ?');
    params.push(status);
    
    if (status === 'in_progress' && task.status !== 'in_progress') {
      updates.push('started_at = ?');
      params.push(new Date().toISOString());
      db.prepare('INSERT INTO task_logs (task_id, action, details) VALUES (?, ?, ?)').run(
        req.params.id, 'started', 'Task started'
      );
    }
    
    if (status === 'completed' && task.status !== 'completed') {
      updates.push('completed_at = ?');
      params.push(new Date().toISOString());
      db.prepare('INSERT INTO task_logs (task_id, action, details) VALUES (?, ?, ?)').run(
        req.params.id, 'completed', 'Task completed'
      );
      sendTelegram(`✅ *Task Completed*\n\n*${task.title}*`);
    }
  }
  
  params.push(req.params.id);
  
  db.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`).run(...params);
  
  const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  res.json(updatedTask);
});

// Delete task
app.delete('/api/tasks/:id', (req, res) => {
  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Add log entry
app.post('/api/tasks/:id/log', (req, res) => {
  const { action, details } = req.body;
  db.prepare('INSERT INTO task_logs (task_id, action, details) VALUES (?, ?, ?)').run(
    req.params.id, action, details
  );
  const logs = db.prepare('SELECT * FROM task_logs WHERE task_id = ? ORDER BY timestamp DESC').all(req.params.id);
  res.json(logs);
});

// Get task logs
app.get('/api/tasks/:id/logs', (req, res) => {
  const logs = db.prepare('SELECT * FROM task_logs WHERE task_id = ? ORDER BY timestamp DESC').all(req.params.id);
  res.json(logs);
});

// Update task result
app.patch('/api/tasks/:id/result', (req, res) => {
  const { result } = req.body;
  db.prepare('UPDATE tasks SET result = ? WHERE id = ?').run(JSON.stringify(result), req.params.id);
  
  db.prepare('INSERT INTO task_logs (task_id, action, details) VALUES (?, ?, ?)').run(
    req.params.id, 'result_updated', 'Task result updated'
  );
  
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  res.json(task);
});

// ==================== FILE API ====================

// Upload file
app.post('/api/upload', upload.single('file'), (req, res) => {
  const { taskId } = req.body;
  
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  let attachment = null;
  
  if (taskId) {
    db.prepare(`
      INSERT INTO attachments (task_id, filename, original_name, mimetype, size, path)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(taskId, req.file.filename, req.file.originalname, req.file.mimetype, req.file.size, req.file.path);
    
    attachment = db.prepare('SELECT * FROM attachments WHERE id = ?').get(db.prepare('SELECT last_insert_rowid()').get()['last_insert_rowid()']);
  }
  
  res.json({
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    path: `/uploads/${req.file.filename}`,
    attachment
  });
});

// Get file
app.get('/api/files/:filename', (req, res) => {
  const filePath = path.join(uploadsDir, req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  res.sendFile(filePath);
});

// ==================== SYSTEM API ====================

// Get system status
app.get('/api/system', async (req, res) => {
  try {
    const [cpu, mem, disk, osInfo, time] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize(),
      si.osInfo(),
      si.time()
    ]);
    
    res.json({
      cpu: {
        load: cpu.currentLoad.toFixed(1),
        cores: cpu.cpus.length
      },
      memory: {
        total: (mem.total / 1024 / 1024 / 1024).toFixed(1) + ' GB',
        used: (mem.used / 1024 / 1024 / 1024).toFixed(1) + ' GB',
        free: (mem.free / 1024 / 1024 / 1024).toFixed(1) + ' GB',
        percent: ((mem.used / mem.total) * 100).toFixed(1)
      },
      disk: {
        total: (disk[0].size / 1024 / 1024 / 1024).toFixed(1) + ' GB',
        used: (disk[0].used / 1024 / 1024 / 1024).toFixed(1) + ' GB',
        free: (disk[0].available / 1024 / 1024 / 1024).toFixed(1) + ' GB',
        percent: disk[0].use
      },
      os: osInfo.distro,
      uptime: Math.floor(time.uptime / 3600) + ' hours',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== STATS ====================

app.get('/api/stats', (req, res) => {
  const tasks = db.prepare('SELECT status, task_type, priority FROM tasks').all();
  
  const stats = {
    total: tasks.length,
    byStatus: {},
    byType: {},
    byPriority: {}
  };
  
  tasks.forEach(t => {
    stats.byStatus[t.status] = (stats.byStatus[t.status] || 0) + 1;
    stats.byType[t.task_type] = (stats.byType[t.task_type] || 0) + 1;
    stats.byPriority[t.priority] = (stats.byPriority[t.priority] || 0) + 1;
  });
  
  res.json(stats);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// ==================== EBOOK PROCESSING ====================
import { spawn } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Process ebook file
app.post('/api/ebook/process', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file ? req.file.path : null;
    const taskId = req.body.taskId;
    
    if (!filePath) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const ext = path.extname(filePath).toLowerCase();
    if (!['.epub', '.mobi'].includes(ext)) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'Only epub and mobi files are supported' });
    }
    
    // Run Python script
    const pythonScript = path.join(__dirname, 'services', 'ebook.py');
    const result = await new Promise((resolve, reject) => {
      const process = spawn('python3', [pythonScript, filePath]);
      let stdout = '';
      let stderr = '';
      
      process.stdout.on('data', (data) => { stdout += data; });
      process.stderr.on('data', (data) => { stderr += data; });
      
      process.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(stderr || 'Processing failed'));
        } else {
          try {
            resolve(JSON.parse(stdout));
          } catch (e) {
            reject(new Error('Invalid output from processing script'));
          }
        }
      });
    });
    
    // Save result to task if taskId provided
    if (taskId) {
      db.prepare('UPDATE tasks SET result = ? WHERE id = ?').run(JSON.stringify(result), taskId);
      db.prepare('INSERT INTO task_logs (task_id, action, details) VALUES (?, ?, ?)').run(
        taskId, 'ebook_processed', `Processed: ${result.metadata?.title || 'Unknown'}`
      );
    }
    
    res.json(result);
    
  } catch (error) {
    console.error('Ebook processing error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate summary using AI (placeholder - would integrate with AI API)
app.post('/api/ebook/summarize', async (req, res) => {
  const { text, maxLength = 1000 } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: 'No text provided' });
  }
  
  // This is a placeholder - in production, you'd call an AI API here
  // For now, return a basic summary (first N characters)
  const summary = text.substring(0, maxLength);
  
  res.json({
    summary,
    originalLength: text.length,
    summaryLength: summary.length
  });
});
