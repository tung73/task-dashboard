import { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  Plus, Moon, Sun, Book, Phone,
  MessageSquare, FileText, Trash2, RefreshCw,
  Cpu, HardDrive, Activity, X, Play
} from 'lucide-react'
import FileUpload from './components/FileUpload'

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

// Task Detail Modal Component
function TaskDetailModal({ task, onClose, onUpdate, onDelete, dark, fetchTasks }) {
  const [processingResult, setProcessingResult] = useState(null)
  
  // Parse result if exists
  useEffect(() => {
    if (task.result) {
      try {
        setProcessingResult(JSON.parse(task.result))
      } catch (e) {
        console.error('Failed to parse result:', e)
      }
    }
  }, [task.result])

  const handleStatusChange = (status) => {
    onUpdate(task.id, { status })
    fetchTasks()
  }

  const handleEbookComplete = (result) => {
    setProcessingResult(result)
    onUpdate(task.id, { status: 'completed' })
    fetchTasks()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg ${dark ? 'bg-slate-800' : 'bg-white'} p-6`}>
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">{task.title}</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="space-y-4">
          {/* Status Controls */}
          <div className="flex flex-wrap gap-4 items-center">
            <select
              value={task.status}
              onChange={e => handleStatusChange(e.target.value)}
              className="p-2 rounded border bg-transparent"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
            <span className={`px-3 py-1 rounded-full text-xs ${
              task.priority === 'high' ? 'bg-red-500/20 text-red-500' :
              task.priority === 'low' ? 'bg-green-500/20 text-green-500' :
              'bg-blue-500/20 text-blue-500'
            }`}>
              {task.priority} priority
            </span>
            <span className={`px-3 py-1 rounded-full text-xs ${
              task.task_type === 'ebook_summary' ? 'bg-purple-500/20 text-purple-500' :
              task.task_type === 'call' ? 'bg-orange-500/20 text-orange-500' :
              'bg-gray-500/20 text-gray-500'
            }`}>
              {task.task_type}
            </span>
          </div>

          {/* Description */}
          {task.description && (
            <p className={dark ? 'text-slate-300' : 'text-gray-600'}>{task.description}</p>
          )}

          {/* Timestamps */}
          <div className="text-sm text-gray-500">
            <p>Created: {new Date(task.created_at).toLocaleString()}</p>
            {task.started_at && <p>Started: {new Date(task.started_at).toLocaleString()}</p>}
            {task.completed_at && <p>Completed: {new Date(task.completed_at).toLocaleString()}</p>}
          </div>

          {/* Ebook Summary Section */}
          {task.task_type === 'ebook_summary' && (
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Book size={18} /> Ebook Processing
              </h3>
              {!processingResult ? (
                <FileUpload 
                  dark={dark} 
                  taskId={task.id} 
                  onComplete={handleEbookComplete}
                />
              ) : (
                <div className={`p-4 rounded-lg ${dark ? 'bg-slate-700' : 'bg-gray-100'} space-y-3`}>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Title:</span>
                      <span className="ml-2 font-medium">{processingResult.metadata?.title || 'Unknown'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Author:</span>
                      <span className="ml-2">{processingResult.metadata?.author || 'Unknown'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Words:</span>
                      <span className="ml-2">{processingResult.word_count?.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t">
                    <span className="text-gray-500 text-sm">Preview:</span>
                    <p className="text-sm mt-1 line-clamp-6">{processingResult.text?.substring(0, 1500)}...</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Call Section */}
          {task.task_type === 'call' && (
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Phone size={18} /> Call Action
              </h3>
              <button
                onClick={() => {
                  // Trigger call - placeholder for now
                  alert('Call feature coming soon!')
                }}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <Play size={16} /> Initiate Call
              </button>
            </div>
          )}

          {/* Activity Log */}
          {task.logs?.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Activity Log</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {task.logs.map(log => (
                  <div key={log.id} className={`text-sm p-2 rounded ${dark ? 'bg-slate-700' : 'bg-gray-100'}`}>
                    <span className="font-medium">{log.action}</span>
                    <span className="text-gray-500 ml-2">{log.details}</span>
                    <span className="text-gray-400 ml-2 text-xs">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <button
            onClick={() => onDelete(task.id)}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 mt-4"
          >
            <Trash2 size={16} /> Delete Task
          </button>
        </div>
      </div>
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
    
    try {
      const res = await axios.get(`${API}/api/tasks?${params}`)
      setTasks(res.data)
    } catch (e) {
      console.error('Failed to fetch tasks:', e)
    }
  }

  const createTask = async (form) => {
    try {
      await axios.post(`${API}/api/tasks`, form)
      fetchTasks()
    } catch (e) {
      console.error('Failed to create task:', e)
    }
  }

  const updateTaskStatus = async (id, data) => {
    try {
      await axios.patch(`${API}/api/tasks/${id}`, data)
      fetchTasks()
      if (selectedTask?.id === id) {
        const res = await axios.get(`${API}/api/tasks/${id}`)
        setSelectedTask(res.data)
      }
    } catch (e) {
      console.error('Failed to update task:', e)
    }
  }

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API}/api/tasks/${id}`)
      fetchTasks()
      setSelectedTask(null)
    } catch (e) {
      console.error('Failed to delete task:', e)
    }
  }

  // For Search icon import
  const Search = ({ size = 16, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
  )

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 shadow-sm p-4 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold text-primary-500">TaskHub AI</h1>
            <div className="flex items-center gap-4">
              <button 
                onClick={fetchTasks}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <RefreshCw size={20} />
              </button>
              <ThemeToggle dark={dark} setDark={setDark} />
            </div>
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
                onClick={async () => {
                  const res = await axios.get(`${API}/api/tasks/${task.id}`)
                  setSelectedTask(res.data)
                }}
              />
            ))}
          </div>
          
          {tasks.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p>No tasks found</p>
              <p className="text-sm">Create a new task to get started</p>
            </div>
          )}
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
          <TaskDetailModal 
            task={selectedTask} 
            onClose={() => setSelectedTask(null)} 
            onUpdate={updateTaskStatus}
            onDelete={deleteTask}
            dark={dark}
            fetchTasks={fetchTasks}
          />
        )}
      </div>
    </div>
  )
}

export default App
