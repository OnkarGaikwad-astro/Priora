"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Brain, Target, ShieldAlert, CheckCircle2, Circle, X, Loader2, Calendar, Edit2, Trash2, Play, Activity } from "lucide-react";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useAppContext, Task } from "@/context/AppContext";
import { formatDeadline } from "@/lib/utils";

export default function DashboardPage() {
  const { user, tasks, addTask, toggleTaskStatus, editTask, deleteTask, habits, focusState, focusSecondsToday, sessionFocusSeconds, targetFocusHours, setTargetFocusHours, weeklyStats, prodScore } = useAppContext();
  
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [tempTarget, setTempTarget] = useState(targetFocusHours.toString());
  
  const [localTimeLeft, setLocalTimeLeft] = useState(focusState.remainingTime);
  
  useEffect(() => {
    if (focusState.isActive && focusState.endTime) {
      const now = Date.now();
      const initialDiff = Math.max(0, Math.floor((focusState.endTime - now) / 1000));
      setLocalTimeLeft(initialDiff);

      const interval = setInterval(() => {
        const now = Date.now();
        const diff = Math.max(0, Math.floor((focusState.endTime! - now) / 1000));
        setLocalTimeLeft(diff);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setLocalTimeLeft(focusState.remainingTime);
    }
  }, [focusState.isActive, focusState.endTime, focusState.remainingTime]);
  
  const inProgressTask = tasks.find(t => t.status === "in-progress");
  const topTask = inProgressTask || tasks.find(t => t.status !== "done") || null;
  
  const fillPercentage = targetFocusHours > 0 
    ? Math.min(100, (focusSecondsToday / (targetFocusHours * 3600)) * 100)
    : 0;
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isRescueMode, setIsRescueMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("General");
  const [newTaskPriority, setNewTaskPriority] = useState("Medium");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");

  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [aiPlanData, setAiPlanData] = useState<{ summary: string; suggestedOrder: number[] } | null>(null);

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tasks, 
          targetFocusHours,
          currentDate: new Date().toISOString()
        })
      });
      const data = await res.json();
      setAiPlanData(data);
      setIsPlanModalOpen(true);
    } catch (err) {
      showToast("Failed to connect to AI.");
    } finally {
      setIsGenerating(false);
    }
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

      {/* AI Plan Modal */}
      <AnimatePresence>
        {isPlanModalOpen && aiPlanData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[var(--color-bg-card)] rounded-[var(--radius-skeuo)] shadow-[var(--shadow-skeuo)] p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-status-success)]"></div>
              <button onClick={() => setIsPlanModalOpen(false)} className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center shadow-[var(--shadow-skeuo-inset)]">
                  <Brain className="w-5 h-5 text-[var(--color-primary)]" />
                </div>
                <h2 className="text-2xl font-heading text-[var(--color-text-heading)]">Your AI Daily Plan</h2>
              </div>
              
              <p className="text-[var(--color-text-primary)] text-sm mb-6 leading-relaxed bg-[var(--color-primary)]/5 p-4 rounded-xl border border-[var(--color-primary)]/20 shadow-[var(--shadow-skeuo-inset)]">
                "{aiPlanData.summary}"
              </p>

              <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">Recommended Order</h3>
              
              <div className="flex flex-col gap-3 max-h-[40vh] overflow-y-auto pr-2">
                {aiPlanData.suggestedOrder.length > 0 ? (
                  aiPlanData.suggestedOrder.map((taskId, idx) => {
                    const task = tasks.find(t => t.id === taskId);
                    if (!task) return null;
                    return (
                      <div key={task.id} className="flex items-center gap-4 bg-[var(--color-bg-elevated)] p-3 rounded-xl border border-[var(--color-primary)]/10 shadow-[var(--shadow-skeuo)]">
                        <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{task.title}</p>
                          <p className="text-[10px] text-[var(--color-text-muted)]">{task.priority} Priority • {task.est}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-[var(--color-text-muted)] italic">No pending tasks to plan!</p>
                )}
              </div>

              <button 
                onClick={() => setIsPlanModalOpen(false)}
                className="mt-6 w-full py-3 rounded-xl bg-[var(--color-primary)] text-[var(--color-accent)] font-semibold shadow-[var(--shadow-skeuo)] hover:shadow-[var(--shadow-skeuo-hover)] transition-all"
              >
                Got it, let's go!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dashboard Header */}
      <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl text-[var(--color-text-heading)] mb-2">
            {(() => {
              const hour = new Date().getHours();
              const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
              let name = "Friend";
              if (user?.user_metadata?.full_name) name = user.user_metadata.full_name.split(' ')[0];
              else if (user?.user_metadata?.name) name = user.user_metadata.name.split(' ')[0];
              else if (user?.email) name = user.email.split('@')[0];
              
              // Capitalize first letter of name just in case
              name = name.charAt(0).toUpperCase() + name.slice(1);
              
              return `${greeting}, ${name}`;
            })()}
          </h1>
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
        <div className="bg-[var(--color-cream)]/90 backdrop-blur-md rounded-[var(--radius-skeuo)] p-6 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.9),inset_-2px_-2px_6px_rgba(0,0,0,0.05),var(--shadow-skeuo)] border border-white/40 hover:shadow-[var(--shadow-skeuo-hover)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-full group">
          {/* Subtle animated background orb */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--color-status-success)]/10 rounded-full blur-2xl group-hover:bg-[var(--color-status-success)]/20 transition-all duration-700"></div>
          
          {/* Liquid Wave Background for Productivity Score */}
          <div 
            className="absolute inset-x-0 bottom-0 z-0 pointer-events-none transition-all duration-1000 ease-out"
            style={{ height: `${prodScore}%`, minHeight: prodScore > 0 ? '5%' : '0%' }}
          >
            {/* Wave 1 (Back) */}
            <div className="absolute left-0 right-0 -top-6 h-6 w-[200%] animate-[wave_9s_linear_infinite]">
              <svg className="w-full h-full text-[#10B981] opacity-30" viewBox="0 0 1000 100" preserveAspectRatio="none" fill="currentColor">
                <path d="M0,50 Q125,0 250,50 T500,50 T750,50 T1000,50 L1000,100 L0,100 Z" />
              </svg>
            </div>
            {/* Wave 2 (Front) */}
            <div className="absolute left-0 right-0 -top-8 h-8 w-[200%] animate-[wave_6s_linear_infinite]">
              <svg className="w-full h-full text-[#059669] opacity-40" viewBox="0 0 1000 100" preserveAspectRatio="none" fill="currentColor">
                <path d="M0,50 Q125,100 250,50 T500,50 T750,50 T1000,50 L1000,100 L0,100 Z" />
              </svg>
            </div>
            {/* Liquid Body */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#10B981]/40 to-[#059669]/50"></div>
          </div>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">Productivity Score</h3>
              <div className="w-8 h-8 rounded-full bg-[var(--color-bg-elevated)] shadow-[var(--shadow-skeuo-inset)] flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                <Target className="w-4 h-4 text-[var(--color-status-success)]" />
              </div>
            </div>
            <div className="flex items-end gap-3 mb-6">
              <span className="font-heading text-5xl tabular-nums bg-clip-text text-transparent bg-gradient-to-br from-[#1C2C3A] to-[#6A7F93] tracking-tight">{prodScore}</span>
              <span className="text-sm text-[var(--color-text-muted)] font-medium mb-1.5">/ 100 today</span>
            </div>
          </div>
          <div className="w-full h-32 mt-2 relative z-10">
            {weeklyStats && weeklyStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyStats} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#BDC9D3" opacity={0.5} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#738596', fontSize: 10 }} 
                    tickFormatter={(val) => {
                      const d = new Date(val);
                      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
                    }}
                    dy={5}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#738596', fontSize: 10 }} 
                    allowDecimals={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="productivity_score" 
                    stroke="#5A7790" 
                    strokeWidth={2} 
                    dot={{ r: 4, fill: '#FFFFFF', stroke: '#5A7790', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#FFFFFF', stroke: '#5A7790', strokeWidth: 2 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#DEE6EC', 
                      borderRadius: '8px', 
                      border: '1px solid #BDC9D3',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      color: '#4A5D70',
                      fontSize: '10px',
                      fontWeight: 500,
                      padding: '4px 8px'
                    }}
                    itemStyle={{ color: '#4A5D70' }}
                    labelFormatter={() => ""}
                    formatter={(value: any) => [`${value}`, 'Score']}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)] text-xs">
                No trend data yet
              </div>
            )}
          </div>
        </div>

        {/* Focus Hours */}
        <div className="bg-[var(--color-cream)]/90 backdrop-blur-md rounded-[var(--radius-skeuo)] p-6 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.9),inset_-2px_-2px_6px_rgba(0,0,0,0.05),var(--shadow-skeuo)] border border-white/40 hover:shadow-[var(--shadow-skeuo-hover)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-full group">
          {/* Subtle animated background orb */}
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[var(--color-primary)]/5 rounded-full blur-3xl group-hover:bg-[var(--color-primary)]/10 transition-all duration-700"></div>

          {/* Liquid Wave Background */}
          <div 
            className="absolute inset-x-0 bottom-0 z-0 pointer-events-none transition-all duration-1000 ease-out"
            style={{ height: `${fillPercentage}%`, minHeight: fillPercentage > 0 ? '5%' : '0%' }}
          >
            {/* Wave 1 (Back) */}
            <div className="absolute left-0 right-0 -top-6 h-6 w-[200%] animate-[wave_8s_linear_infinite]">
              <svg className="w-full h-full text-[#3B82F6] opacity-30" viewBox="0 0 1000 100" preserveAspectRatio="none" fill="currentColor">
                <path d="M0,50 Q125,0 250,50 T500,50 T750,50 T1000,50 L1000,100 L0,100 Z" />
              </svg>
            </div>
            {/* Wave 2 (Front) */}
            <div className="absolute left-0 right-0 -top-8 h-8 w-[200%] animate-[wave_5s_linear_infinite]">
              <svg className="w-full h-full text-[#0EA5E9] opacity-40" viewBox="0 0 1000 100" preserveAspectRatio="none" fill="currentColor">
                <path d="M0,50 Q125,100 250,50 T500,50 T750,50 T1000,50 L1000,100 L0,100 Z" />
              </svg>
            </div>
            {/* Liquid Body */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0EA5E9]/40 to-[#3B82F6]/50"></div>
          </div>

          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">Focus Time</h3>
                <div className="w-8 h-8 rounded-full bg-[var(--color-bg-elevated)] shadow-[var(--shadow-skeuo-inset)] flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                  <div className="w-3 h-3 rounded-full border-2 border-[var(--color-primary)]"></div>
                </div>
              </div>
              
              <div className="flex flex-col gap-6 mb-2">
                <div>
                  <div className="text-xs text-[var(--color-text-muted)] uppercase font-semibold tracking-wider mb-1">Today Total</div>
                  <div className="flex items-end gap-2">
                    <span className="font-heading text-4xl tabular-nums leading-none bg-clip-text text-transparent bg-gradient-to-br from-[#1C2C3A] to-[#6A7F93] tracking-tight">
                      {Math.floor(focusSecondsToday / 3600)}h {Math.floor((focusSecondsToday % 3600) / 60)}m
                    </span>
                    <div className="text-sm text-[var(--color-text-muted)] font-medium mb-1">
                      / 
                      {isEditingTarget ? (
                        <input 
                          type="number" 
                          value={tempTarget}
                          onChange={(e) => setTempTarget(e.target.value)}
                          onBlur={() => {
                            const parsed = parseFloat(tempTarget);
                            if (!isNaN(parsed) && parsed > 0) setTargetFocusHours(parsed);
                            setIsEditingTarget(false);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const parsed = parseFloat(tempTarget);
                              if (!isNaN(parsed) && parsed > 0) setTargetFocusHours(parsed);
                              setIsEditingTarget(false);
                            }
                          }}
                          autoFocus
                          className="w-12 px-1 py-0.5 ml-1 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-primary)]/20 outline-none text-[var(--color-text-primary)]"
                        />
                      ) : (
                        <span className="cursor-pointer hover:text-[var(--color-primary)] underline decoration-dashed underline-offset-2 ml-1" onClick={() => { setTempTarget(targetFocusHours.toString()); setIsEditingTarget(true); }}>
                          {targetFocusHours}h
                        </span>
                      )}
                      {" "}target
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-xs text-[var(--color-primary)]/80 uppercase font-semibold tracking-wider">This Session</div>
                    {/* Live pulsating dot if timer is running */}
                    {focusState.isActive && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                    )}
                  </div>
                  <span className="font-heading text-3xl tabular-nums leading-none bg-clip-text text-transparent bg-gradient-to-br from-[var(--color-primary)] to-blue-500 tracking-tight">
                    {Math.floor(sessionFocusSeconds / 3600)}h {Math.floor((sessionFocusSeconds % 3600) / 60)}m
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>        {/* Weekly Productivity Graph */}
        <div className="bg-[#DEE6EC] rounded-[var(--radius-skeuo)] p-6 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.9),inset_-2px_-2px_6px_rgba(0,0,0,0.05),var(--shadow-skeuo)] relative overflow-hidden flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-semibold text-[#4A5D70]">Focus Time Trend</h3>
              <p className="text-sm text-[#738596]">Total focused today: {Math.floor(focusSecondsToday / 3600)}h {Math.floor((focusSecondsToday % 3600) / 60)}m</p>
            </div>
          </div>
          <div className="flex-1 w-full min-h-[140px]">
            {weeklyStats && weeklyStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={weeklyStats.map(s => ({ ...s, focus_hours: Math.round((s.focus_seconds / 3600) * 2) / 2 }))} 
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#BDC9D3" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#738596', fontSize: 12 }} 
                    tickFormatter={(val) => {
                      const d = new Date(val);
                      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
                    }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#738596', fontSize: 12 }} 
                    tickFormatter={(val) => `${val} hrs`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#DEE6EC', 
                      borderRadius: '8px', 
                      border: '1px solid #BDC9D3',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      color: '#4A5D70',
                      fontSize: '12px',
                      fontWeight: 500
                    }}
                    itemStyle={{ color: '#4A5D70' }}
                    labelFormatter={(val) => new Date(val as string).toLocaleDateString('en-US', {timeZone: 'UTC'})}
                    formatter={(value: any) => [`${value} hrs`, 'Focused Time']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="focus_hours" 
                    stroke="#5A7790" 
                    strokeWidth={3} 
                    dot={{ r: 5, fill: '#FFFFFF', stroke: '#5A7790', strokeWidth: 2 }}
                    activeDot={{ r: 7, fill: '#FFFFFF', stroke: '#5A7790', strokeWidth: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-[#738596]">
                <p className="text-sm">No data available.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task List and Widgets Grid */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Today's Priorities */}
        <div className="lg:col-span-2">
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
                  <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
                    <button 
                      onClick={() => toggleTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done')}
                      className={`shrink-0 transition-colors ${task.status === 'done' ? 'text-[var(--color-status-success)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-status-success)]'}`}
                    >
                      {task.status === 'done' ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <h4 className={`font-medium text-lg truncate transition-all ${task.status === 'done' ? 'text-[var(--color-text-muted)] line-through' : 'text-[var(--color-text-primary)]'}`}>
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-bg-elevated)] shadow-[var(--shadow-skeuo-inset)] text-[var(--color-text-muted)] whitespace-nowrap`}>
                          {task.category}
                        </span>
                        {task.deadline && (() => {
                          const dInfo = formatDeadline(task.deadline);
                          if (!dInfo) return null;
                          const color = dInfo.isOverdue ? 'text-red-500 bg-red-500/10' : dInfo.isUrgent ? 'text-[var(--color-status-warning)] bg-[var(--color-status-warning)]/10' : 'text-[var(--color-text-secondary)] bg-[var(--color-bg-main)]';
                          return (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 whitespace-nowrap ${color}`}>
                              <Calendar className="w-3 h-3" /> Due: {dInfo.text}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <span className="text-[10px] text-[var(--color-text-muted)]">{task.priority} Priority</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setEditingTask(task)} 
                        className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors p-1"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteTask(task.id)} 
                        className="text-[var(--color-text-muted)] hover:text-[var(--color-status-danger)] transition-colors p-1"
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

        {/* Right Column: Quick Widgets */}
        <div className="lg:col-span-1 flex flex-col gap-8">

          {/* Small Risk Alerts */}
          <div className={`backdrop-blur-sm rounded-2xl p-4 transition-all duration-300 border flex items-center justify-between ${isRescueMode ? 'bg-[var(--color-status-danger)]/10 shadow-[var(--shadow-skeuo)] border-[var(--color-status-danger)]' : 'bg-[var(--color-cadet-blue)]/15 shadow-[var(--shadow-skeuo-inset)] border-[var(--color-primary)]/20'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--color-status-danger)]/10 flex items-center justify-center animate-pulse shrink-0">
                <ShieldAlert className="w-5 h-5 text-[var(--color-status-danger)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-primary)] font-medium">1 Deadline in Danger</p>
                <button 
                  onClick={() => {
                    setIsRescueMode(!isRescueMode);
                    if (!isRescueMode) showToast("Rescue Mode Activated!");
                  }}
                  className={`text-[10px] font-semibold transition-colors mt-0.5 ${isRescueMode ? 'text-[var(--color-status-danger)] hover:underline' : 'text-[var(--color-primary)] hover:underline'}`}
                >
                  {isRescueMode ? "DEACTIVATE" : "ACTIVATE RESCUE MODE"}
                </button>
              </div>
            </div>
          </div>
          
          {/* Quick Focus Widget */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl text-[var(--color-text-heading)]">Current Focus</h2>
            </div>
            <div className="bg-[var(--color-cream)]/90 backdrop-blur-md rounded-[var(--radius-skeuo)] p-6 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.9),inset_-2px_-2px_6px_rgba(0,0,0,0.05),var(--shadow-skeuo)] border border-white/40 flex flex-col items-center text-center group transition-all duration-300 hover:shadow-[var(--shadow-skeuo-hover)]">
              {focusState.isActive || (focusState.remainingTime < (focusState.mode === 'focus' ? focusState.focusMinutes * 60 : focusState.breakMinutes * 60) && focusState.remainingTime > 0) ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-[var(--color-bg-main)] flex items-center justify-center mb-4 shadow-[var(--shadow-skeuo-inset)] relative">
                     <div className={`absolute inset-0 rounded-full border-2 ${focusState.mode === 'focus' ? 'border-[var(--color-status-warning)]/30 border-t-[var(--color-status-warning)]' : 'border-[var(--color-status-success)]/30 border-t-[var(--color-status-success)]'} ${focusState.isActive ? 'animate-spin' : ''}`}></div>
                     <span className={`font-heading text-lg ${focusState.mode === 'focus' ? 'text-[var(--color-status-danger)]' : 'text-[var(--color-status-success)]'} tracking-tighter`}>
                       {Math.floor(localTimeLeft / 60).toString().padStart(2, '0')}:{(localTimeLeft % 60).toString().padStart(2, '0')}
                     </span>
                  </div>
                  <h3 className="font-medium text-[var(--color-text-primary)] mb-1 truncate w-full px-4">
                    {focusState.mode === 'focus' ? 'Deep Work' : 'Break Time'}
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] mb-6">{focusState.isActive ? 'Active Session' : 'Paused'}</p>
                  <Link 
                    href="/dashboard/focus" 
                    className="w-full py-3 rounded-xl bg-[var(--color-primary)] text-white font-medium text-sm shadow-[var(--shadow-skeuo)] hover:shadow-[var(--shadow-skeuo-hover)] active:shadow-[var(--shadow-skeuo-inset)] transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" /> {focusState.isActive ? 'View Timer' : 'Resume Session'}
                  </Link>
                </>
              ) : topTask ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-[var(--color-status-danger)]/10 flex items-center justify-center mb-4 shadow-[var(--shadow-skeuo-inset)] group-hover:scale-110 transition-transform duration-300">
                    <Target className="w-6 h-6 text-[var(--color-status-danger)]" />
                  </div>
                  <h3 className="font-medium text-[var(--color-text-primary)] mb-1 truncate w-full px-4">{topTask.title}</h3>
                  <p className="text-xs text-[var(--color-text-muted)] mb-6">{topTask.category} • {topTask.est}</p>
                  <Link 
                    href="/dashboard/focus" 
                    className="w-full py-3 rounded-xl bg-[var(--color-primary)] text-white font-medium text-sm shadow-[var(--shadow-skeuo)] hover:shadow-[var(--shadow-skeuo-hover)] active:shadow-[var(--shadow-skeuo-inset)] transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" /> Start Session
                  </Link>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center mb-4 shadow-[var(--shadow-skeuo-inset)]">
                    <CheckCircle2 className="w-6 h-6 text-[var(--color-status-success)]" />
                  </div>
                  <h3 className="font-medium text-[var(--color-text-primary)] mb-1">All clear!</h3>
                  <p className="text-xs text-[var(--color-text-muted)] mb-6">You have no pending tasks.</p>
                  <button onClick={() => setIsModalOpen(true)} className="text-sm font-medium text-[var(--color-primary)] hover:underline">Add a new task</button>
                </>
              )}
            </div>
          </div>

          {/* Quick Habits Widget */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl text-[var(--color-text-heading)]">Daily Habits</h2>
              <Link href="/dashboard/habits" className="text-sm font-medium text-[var(--color-primary)] hover:underline">View All</Link>
            </div>
            <div className="bg-[var(--color-cadet-blue)]/10 backdrop-blur-sm rounded-[var(--radius-skeuo)] p-5 shadow-[var(--shadow-skeuo-inset)] border border-[var(--color-primary)]/10 flex flex-col gap-4">
              {habits.slice(0, 3).map(habit => {
                const todayIndex = new Date().getDay(); // 0 is Sunday
                const isCompletedToday = habit.days[todayIndex];
                
                return (
                  <div key={habit.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center shadow-[var(--shadow-skeuo-inset)] ${isCompletedToday ? 'bg-[var(--color-status-success)]/20 text-[var(--color-status-success)]' : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]'}`}>
                        <Activity className="w-4 h-4" />
                      </div>
                      <span className={`text-sm font-medium truncate ${isCompletedToday ? 'text-[var(--color-text-secondary)] line-through' : 'text-[var(--color-text-primary)]'}`}>
                        {habit.name}
                      </span>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                       <span className="text-[10px] text-[var(--color-text-muted)] font-medium">🔥 {habit.streak}</span>
                    </div>
                  </div>
                );
              })}
              {habits.length === 0 && (
                <p className="text-xs text-[var(--color-text-muted)] text-center py-4">No habits tracking yet.</p>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
