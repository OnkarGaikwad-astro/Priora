"use client";

import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, X, Circle, CheckCircle2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { motion, AnimatePresence } from "framer-motion";

export default function CalendarPage() {
  const { tasks, addTask, toggleTaskStatus, deleteTask } = useAppContext();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // State for the Day Detail / Add Task Modal
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("General");
  const [newTaskPriority, setNewTaskPriority] = useState("Medium");
  const [newTaskTime, setNewTaskTime] = useState("");

  // --- Calendar Math ---
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)
  
  // Array of days for padding
  const paddingDays = Array.from({ length: startingDayOfWeek }, (_, i) => i);
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Total cells to make grid full rows
  const totalCells = paddingDays.length + monthDays.length;
  const trailingPaddingDays = Array.from({ length: (7 - (totalCells % 7)) % 7 }, (_, i) => i);

  // Month navigation
  const changeMonth = (delta: number) => {
    setCurrentDate(new Date(year, month + delta, 1));
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Helper to format date consistently to match task deadlines (YYYY-MM-DD)
  const formatDateString = (y: number, m: number, d: number) => {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

  // --- Modal Logic ---
  const handleDayClick = (day: number) => {
    setSelectedDay(new Date(year, month, day));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !selectedDay) return;
    
    const formattedDateString = formatDateString(selectedDay.getFullYear(), selectedDay.getMonth(), selectedDay.getDate());

    const timeSuffix = newTaskTime ? `T${newTaskTime}` : "T17:00";
    
    addTask({
      id: Date.now(),
      title: newTaskTitle,
      status: "todo",
      category: newTaskCategory,
      est: "Est. 1h",
      priority: newTaskPriority,
      isCritical: newTaskPriority === "High",
      deadline: formattedDateString + timeSuffix
    });
    
    setNewTaskTitle("");
    setNewTaskTime("");
  };

  const selectedFormattedDate = selectedDay ? formatDateString(selectedDay.getFullYear(), selectedDay.getMonth(), selectedDay.getDate()) : "";
  const tasksForSelectedDay = tasks.filter(t => t.deadline && t.deadline.split('T')[0] === selectedFormattedDate);

  return (
    <div className="flex flex-col gap-6 h-full w-full max-w-6xl mx-auto">
      
      {/* Day Details / Add Task Modal */}
      <AnimatePresence>
        {selectedDay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[var(--color-bg-card)] rounded-[var(--radius-skeuo)] shadow-[var(--shadow-skeuo)] p-6 relative max-h-[90vh] overflow-y-auto flex flex-col gap-6"
            >
              <button onClick={() => setSelectedDay(null)} className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                <X className="w-5 h-5" />
              </button>
              
              <div>
                <h2 className="text-2xl font-heading text-[var(--color-text-heading)] mb-1">
                  {selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)]">Manage tasks due on this date.</p>
              </div>

              {/* Tasks for the day */}
              <div className="flex flex-col gap-3">
                <h3 className="font-semibold text-sm text-[var(--color-text-primary)]">Tasks Due:</h3>
                {tasksForSelectedDay.map(task => (
                  <div key={task.id} className={`flex items-center gap-3 p-3 rounded-xl border ${task.status === 'done' ? 'bg-[var(--color-bg-main)] opacity-60 border-[var(--color-status-success)]/20' : 'bg-[var(--color-bg-elevated)] border-[var(--color-primary)]/10 shadow-[var(--shadow-skeuo-inset)]'}`}>
                    <button 
                      onClick={() => toggleTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done')}
                      className={`transition-colors ${task.status === 'done' ? 'text-[var(--color-status-success)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-status-success)]'}`}
                    >
                      {task.status === 'done' ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                    </button>
                    <span className={`flex-1 text-sm font-medium ${task.status === 'done' ? 'line-through text-[var(--color-text-muted)]' : 'text-[var(--color-text-primary)]'}`}>
                      {task.title}
                    </span>
                    <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${task.priority === 'High' ? 'bg-[var(--color-status-danger)]/10 text-[var(--color-status-danger)]' : 'bg-[var(--color-bg-main)] text-[var(--color-text-secondary)]'}`}>
                      {task.priority}
                    </span>
                    <button onClick={() => deleteTask(task.id)} className="text-[var(--color-text-muted)] hover:text-[var(--color-status-danger)] transition-colors ml-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {tasksForSelectedDay.length === 0 && (
                  <p className="text-sm text-[var(--color-text-muted)] italic">No tasks due today.</p>
                )}
              </div>

              <div className="h-px bg-[var(--color-primary)]/10 w-full my-2"></div>

              {/* Add New Task Form */}
              <form onSubmit={handleAddTask} className="flex flex-col gap-4">
                <h3 className="font-semibold text-sm text-[var(--color-text-primary)]">Add Task for this Date</h3>
                <div>
                  <input 
                    type="text" 
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-main)] border-2 border-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-colors text-[var(--color-text-primary)]"
                    placeholder="E.g., Client meeting..."
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">Time (Optional)</label>
                  <input 
                    type="time" 
                    value={newTaskTime}
                    onChange={(e) => setNewTaskTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-main)] border-2 border-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-colors text-[var(--color-text-primary)]"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <select value={newTaskCategory} onChange={(e) => setNewTaskCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-main)] border-2 border-[var(--color-primary)]/20 outline-none text-[var(--color-text-primary)] text-sm">
                      <option value="General">General</option>
                      <option value="Work">Work</option>
                      <option value="Coding">Coding</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <select value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-main)] border-2 border-[var(--color-primary)]/20 outline-none text-[var(--color-text-primary)] text-sm">
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full py-3 rounded-xl bg-[var(--color-primary)] text-[var(--color-accent)] font-semibold shadow-[var(--shadow-skeuo)] hover:shadow-[var(--shadow-skeuo-hover)] transition-all flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Schedule
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl text-[var(--color-text-heading)] mb-2">Calendar</h1>
          <p className="text-[var(--color-text-secondary)] font-sans">The big picture of your month.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-[var(--color-bg-card)] px-4 py-2 rounded-full shadow-[var(--shadow-skeuo-inset)] border border-[var(--color-primary)]/10">
          <button onClick={() => changeMonth(-1)} className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"><ChevronLeft className="w-5 h-5" /></button>
          <span className="font-medium text-[var(--color-text-primary)] min-w-[150px] text-center text-lg">{monthNames[month]} {year}</span>
          <button onClick={() => changeMonth(1)} className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </header>

      {/* Full Month Grid */}
      <div className="flex-1 flex flex-col bg-[var(--color-cream)]/50 rounded-[var(--radius-skeuo)] p-6 shadow-[var(--shadow-skeuo)] border border-white/30 overflow-hidden">
        
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 mb-4">
          {dayNames.map(day => (
            <div key={day} className="text-center font-semibold text-sm text-[var(--color-text-secondary)] uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Cells */}
        <div className="flex-1 grid grid-cols-7 gap-3 auto-rows-fr">
          {/* Leading padding */}
          {paddingDays.map(p => (
            <div key={`pad-start-${p}`} className="rounded-2xl bg-[var(--color-bg-main)]/20 border border-[var(--color-primary)]/5 opacity-50"></div>
          ))}

          {/* Actual Month Days */}
          {monthDays.map(day => {
            const dateStr = formatDateString(year, month, day);
            const dayTasks = tasks.filter(t => t.deadline && t.deadline.split('T')[0] === dateStr);
            const isToday = new Date().toISOString().split('T')[0] === dateStr;

            return (
              <button 
                key={day} 
                onClick={() => handleDayClick(day)}
                className={`relative flex flex-col p-2 min-h-[80px] md:min-h-[120px] items-start justify-start rounded-2xl transition-all duration-300 text-left hover:-translate-y-1 ${isToday ? 'bg-[var(--color-cream)] border-2 border-[var(--color-primary)]/30 shadow-[var(--shadow-skeuo)]' : 'bg-[var(--color-bg-card)]/80 backdrop-blur-sm shadow-[var(--shadow-skeuo-inset)] hover:shadow-md border border-[var(--color-primary)]/10'}`}
              >
                <span className={`text-sm font-semibold mb-1 ml-1 ${isToday ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-primary)]'}`}>
                  {day}
                </span>

                {/* Task Indicators */}
                <div className="flex flex-col gap-1 w-full mt-1 overflow-y-auto max-h-[80px] no-scrollbar">
                  {dayTasks.map((t, idx) => (
                    <div key={idx} className={`text-[10px] truncate px-1.5 py-0.5 rounded-md font-medium text-white shadow-sm ${t.status === 'done' ? 'bg-[var(--color-status-success)]/80 line-through' : t.isCritical ? 'bg-[var(--color-status-danger)]' : 'bg-[var(--color-primary)]'}`}>
                      {t.title}
                    </div>
                  ))}
                </div>
              </button>
            );
          })}

          {/* Trailing padding */}
          {trailingPaddingDays.map(p => (
            <div key={`pad-end-${p}`} className="rounded-2xl bg-[var(--color-bg-main)]/20 border border-[var(--color-primary)]/5 opacity-50"></div>
          ))}
        </div>

      </div>
    </div>
  );
}
