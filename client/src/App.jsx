import { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  Layout, Plus, Search, Filter, Moon, Sun, 
  CheckCircle, Clock, AlertCircle, Book, Phone,
  MessageSquare, FileText, Trash2, Upload, RefreshCw,
  Cpu, HardDrive, Activity, X
} from 'lucide-react'

const API = ''

// Theme Toggle Component
function ThemeToggle({ dark, setDark }) {
  return (
    <button
      onClick={() => setDark(!dark)}
      className="p-2 rounded-lg bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
    >
      {dark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  )
}

// System Status Component
function SystemStatus({ dark }) {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchStatus = async () => {
    try {
      const res = await axios.get(`${API}/api/system`)
      setStatus(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="animate-pulse h-20 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>

  return (
    <div className={`p-4 rounded-lg ${dark ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <Activity size={18} /> System Status
      </h3>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <Cpu size={14} className="text-primary-500" />
          <span>CPU: {status?.cpu?.load}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span>RAM: {status?.memory?.percent}%</span>
        </div>
        <div className="flex items-center gap-2">
          <HardDrive size={14} className="text-green-500" />
          <span>Disk: {status?.disk?.percent}%</span>
        </div>
        <div>Uptime: {status?.uptime}</div>
      </div>
    </div>
  )
}

// Stats Cards Component
function StatsCards({ dark }) {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    axios.get(`${API}/api/stats`).then(res => setStats(res.data))
  }, [])

  const cards = [
    { label: 'Total', value: stats?.total || 0, color: 'bg-primary-500' },
    { label: 'Pending', value: stats?.byStatus?.pending || 0, color: 'bg-yellow-500' },
    { label: 'In Progress', value: stats?.byStatus?.in_progress || 0, color: 'bg-blue-500' },
    { label: 'Completed', value: stats?.byStatus?.completed || 0, color: 'bg-green-500' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map(card => (
        <div key={card.label} className={`p-4 rounded-lg ${dark ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
          <div className={`w-2 h-2 rounded-full ${card.color} mb-2`}></div>
          <div className="text-2xl font-bold">{card.value}</div>
          <div className="text-sm text-gray-500">{card.label}</div>
        </div>
      ))}
    </div>
  )
}

// Task Form Component
function TaskForm({ onSubmit, onClose, dark }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    task_type: 'general',
    priority: 'normal',
    category: 'general'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-md rounded-lg ${dark ? 'bg-slate-800' : 'bg-white'} p-6`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">New Task</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Task title"
            value={form.title}
            onChange={e => setForm({...form, title: e.target.value})}
            className="w-full p-3 rounded-lg border bg-transparent"
            required
          />
          <textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={e => setForm({...form, description: e.target.value})}
            className="w-full p-3 rounded-lg border bg-transparent"
            rows={3}
          />
          <div className="grid grid-cols-2 gap-4">
            <select
              value={form.task_type}
              onChange={e => setForm({...form, task_type: e.target.value})}
              className="p-3 rounded-lg border bg-transparent"
            >
              <option value="general">General</option>
              <option value="ebook_summary">Ebook Summary</option>
              <option value="message">Message</option>
              <option value="command">Command</option>
              <option value="research">Research</option>
              <option value="call">Call</option>
            </select>
            <select
              value={form.priority}
              onChange={e => setForm({...form, priority: e.target.value})}
              className="p-3 rounded-lg border bg-transparent"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>
          <button type="submit" className="w-full py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600">
            Create Task
          </button>
        </form>
      </div>
    </div>
  )
}

// Task Card Component
function TaskCard({ task, onClick, dark }) {
  const icons = {
    general: <FileText size={16} />,
    ebook_summary: <Book size={16} />,
    message: <MessageSquare size={16} />,
    command: <Activity size={16} />,
    research: <Search size={16} />,
    call: <Phone size={16} />
  }

  const statusColors = {
    pending: 'bg-yellow-500',
    in_progress: 'bg-blue-500',
    completed: 'bg-green-500',
    failed: 'bg-red-500'
  }

  const priorityColors = {
    low: 'text-green-500',
    normal: 'text-blue-500',
    high: 'text-red-500'
  }

  return (
    <div 
      onClick={onClick}
      className={`p-4 rounded-lg ${dark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:bg-gray-50'} shadow-sm cursor-pointer transition-colors`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className={`p-1 rounded ${dark ? 'bg-slate-700' : 'bg-gray-100'}`}>
            {icons[task.task_type] || <FileText size={16} />}
          </span>
          <span className={`w-2 h-2 rounded-full ${statusColors[task.status]}`}></span>
        </div>
        <span className={`text-xs ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
      </div>
      <h3 className="font-semibold mt-2">{task.title}</h3>
      {task.description && (
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
      )}
      <div className="text-xs text-gray-400 mt-2">
        {new Date(task.created_at).toLocaleDateString()}
      </div>
    </div>
  )
}

// File Upload Component
function FileUpload({ dark, onUpload }) {
  const [uploading, setUploading] = useState(false)

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await axios.post(`${API}/api/upload`, formData)
      onUpload(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={`border-2 border-dashed rounded-lg p-6 text-center ${dark ? 'border-slate-600' : 'border-gray-300'}`}>
      <input 
        type="file" 
        id="file-upload" 
        className="hidden" 
        accept=".epub,.mobi"
        onChange={handleFile}
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <Upload className="mx-auto mb-2" size={32} />
        {uploading ? (
          <p>Uploading...</p>
        ) : (
          <p>Drop ebook here or click to upload</p>
        )}
      </label>
    </div>
  )
}

// Main App Component
function App() {
  const [dark, setDark] = useState(true)
  const [tasks, setTasks] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [filter, setFilter] = useState({ status: '', type: '', search: '' })

  useEffect(() => {
    fetchTasks()
  }, [filter])

  const fetchTasks = async () => {
    const params = new URLSearchParams()
    if (filter.status) params.append('status', filter.status)
    if (filter.type) params.append('type', filter.type)
    if (filter.search) params.append('search', filter.search)
    
    const res = await axios.get(`${API}/api/tasks?${params}`)
    setTasks(res.data)
  }

  const createTask = async (form) => {
    await axios.post(`${API}/api/tasks`, form)
    fetchTasks()
  }

  const updateTaskStatus = async (id, status) => {
    await axios.patch(`${API}/api/tasks/${id}`, { status })
    fetchTasks()
    if (selectedTask?.id === id) {
      const res = await axios.get(`${API}/api/tasks/${id}`)
      setSelectedTask(res.data)
    }
  }

  const deleteTask = async (id) => {
    await axios.delete(`${API}/api/tasks/${id}`)
    fetchTasks()
    setSelectedTask(null)
  }

  return (
    <div className={`min-h-screen ${dark ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 shadow-sm p-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold text-primary-500">TaskHub AI</h1>
            <ThemeToggle dark={dark} setDark={setDark} />
          </div>
        </header>

        <main className="max-w-6xl mx-auto p-4 space-y-6">
          {/* System Status */}
          <SystemStatus dark={dark} />

          {/* Stats */}
          <StatsCards dark={dark} />

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search tasks..."
                value={filter.search}
                onChange={e => setFilter({...filter, search: e.target.value})}
                className="w-full p-3 rounded-lg border bg-white dark:bg-slate-800"
              />
            </div>
            <select
              value={filter.status}
              onChange={e => setFilter({...filter, status: e.target.value})}
              className="p-3 rounded-lg border bg-white dark:bg-slate-800"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
            <select
              value={filter.type}
              onChange={e => setFilter({...filter, type: e.target.value})}
              className="p-3 rounded-lg border bg-white dark:bg-slate-800"
            >
              <option value="">All Types</option>
              <option value="general">General</option>
              <option value="ebook_summary">Ebook Summary</option>
              <option value="message">Message</option>
              <option value="call">Call</option>
            </select>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600"
            >
              <Plus size={20} /> New Task
            </button>
          </div>

          {/* Tasks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                dark={dark}
                onClick={() => setSelectedTask(task)}
              />
            ))}
          </div>
        </main>

        {/* New Task Form Modal */}
        {showForm && (
          <TaskForm 
            onSubmit={createTask} 
            onClose={() => setShowForm(false)} 
            dark={dark}
          />
        )}

        {/* Task Detail Modal */}
        {selectedTask && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg ${dark ? 'bg-slate-800' : 'bg-white'} p-6`}>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">{selectedTask.title}</h2>
                <button onClick={() => setSelectedTask(null)}><X size={20} /></button>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <select
                    value={selectedTask.status}
                    onChange={e => updateTaskStatus(selectedTask.id, e.target.value)}
                    className="p-2 rounded border bg-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                  <span className="p-2">{selectedTask.priority} priority</span>
                  <span className="p-2">{selectedTask.task_type}</span>
                </div>

                {selectedTask.description && (
                  <p>{selectedTask.description}</p>
                )}

                {/* File Upload for Ebook Summary */}
                {selectedTask.task_type === 'ebook_summary' && (
                  <FileUpload dark={dark} onUpload={(file) => console.log(file)} />
                )}

                {/* Logs */}
                {selectedTask.logs?.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Activity Log</h3>
                    <div className="space-y-2">
                      {selectedTask.logs.map(log => (
                        <div key={log.id} className={`text-sm p-2 rounded ${dark ? 'bg-slate-700' : 'bg-gray-100'}`}>
                          <span className="font-medium">{log.action}</span>
                          <span className="text-gray-500 ml-2">{log.details}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => deleteTask(selectedTask.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  <Trash2 size={16} /> Delete Task
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
