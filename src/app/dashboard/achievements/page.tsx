"use client";

import { Trophy, Star, Target, Zap, Clock, ShieldCheck, Lock, Flame, Timer, Brain, Medal, Award, Crown } from "lucide-react";

import { useAppContext } from "@/context/AppContext";

export default function AchievementsPage() {
  const { tasks, habits, focusSecondsToday, prodScore } = useAppContext();

  const completedTasksCount = tasks.filter(t => t.status === 'done').length;
  const totalHabitStreak = habits.reduce((acc, curr) => acc + curr.streak, 0);

  // Calculate total XP using tasks, habits, and focus time
  const totalScore = (completedTasksCount * 50) + (totalHabitStreak * 100) + Math.floor(focusSecondsToday / 60) * 2;

  const achievements = [
    { id: 1, title: "Productivity Rookie", desc: "Complete your first task", icon: Clock, unlocked: completedTasksCount >= 1, color: "text-[var(--color-status-warning)]", bg: "bg-[var(--color-status-warning)]/10" },
    { id: 2, title: "Task Master", desc: "Complete 5 tasks", icon: Target, unlocked: completedTasksCount >= 5, color: "text-[var(--color-status-danger)]", bg: "bg-[var(--color-status-danger)]/10" },
    { id: 3, title: "Habit Builder", desc: "Achieve a 5-day habit streak", icon: Flame, unlocked: totalHabitStreak >= 5, color: "text-[var(--color-status-success)]", bg: "bg-[var(--color-status-success)]/10" },
    { id: 4, title: "AI Strategist", desc: "Use the AI Planner (Mock)", icon: Zap, unlocked: true, color: "text-[var(--color-primary)]", bg: "bg-[var(--color-primary)]/10" },
    { id: 5, title: "Consistency", desc: "Achieve a 20-day habit streak", icon: ShieldCheck, unlocked: totalHabitStreak >= 20, color: "text-purple-500", bg: "bg-purple-500/10" },
    { id: 6, title: "Perfectionist", desc: "Complete 20 tasks", icon: Star, unlocked: completedTasksCount >= 20, color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: 7, title: "Deep Worker", desc: "Focus for 2 hours today", icon: Timer, unlocked: focusSecondsToday >= 7200, color: "text-teal-500", bg: "bg-teal-500/10" },
    { id: 8, title: "Hyperfocused", desc: "Focus for 5 hours today", icon: Brain, unlocked: focusSecondsToday >= 18000, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { id: 9, title: "Unstoppable", desc: "Reach 100 Productivity Score", icon: Medal, unlocked: prodScore >= 100, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { id: 10, title: "The Finisher", desc: "Complete 50 tasks", icon: Award, unlocked: completedTasksCount >= 50, color: "text-rose-500", bg: "bg-rose-500/10" },
    { id: 11, title: "Streak Legend", desc: "Achieve a 50-day habit streak", icon: Flame, unlocked: totalHabitStreak >= 50, color: "text-amber-500", bg: "bg-amber-500/10" },
    { id: 12, title: "High Scorer", desc: "Reach 5,000 XP", icon: Crown, unlocked: totalScore >= 5000, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  ];

  return (
    <div className="flex flex-col gap-8 h-full max-w-6xl mx-auto w-full">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="font-heading text-4xl text-[var(--color-text-heading)] mb-2">Trophy Room</h1>
          <p className="text-[var(--color-text-secondary)] font-sans">Celebrate your milestones.</p>
        </div>
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-[var(--color-status-warning)]" />
          <div className="flex flex-col">
            <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase">Total Score</span>
            <span className="text-xl font-heading text-[var(--color-text-primary)]">{totalScore} XP</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map(ach => {
          const Icon = ach.unlocked ? ach.icon : Lock;
          return (
            <div 
              key={ach.id} 
              className={`rounded-[var(--radius-skeuo)] p-6 flex flex-col items-center text-center transition-all duration-300 ${ach.unlocked ? 'bg-[var(--color-cream)]/90 backdrop-blur-md shadow-[inset_2px_2px_4px_rgba(255,255,255,0.9),inset_-2px_-2px_6px_rgba(0,0,0,0.05),var(--shadow-skeuo)] border border-white/40 hover:-translate-y-2 hover:shadow-[var(--shadow-skeuo-hover)]' : 'bg-[var(--color-bg-main)]/50 shadow-[var(--shadow-skeuo-inset)] opacity-60 grayscale'}`}
            >
              <div className={`w-20 h-20 rounded-full mb-4 flex items-center justify-center ${ach.bg} shadow-[var(--shadow-skeuo-inset)] relative overflow-hidden`}>
                {ach.unlocked && <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 transform -skew-x-12 translate-x-[-100%] animate-[shimmer_3s_infinite]"></div>}
                <Icon className={`w-10 h-10 ${ach.color}`} />
              </div>
              <h3 className="font-semibold text-lg text-[var(--color-text-primary)] mb-1">{ach.title}</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">{ach.desc}</p>
              
              {ach.unlocked && (
                <div className="mt-4 px-3 py-1 bg-[var(--color-bg-elevated)] rounded-full text-xs font-medium text-[var(--color-primary)] shadow-[var(--shadow-skeuo-inset)]">
                  Unlocked
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  );
}
