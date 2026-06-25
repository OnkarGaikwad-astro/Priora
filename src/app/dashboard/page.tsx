"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Brain, Target, ShieldAlert, CheckCircle2, Circle, X, Loader2, Calendar, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useAppContext, Task } from "@/context/AppContext";

export default function DashboardPage() {
  const { tasks, addTask, toggleTaskStatus, editTask, deleteTask } = useAppContext();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isRescueMode, setIsRescueMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("General");
  const [newTaskPriority, setNewTaskPriority] = useState("Medium");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");

  const handleGeneratePlan = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      showToast("AI Plan Generated Successfully!");
    }, 2000);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    addTask({
      id: Date.now(),
      title: newTaskTitle,
      status: "todo",
      category: newTaskCategory,
      est: "Est. 1h",
      priority: newTaskPriority,
      isCritical: newTaskPriority === "High",
      deadline: newTaskDeadline || undefined
    });
    
    setNewTaskTitle("");
    setNewTaskDeadline("");
    setIsModalOpen(false);
    showToast("Task Added!");
  };

  const handleEditTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editingTask.title.trim()) return;
    editTask(editingTask.id, {
      title: editingTask.title,
      category: editingTask.category,
      priority: editingTask.priority,
      deadline: editingTask.deadline || undefined
    });
    setEditingTask(null);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-[var(--color-status-success)] text-white px-6 py-3 rounded-full shadow-[var(--shadow-skeuo)] font-medium flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Task Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[var(--color-bg-card)] rounded-[var(--radius-skeuo)] shadow-[var(--shadow-skeuo)] p-6 relative"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-heading text-[var(--color-text-heading)] mb-6">Add New Task</h2>
              <form onSubmit={handleAddTask} className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium text-[var(--color-text-secondary)] mb-1 block">Task Name</label>
                  <input 
                    type="text" 
                    autoFocus
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-main)] border-2 border-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-colors text-[var(--color-text-primary)]"
                    placeholder="E.g., Complete System Design doc..."
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-[var(--color-text-secondary)] mb-1 block">Category</label>
                    <select 
                      value={newTaskCategory}
                      onChange={(e) => setNewTaskCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-main)] border-2 border-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none text-[var(--color-text-primary)]"
                    >
                      <option value="General">General</option>
                      <option value="Coding">Coding</option>
                      <option value="Work">Work</option>
                      <option value="Health">Health</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium text-[var(--color-text-secondary)] mb-1 block">Priority</label>
                    <select 
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-main)] border-2 border-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none text-[var(--color-text-primary)]"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--color-text-secondary)] mb-1 block">Deadline (Optional)</label>
                  <input 
                    type="datetime-local" 
                    value={newTaskDeadline}
                    onChange={(e) => setNewTaskDeadline(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-main)] border-2 border-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-colors text-[var(--color-text-primary)]"
                  />
                </div>
                <button 
                  type="submit"
                  className="mt-2 w-full py-3 rounded-xl bg-[var(--color-primary)] text-[var(--color-accent)] font-semibold shadow-[var(--shadow-skeuo)] hover:shadow-[var(--shadow-skeuo-hover)] transition-all"
                >
                  Create Task
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Task Modal */}
      <AnimatePresence>
        {editingTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[var(--color-bg-card)] rounded-[var(--radius-skeuo)] shadow-[var(--shadow-skeuo)] p-6 relative"
            >
              <button onClick={() => setEditingTask(null)} className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-heading text-[var(--color-text-heading)] mb-6">Edit Task</h2>
              <form onSubmit={handleEditTaskSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium text-[var(--color-text-secondary)] mb-1 block">Task Name</label>
                  <input 
                    type="text" 
                    autoFocus
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-main)] border-2 border-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-colors text-[var(--color-text-primary)]"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-[var(--color-text-secondary)] mb-1 block">Category</label>
                    <select 
                      value={editingTask.category}
                      onChange={(e) => setEditingTask({...editingTask, category: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-main)] border-2 border-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none text-[var(--color-text-primary)]"
                    >
                      <option value="General">General</option>
                      <option value="Coding">Coding</option>
                      <option value="Work">Work</option>
                      <option value="Health">Health</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium text-[var(--color-text-secondary)] mb-1 block">Priority</label>
                    <select 
                      value={editingTask.priority}
                      onChange={(e) => setEditingTask({...editingTask, priority: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-main)] border-2 border-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none text-[var(--color-text-primary)]"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--color-text-secondary)] mb-1 block">Deadline (Optional)</label>
                  <input 
                    type="datetime-local" 
                    value={editingTask.deadline || ""}
                    onChange={(e) => setEditingTask({...editingTask, deadline: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-main)] border-2 border-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-colors text-[var(--color-text-primary)]"
                  />
                </div>
                <button 
                  type="submit"
                  className="mt-2 w-full py-3 rounded-xl bg-[var(--color-primary)] text-[var(--color-accent)] font-semibold shadow-[var(--shadow-skeuo)] hover:shadow-[var(--shadow-skeuo-hover)] transition-all"
                >
                  Save Changes
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dashboard Header */}
      <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl text-[var(--color-text-heading)] mb-2">Good Morning, Alex</h1>
          <p className="text-[var(--color-text-secondary)] font-sans">Ready to conquer today's priorities?</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleGeneratePlan}
            disabled={isGenerating}
            className="px-5 py-2.5 rounded-[var(--radius-skeuo)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)] font-medium text-sm shadow-[var(--shadow-skeuo)] hover:shadow-[var(--shadow-skeuo-hover)] transition-all flex items-center gap-2 disabled:opacity-70"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 text-[var(--color-primary)] animate-spin" /> : <Brain className="w-4 h-4 text-[var(--color-primary)]" />}
            {isGenerating ? "Analyzing..." : "Generate Plan"}
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-[var(--radius-skeuo)] bg-[#8BB2B5] text-white font-medium text-sm shadow-[var(--shadow-skeuo)] hover:shadow-[var(--shadow-skeuo-hover)] transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </header>

      {/* Mission Control Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Productivity Score */}
        <div className="bg-[var(--color-cream)]/90 backdrop-blur-md rounded-[var(--radius-skeuo)] p-6 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.9),inset_-2px_-2px_6px_rgba(0,0,0,0.05),var(--shadow-skeuo)] border border-white/40 hover:shadow-[var(--shadow-skeuo-hover)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">Productivity Score</h3>
            <div className="w-8 h-8 rounded-full bg-[var(--color-bg-elevated)] shadow-[var(--shadow-skeuo-inset)] flex items-center justify-center">
              <Target className="w-4 h-4 text-[var(--color-status-success)]" />
            </div>
          </div>
          <div className="flex items-end gap-3">
            <span className="font-heading text-5xl text-[var(--color-text-heading)]">84</span>
            <span className="text-sm text-[var(--color-status-success)] font-medium mb-1">+12% this week</span>
          </div>
        </div>

        {/* Focus Hours */}
        <div className="bg-[var(--color-cream)]/90 backdrop-blur-md rounded-[var(--radius-skeuo)] p-6 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.9),inset_-2px_-2px_6px_rgba(0,0,0,0.05),var(--shadow-skeuo)] border border-white/40 hover:shadow-[var(--shadow-skeuo-hover)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">Focus Hours</h3>
            <div className="w-8 h-8 rounded-full bg-[var(--color-bg-elevated)] shadow-[var(--shadow-skeuo-inset)] flex items-center justify-center">
              <div className="w-3 h-3 rounded-full border-2 border-[var(--color-primary)]"></div>
            </div>
          </div>
          <div className="flex items-end gap-3">
            <span className="font-heading text-5xl text-[var(--color-text-heading)]">3.5</span>
            <span className="text-sm text-[var(--color-text-muted)] font-medium mb-1">/ 5 hrs targeted</span>
          </div>
        </div>

        {/* Risk Alerts */}
        <div className={`backdrop-blur-sm rounded-[var(--radius-skeuo)] p-6 transition-all duration-300 border ${isRescueMode ? 'bg-[var(--color-status-danger)]/10 shadow-[var(--shadow-skeuo)] border-[var(--color-status-danger)]' : 'bg-[var(--color-cadet-blue)]/15 shadow-[var(--shadow-skeuo-inset)] border-[var(--color-primary)]/20 hover:shadow-[var(--shadow-skeuo)] hover:-translate-y-1'}`}>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">Risk Alerts</h3>
            <div className="w-8 h-8 rounded-full bg-[var(--color-status-danger)]/10 flex items-center justify-center animate-pulse">
              <ShieldAlert className="w-4 h-4 text-[var(--color-status-danger)]" />
            </div>
          </div>
          <div>
            <p className="text-sm text-[var(--color-text-primary)] font-medium">1 Deadline in Danger</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Hackathon Vibe2Ship needs attention.</p>
            <button 
              onClick={() => {
                setIsRescueMode(!isRescueMode);
                if (!isRescueMode) showToast("Rescue Mode Activated!");
              }}
              className={`mt-4 text-xs font-medium px-3 py-1.5 rounded-full shadow-[var(--shadow-skeuo)] transition-colors ${isRescueMode ? 'bg-[var(--color-bg-card)] text-[var(--color-status-danger)]' : 'bg-[var(--color-status-danger)] text-white'}`}
            >
              {isRescueMode ? "Deactivate" : "Activate Rescue Mode"}
            </button>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-2xl text-[var(--color-text-heading)]">Today's Priorities</h2>
          <Link href="/dashboard/tasks" className="text-sm font-medium text-[var(--color-primary)] hover:underline">View All</Link>
        </div>

        <div className="flex flex-col gap-4">
          <AnimatePresence>
            {tasks.map(task => (
              <motion.div 
                key={task.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`group bg-[var(--color-cadet-blue)]/15 backdrop-blur-sm rounded-[var(--radius-skeuo)] p-5 shadow-[var(--shadow-skeuo)] hover:shadow-[var(--shadow-skeuo-hover)] transition-all flex items-center justify-between border-l-4 ${task.status === 'done' ? 'border-[var(--color-status-success)] opacity-60' : task.isCritical ? 'border-[var(--color-status-danger)]' : 'border-[var(--color-primary)]'}`}
              >
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => toggleTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done')}
                    className={`transition-colors ${task.status === 'done' ? 'text-[var(--color-status-success)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-status-success)]'}`}
                  >
                    {task.status === 'done' ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                  </button>
                  <div>
                    <h4 className={`font-medium text-lg transition-all ${task.status === 'done' ? 'text-[var(--color-text-muted)] line-through' : 'text-[var(--color-text-primary)]'}`}>
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full bg-[var(--color-bg-elevated)] shadow-[var(--shadow-skeuo-inset)] text-[var(--color-text-muted)]`}>
                        {task.category}
                      </span>
                      {task.deadline && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-status-danger)]/10 text-[var(--color-status-danger)] font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Due: {task.deadline}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] text-[var(--color-text-muted)]">{task.priority} Priority</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setEditingTask(task)} 
                      className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteTask(task.id)} 
                      className="text-[var(--color-text-muted)] hover:text-[var(--color-status-danger)] transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {tasks.length === 0 && (
            <p className="text-[var(--color-text-muted)] text-center py-8">No tasks yet! Click "Add Task" to create one.</p>
          )}
        </div>
      </div>
    </div>
  );
}
