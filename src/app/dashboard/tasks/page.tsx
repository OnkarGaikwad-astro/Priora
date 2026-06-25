"use client";

import { Plus, MoreHorizontal, Circle, CheckCircle2, Clock, X, Calendar, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useAppContext, Task } from "@/context/AppContext";
import { formatDeadline } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function TasksPage() {
  const { tasks, addTask, toggleTaskStatus, deleteTask, editTask } = useAppContext();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("General");
  const [newTaskPriority, setNewTaskPriority] = useState("Medium");
  const [newTaskStatus, setNewTaskStatus] = useState<"todo" | "in-progress" | "done">("todo");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");

  const handleAddMission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    addTask({
      id: Date.now(),
      title: newTaskTitle,
      status: newTaskStatus,
      category: newTaskCategory,
      est: "Est. 2h",
      priority: newTaskPriority,
      isCritical: newTaskPriority === "High",
      deadline: newTaskDeadline || undefined
    });
    
    setNewTaskTitle("");
    setNewTaskDeadline("");
    setIsModalOpen(false);
  };

  const handleEditTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editingTask.title.trim()) return;
    editTask(editingTask.id, {
      title: editingTask.title,
      category: editingTask.category,
      priority: editingTask.priority,
      status: editingTask.status,
      deadline: editingTask.deadline || undefined
    });
    setEditingTask(null);
  };

  const getTasksByStatus = (status: string) => tasks.filter(t => t.status === status);

  return (
    <div className="flex flex-col gap-8 h-full">
      {/* Add Mission Modal */}
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
              <h2 className="text-2xl font-heading text-[var(--color-text-heading)] mb-6">Add New Mission</h2>
              <form onSubmit={handleAddMission} className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium text-[var(--color-text-secondary)] mb-1 block">Mission Name</label>
                  <input 
                    type="text" 
                    autoFocus
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-main)] border-2 border-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-colors text-[var(--color-text-primary)]"
                    placeholder="E.g., Launch new marketing campaign..."
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-[var(--color-text-secondary)] mb-1 block">Category</label>
                    <select value={newTaskCategory} onChange={(e) => setNewTaskCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-main)] border-2 border-[var(--color-primary)]/20 outline-none text-[var(--color-text-primary)]">
                      <option value="General">General</option>
                      <option value="Coding">Coding</option>
                      <option value="Work">Work</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium text-[var(--color-text-secondary)] mb-1 block">Status</label>
                    <select value={newTaskStatus} onChange={(e) => setNewTaskStatus(e.target.value as any)} className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-main)] border-2 border-[var(--color-primary)]/20 outline-none text-[var(--color-text-primary)]">
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
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
                <button type="submit" className="mt-2 w-full py-3 rounded-xl bg-[var(--color-primary)] text-[var(--color-accent)] font-semibold shadow-[var(--shadow-skeuo)] hover:shadow-[var(--shadow-skeuo-hover)] transition-all">
                  Deploy Mission
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
              <h2 className="text-2xl font-heading text-[var(--color-text-heading)] mb-6">Edit Mission</h2>
              <form onSubmit={handleEditTaskSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium text-[var(--color-text-secondary)] mb-1 block">Mission Name</label>
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
                    <select value={editingTask.category} onChange={(e) => setEditingTask({...editingTask, category: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-main)] border-2 border-[var(--color-primary)]/20 outline-none text-[var(--color-text-primary)]">
                      <option value="General">General</option>
                      <option value="Coding">Coding</option>
                      <option value="Work">Work</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium text-[var(--color-text-secondary)] mb-1 block">Status</label>
                    <select value={editingTask.status} onChange={(e) => setEditingTask({...editingTask, status: e.target.value as any})} className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-main)] border-2 border-[var(--color-primary)]/20 outline-none text-[var(--color-text-primary)]">
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
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
                <button type="submit" className="mt-2 w-full py-3 rounded-xl bg-[var(--color-primary)] text-[var(--color-accent)] font-semibold shadow-[var(--shadow-skeuo)] hover:shadow-[var(--shadow-skeuo-hover)] transition-all">
                  Save Changes
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl text-[var(--color-text-heading)] mb-2">Mission Board</h1>
          <p className="text-[var(--color-text-secondary)] font-sans">Organize and execute your tasks.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-5 py-2.5 rounded-[var(--radius-skeuo)] bg-[#8BB2B5] text-white font-medium text-sm shadow-[var(--shadow-skeuo)] hover:shadow-[var(--shadow-skeuo-hover)] transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Mission
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 items-start">
        {/* To Do Column */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
              <Circle className="w-4 h-4 text-[var(--color-text-muted)]" /> To Do
              <span className="bg-[var(--color-bg-elevated)] text-xs px-2 py-0.5 rounded-full shadow-[var(--shadow-skeuo-inset)]">{getTasksByStatus('todo').length}</span>
            </h3>
          </div>
          {getTasksByStatus("todo").map(task => (
            <div key={task.id} className="bg-[var(--color-cream)]/90 backdrop-blur-md rounded-[var(--radius-skeuo)] p-5 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.9),inset_-2px_-2px_6px_rgba(0,0,0,0.05),var(--shadow-skeuo)] border border-white/40 cursor-grab active:cursor-grabbing hover:-translate-y-1 transition-transform group relative">
              <h4 className="font-medium text-[var(--color-text-primary)] mb-3 pr-6">{task.title}</h4>
              <button onClick={() => toggleTaskStatus(task.id, 'in-progress')} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"><Clock className="w-4 h-4" /></button>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-[var(--color-bg-main)] text-[var(--color-text-secondary)] shadow-[var(--shadow-skeuo-inset)]">{task.category}</span>
                  {task.deadline && (() => {
                    const dInfo = formatDeadline(task.deadline);
                    if (!dInfo) return null;
                    const color = dInfo.isOverdue ? 'text-red-500 bg-red-500/10' : dInfo.isUrgent ? 'text-[var(--color-status-warning)] bg-[var(--color-status-warning)]/10' : 'text-[var(--color-text-secondary)] bg-[var(--color-bg-main)] shadow-[var(--shadow-skeuo-inset)]';
                    return <span className={`text-[10px] flex items-center gap-1 font-medium px-2 py-1 rounded-full ${color}`}><Calendar className="w-3 h-3" /> {dInfo.text}</span>;
                  })()}
                </div>
                <span className={`text-xs font-medium transition-opacity group-hover:opacity-0 ${task.priority === 'High' ? 'text-[var(--color-status-danger)]' : 'text-[var(--color-text-muted)]'}`}>{task.priority}</span>
              </div>
              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 bg-[var(--color-cream)]/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-[var(--shadow-skeuo)] border border-white/50 z-10">
                <button onClick={() => setEditingTask(task)} className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"><Edit2 className="w-4 h-4" /></button>
                <div className="w-px h-4 bg-[var(--color-primary)]/10"></div>
                <button onClick={() => deleteTask(task.id)} className="text-[var(--color-text-muted)] hover:text-[var(--color-status-danger)] transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {getTasksByStatus("todo").length === 0 && <p className="text-sm text-[var(--color-text-muted)] text-center py-4">No tasks.</p>}
        </div>

        {/* In Progress Column */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--color-status-warning)]" /> In Progress
              <span className="bg-[var(--color-bg-elevated)] text-xs px-2 py-0.5 rounded-full shadow-[var(--shadow-skeuo-inset)]">{getTasksByStatus('in-progress').length}</span>
            </h3>
          </div>
          {getTasksByStatus("in-progress").map(task => (
            <div key={task.id} className="bg-[var(--color-cream)]/90 backdrop-blur-md rounded-[var(--radius-skeuo)] p-5 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.9),inset_-2px_-2px_6px_rgba(0,0,0,0.05),var(--shadow-skeuo)] border border-white/40 border-l-4 border-l-[var(--color-status-warning)] cursor-grab active:cursor-grabbing hover:-translate-y-1 transition-transform group relative">
              <h4 className="font-medium text-[var(--color-text-primary)] mb-3 pr-6">{task.title}</h4>
              <button onClick={() => toggleTaskStatus(task.id, 'done')} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-text-muted)] hover:text-[var(--color-status-success)]"><CheckCircle2 className="w-4 h-4" /></button>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-[var(--color-bg-main)] text-[var(--color-text-secondary)] shadow-[var(--shadow-skeuo-inset)]">{task.category}</span>
                  {task.deadline && (() => {
                    const dInfo = formatDeadline(task.deadline);
                    if (!dInfo) return null;
                    const color = dInfo.isOverdue ? 'text-red-500 bg-red-500/10' : dInfo.isUrgent ? 'text-[var(--color-status-warning)] bg-[var(--color-status-warning)]/10' : 'text-[var(--color-text-secondary)] bg-[var(--color-bg-main)] shadow-[var(--shadow-skeuo-inset)]';
                    return <span className={`text-[10px] flex items-center gap-1 font-medium px-2 py-1 rounded-full ${color}`}><Calendar className="w-3 h-3" /> {dInfo.text}</span>;
                  })()}
                </div>
                <span className="text-xs font-medium text-[var(--color-text-muted)] transition-opacity group-hover:opacity-0">{task.priority}</span>
              </div>
              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 bg-[var(--color-cream)]/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-[var(--shadow-skeuo)] border border-white/50 z-10">
                <button onClick={() => setEditingTask(task)} className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"><Edit2 className="w-4 h-4" /></button>
                <div className="w-px h-4 bg-[var(--color-primary)]/10"></div>
                <button onClick={() => deleteTask(task.id)} className="text-[var(--color-text-muted)] hover:text-[var(--color-status-danger)] transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {getTasksByStatus("in-progress").length === 0 && <p className="text-sm text-[var(--color-text-muted)] text-center py-4">No tasks in progress.</p>}
        </div>

        {/* Done Column */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[var(--color-status-success)]" /> Done
              <span className="bg-[var(--color-bg-elevated)] text-xs px-2 py-0.5 rounded-full shadow-[var(--shadow-skeuo-inset)]">{getTasksByStatus('done').length}</span>
            </h3>
          </div>
          {getTasksByStatus("done").map(task => (
            <div key={task.id} className="bg-[var(--color-bg-main)]/50 rounded-[var(--radius-skeuo)] p-5 border border-[var(--color-primary)]/20 shadow-sm opacity-60 group relative">
              <h4 className="font-medium text-[var(--color-text-muted)] line-through mb-3 pr-6">{task.title}</h4>
              <button onClick={() => deleteTask(task.id)} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-text-muted)] hover:text-[var(--color-status-danger)]"><X className="w-4 h-4" /></button>
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-1 rounded-full bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]">{task.category}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
