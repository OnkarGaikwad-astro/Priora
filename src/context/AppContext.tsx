"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase, isDbConnected } from "@/lib/supabase";

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
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);

  // 1. READ (Fetch from DB on mount)
  useEffect(() => {
    if (isDbConnected() && supabase) {
      const fetchData = async () => {
        try {
          const { data: tasksData, error: tasksError } = await supabase!.from('tasks').select('*');
          if (!tasksError && tasksData) setTasks(tasksData);

          const { data: habitsData, error: habitsError } = await supabase!.from('habits').select('*');
          if (!habitsError && habitsData) setHabits(habitsData);
        } catch (err) {
          console.error("Supabase fetch failed, falling back to local state.", err);
        }
      };
      fetchData();
    } else {
      console.warn("Priora: Running in Local Mock Mode. Add Supabase keys to .env.local for Database Mode.");
    }
  }, []);

  // 2. CREATE
  const addTask = async (task: Task) => {
    setTasks([task, ...tasks]); // Optimistic UI update
    if (isDbConnected() && supabase) {
      await supabase!.from('tasks').insert([task]);
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
      await supabase!.from('habits').insert([habit]);
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
      habits, addHabit, toggleHabitDay, deleteHabit
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
