const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const https = require('https');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'tasks.json');

// Telegram config - will be loaded from environment
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize tasks file if not exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ tasks: [], messages: [] }, null, 2));
}

// Function to send Telegram notification
function sendTelegramNotification(task) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('Telegram not configured, skipping notification');
    return;
  }
  
  const message = `📝 *New Task Added*\n\n*${task.title}*\nPriority: ${task.priority}\nCategory: ${task.category}`;
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${encodeURIComponent(message)}&parse_mode=markdown`;
  
  https.get(url, (res) => {
    console.log('Telegram notification sent');
  }).on('error', (e) => {
    console.error('Telegram notification failed:', e.message);
  });
}

// API: Get all tasks
app.get('/api/tasks', (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  res.json(data.tasks);
});

// API: Add a task
app.post('/api/tasks', (req, res) => {
  const { title, priority, category } = req.body;
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  
  const newTask = {
    id: Date.now(),
    title,
    priority: priority || 'normal',
    category: category || 'general',
    completed: false,
    createdAt: new Date().toISOString()
  };
  
  data.tasks.push(newTask);
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  
  // Send notification
  sendTelegramNotification(newTask);
  
  res.json(newTask);
});

// API: Toggle task completion
app.patch('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { completed, title, priority, category } = req.body;
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  
  const taskIndex = data.tasks.findIndex(t => t.id == id);
  if (taskIndex === -1) return res.status(404).json({ error: 'Task not found' });
  
  if (completed !== undefined) data.tasks[taskIndex].completed = completed;
  if (title !== undefined) data.tasks[taskIndex].title = title;
  if (priority !== undefined) data.tasks[taskIndex].priority = priority;
  if (category !== undefined) data.tasks[taskIndex].category = category;
  
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  res.json(data.tasks[taskIndex]);
});

// API: Delete task
app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  
  data.tasks = data.tasks.filter(t => t.id != id);
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  res.json({ success: true });
});

// API: Get messages
app.get('/api/messages', (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  res.json(data.messages);
});

// API: Add message
app.post('/api/messages', (req, res) => {
  const { text, type } = req.body;
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  
  const newMessage = {
    id: Date.now(),
    text,
    type: type || 'user',
    createdAt: new Date().toISOString()
  };
  
  data.messages.push(newMessage);
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  res.json(newMessage);
});

// API: Stats for dashboard
app.get('/api/stats', (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const tasks = data.tasks;
  
  res.json({
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    byPriority: {
      high: tasks.filter(t => t.priority === 'high' && !t.completed).length,
      normal: tasks.filter(t => t.priority === 'normal' && !t.completed).length,
      low: tasks.filter(t => t.priority === 'low' && !t.completed).length
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Dashboard running at http://localhost:${PORT}`);
  console.log(`Telegram notifications: ${TELEGRAM_BOT_TOKEN ? 'enabled' : 'disabled (set TELEGRAM_BOT_TOKEN)'}`);
});
