"use client";

import { Check, Flame, Activity, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";

export default function HabitsPage() {
  const { habits, addHabit, toggleHabitDay, deleteHabit } = useAppContext();
  const [newHabitName, setNewHabitName] = useState("");

  const daysOfWeek = ["M", "T", "W", "T", "F", "S", "S"];

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    addHabit({
      id: Date.now(),
      name: newHabitName,
      category: "General",
      streak: 0,
      days: [false, false, false, false, false, false, false]
    });
    setNewHabitName("");
  };

  const totalStreak = habits.reduce((acc, curr) => acc + curr.streak, 0);

  return (
    <div className="flex flex-col gap-8 h-full max-w-5xl mx-auto w-full">
      <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl text-[var(--color-text-heading)] mb-2">Habits</h1>
          <p className="text-[var(--color-text-secondary)] font-sans">Consistency builds excellence.</p>
        </div>
        <div className="flex items-center gap-2 bg-[var(--color-status-danger)]/10 text-[var(--color-status-danger)] px-4 py-2 rounded-full font-medium shadow-[var(--shadow-skeuo-inset)]">
          <Flame className="w-5 h-5" /> {totalStreak > 0 ? `${totalStreak} Total Streak!` : "Start a Streak"}
        </div>
      </header>

      {/* Add Habit Bar */}
      <form onSubmit={handleAddHabit} className="flex flex-col md:flex-row items-center gap-4">
        <input 
          type="text"
          value={newHabitName}
          onChange={(e) => setNewHabitName(e.target.value)}
          placeholder="E.g., Read 20 pages..."
          className="w-full md:flex-1 px-6 py-4 rounded-full bg-[var(--color-bg-card)] shadow-[var(--shadow-skeuo-inset)] border border-[var(--color-primary)]/20 outline-none text-[var(--color-text-primary)]"
        />
        <button type="submit" className="w-full md:w-auto px-6 py-4 rounded-full bg-[var(--color-primary)] text-[var(--color-accent)] font-semibold shadow-[var(--shadow-skeuo)] hover:shadow-[var(--shadow-skeuo-hover)] transition-all flex items-center justify-center gap-2">
          <Plus className="w-5 h-5" />
          Add Habit
        </button>
      </form>

      <div className="bg-[var(--color-cream)]/80 backdrop-blur-md rounded-[var(--radius-skeuo)] p-6 md:p-8 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.9),inset_-2px_-2px_6px_rgba(0,0,0,0.05),var(--shadow-skeuo)] border border-white/40 overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--color-primary)]/20">
          <h3 className="font-semibold text-[var(--color-text-primary)] text-lg">Weekly Tracker</h3>
          <div className="flex gap-4 items-center">
            {daysOfWeek.map((day, i) => (
              <div key={i} className="w-10 text-center font-medium text-[var(--color-text-muted)] text-sm">{day}</div>
            ))}
            {/* Placeholder to match the delete button's width to keep columns aligned perfectly */}
            <div className="w-6 ml-4"></div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {habits.map(habit => (
            <div key={habit.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-4 w-1/3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-bg-elevated)] shadow-[var(--shadow-skeuo-inset)] flex items-center justify-center">
                  <Activity className="w-5 h-5 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h4 className="font-medium text-[var(--color-text-primary)]">{habit.name}</h4>
                  <span className="text-xs text-[var(--color-text-secondary)]">{habit.category} • <span className="text-[var(--color-status-danger)] font-medium">{habit.streak} day streak</span></span>
                </div>
              </div>

              <div className="flex gap-4 items-center">
                {habit.days.map((isDone, i) => (
                  <button 
                    key={i} 
                    onClick={() => toggleHabitDay(habit.id, i)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isDone ? 'bg-[var(--color-primary)] text-[var(--color-accent)] shadow-[inset_2px_2px_5px_rgba(255,255,255,0.3),var(--shadow-skeuo)]' : 'bg-[var(--color-bg-main)] text-[var(--color-text-muted)]/20 shadow-[var(--shadow-skeuo-inset)] hover:bg-[var(--color-bg-card)]'}`}
                  >
                    <Check className={`w-5 h-5 ${isDone ? 'opacity-100' : 'opacity-0 group-hover:opacity-30'}`} />
                  </button>
                ))}
                <button onClick={() => deleteHabit(habit.id)} className="w-6 ml-4 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center text-[var(--color-text-muted)] hover:text-[var(--color-status-danger)]">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          {habits.length === 0 && (
            <p className="text-[var(--color-text-muted)] text-center py-8">No habits tracked yet. Add one above!</p>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
