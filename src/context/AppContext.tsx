"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase, isDbConnected } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export type Task = {
  id: number;
  title: string;
  status: "todo" | "in-progress" | "done";
  category: string;
  est: string;
  priority: string;
  isCritical: boolean;
  deadline?: string;
};

export type Habit = {
  id: number;
  name: string;
  category: string;
  streak: number;
  days: boolean[];
};

export type DailyStat = {
  date: string;
  focus_seconds: number;
  productivity_score: number;
  target_hours: number;
};

export type FocusState = {
  isActive: boolean;
  mode: "focus" | "break";
  endTime: number | null;     // Epoch timestamp when timer should end
  remainingTime: number;      // Seconds remaining (used when paused or initial)
  focusMinutes: number;
  breakMinutes: number;
  selectedTaskId: number | null;
};

type AppContextType = {
  tasks: Task[];
  addTask: (task: Task) => void;
  editTask: (id: number, updatedTask: Partial<Task>) => void;
  toggleTaskStatus: (id: number, newStatus: Task["status"]) => void;
  deleteTask: (id: number) => void;

  habits: Habit[];
  addHabit: (habit: Habit) => void;
  toggleHabitDay: (habitId: number, dayIndex: number) => void;
  deleteHabit: (id: number) => void;

  user: User | null;
  isLoading: boolean;

  focusState: FocusState;
  updateFocusState: (newState: Partial<FocusState>) => void;
  focusSecondsToday: number;
  sessionFocusSeconds: number;
  addFocusSeconds: (seconds: number) => void;
  targetFocusHours: number;
  setTargetFocusHours: (hours: number) => void;

  focusBgImage: string;
  setFocusBgImage: (url: string) => void;

  weeklyStats: DailyStat[];
  prodScore: number;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [focusState, setFocusState] = useState<FocusState>({
    isActive: false,
    mode: "focus",
    endTime: null,
    remainingTime: 25 * 60,
    focusMinutes: 25,
    breakMinutes: 5,
    selectedTaskId: null,
  });
  const [focusSecondsToday, setFocusSecondsToday] = useState(0);
  const [sessionFocusSeconds, setSessionFocusSeconds] = useState(0);
  const [targetFocusHours, setTargetFocusHours] = useState(5);
  const [focusBgImage, setFocusBgImage] = useState("/watercolor_bg.png");
  const [weeklyStats, setWeeklyStats] = useState<DailyStat[]>([]);
  const [currentDateString, setCurrentDateString] = useState(() => new Date().toISOString().split('T')[0]);

  // Load local settings on mount
  useEffect(() => {
    const savedBg = localStorage.getItem("priora_focus_bg");
    if (savedBg) setFocusBgImage(savedBg);
  }, []);

  // Check for day change (midnight rollover)
  useEffect(() => {
    const interval = setInterval(() => {
      const today = new Date().toISOString().split('T')[0];
      if (today !== currentDateString) {
        setCurrentDateString(today);
        setFocusSecondsToday(0); // Reset for the new day
      }
    }, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [currentDateString]);

  // Calculate Productivity Score dynamically (x = ky + z)
  // Focus Time: 60%, Tasks: 25%, Habits: 15%
  const focusScore = targetFocusHours > 0
    ? Math.min(60, (focusSecondsToday / (targetFocusHours * 3600)) * 60)
    : 0;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "done").length;
  const taskScore = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 25;

  const totalHabits = habits.length;
  // Checking day index 0 (Monday or Today depending on week start, standard proxy for daily completion)
  const completedHabits = habits.filter(h => h.days && h.days[0]).length;
  const habitScore = totalHabits === 0 ? 0 : (completedHabits / totalHabits) * 15;

  const prodScore = Math.min(100, Math.round(focusScore + taskScore + habitScore));

  const updateFocusState = (newState: Partial<FocusState>) => {
    setFocusState(prev => ({ ...prev, ...newState }));
  };

  const addFocusSeconds = (seconds: number) => {
    setFocusSecondsToday(prev => prev + seconds);
    setSessionFocusSeconds(prev => prev + seconds);
  };

  // 1. READ (Fetch from DB on mount)
  useEffect(() => {
    let subscription: any = null;

    const fetchData = async (userId: string) => {
      try {
        const { data: tasksData, error: tasksError } = await supabase!.from('tasks').select('*');
        if (!tasksError && tasksData) setTasks(tasksData);

        const { data: habitsData, error: habitsError } = await supabase!.from('habits').select('*');
        if (!habitsError && habitsData) setHabits(habitsData);

        // Fetch daily stats for the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysAgoString = sevenDaysAgo.toISOString().split('T')[0];

        const { data: statsData, error: statsError } = await supabase!
          .from('daily_stats')
          .select('*')
          .gte('date', sevenDaysAgoString)
          .order('date', { ascending: true });

        if (!statsError && statsData) {
          setWeeklyStats(statsData);
          const today = new Date().toISOString().split('T')[0];
          const todayStat = statsData.find((s: any) => s.date === today);
          if (todayStat) {
            setFocusSecondsToday(todayStat.focus_seconds || 0);
            setTargetFocusHours(todayStat.target_hours || 5);
          } else if (statsData.length > 0) {
            // Carry over yesterday's target hours
            const lastStat = statsData[statsData.length - 1];
            setTargetFocusHours(lastStat.target_hours || 5);
          }
        }
      } catch (err) {
        console.error("Supabase fetch failed.", err);
      }
    };

    if (isDbConnected() && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        setIsLoading(false);
        if (session?.user) {
          fetchData(session.user.id);
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        setIsLoading(false);
        if (session?.user) {
          fetchData(session.user.id);
        } else {
          setTasks([]);
          setHabits([]);
        }
      });
      subscription = authListener.subscription;
    } else {
      console.warn("Priora: Running in Local Mock Mode. Add Supabase keys to .env.local for Database Mode.");
      setIsLoading(false);
    }

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [currentDateString]); // Re-fetch if day changes

  // Debounced Sync for Daily Stats
  useEffect(() => {
    if (!isDbConnected() || !supabase || !user) return;
    if (isLoading) return;

    const timeout = setTimeout(async () => {
      // Sync to the date the state currently belongs to
      const { error } = await supabase!.from('daily_stats').upsert({
        user_id: user.id,
        date: currentDateString,
        focus_seconds: focusSecondsToday,
        target_hours: targetFocusHours,
        productivity_score: prodScore
      }, { onConflict: 'user_id, date' });

      if (error) {
        console.error("Supabase upsert error (daily_stats):", error.message);
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [focusSecondsToday, targetFocusHours, prodScore, user, isLoading, currentDateString]);

  // 2. CREATE
  const addTask = async (task: Task) => {
    setTasks([task, ...tasks]); // Optimistic UI update
    if (isDbConnected() && supabase) {
      await supabase!.from('tasks').insert([{ ...task, user_id: user?.id }]);
    }
  };

  const editTask = async (id: number, updatedTask: Partial<Task>) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, ...updatedTask } : t));
    if (isDbConnected() && supabase) {
      await supabase!.from('tasks').update(updatedTask).eq('id', id);
    }
  };

  // 3. UPDATE
  const toggleTaskStatus = async (id: number, newStatus: Task["status"]) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
    if (isDbConnected() && supabase) {
      await supabase!.from('tasks').update({ status: newStatus }).eq('id', id);
    }
  };

  // 4. DELETE
  const deleteTask = async (id: number) => {
    setTasks(tasks.filter(t => t.id !== id));
    if (isDbConnected() && supabase) {
      await supabase!.from('tasks').delete().eq('id', id);
    }
  };

  const addHabit = async (habit: Habit) => {
    setHabits([...habits, habit]);
    if (isDbConnected() && supabase) {
      await supabase!.from('habits').insert([{ ...habit, user_id: user?.id }]);
    }
  };

  const toggleHabitDay = async (habitId: number, dayIndex: number) => {
    const habitToUpdate = habits.find(h => h.id === habitId);
    if (!habitToUpdate) return;

    const newDays = [...habitToUpdate.days];
    newDays[dayIndex] = !newDays[dayIndex];
    const streak = newDays.filter(Boolean).length;
    const updatedHabit = { ...habitToUpdate, days: newDays, streak };

    setHabits(habits.map(h => h.id === habitId ? updatedHabit : h));

    if (isDbConnected() && supabase) {
      await supabase!.from('habits').update({ days: updatedHabit.days, streak: updatedHabit.streak }).eq('id', habitId);
    }
  };

  const deleteHabit = async (id: number) => {
    setHabits(habits.filter(h => h.id !== id));
    if (isDbConnected() && supabase) {
      await supabase!.from('habits').delete().eq('id', id);
    }
  };

  return (
    <AppContext.Provider value={{
      tasks, addTask, editTask, toggleTaskStatus, deleteTask,
      habits, addHabit, toggleHabitDay, deleteHabit,
      user, isLoading,
      focusState, updateFocusState,
      focusSecondsToday,
      sessionFocusSeconds,
      addFocusSeconds,
      targetFocusHours, setTargetFocusHours,
      focusBgImage, setFocusBgImage,
      weeklyStats, prodScore
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
