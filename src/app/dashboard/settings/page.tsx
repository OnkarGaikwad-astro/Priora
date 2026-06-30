"use client";

import { Settings2, Database, Zap, Trash2, KeyRound, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { isDbConnected } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

export default function SettingsPage() {
  const { tasks, deleteTask, focusBgImage, setFocusBgImage } = useAppContext();
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  
  // Local Settings State
  const [focusDuration, setFocusDuration] = useState("25");
  const [geminiKey, setGeminiKey] = useState("");
  const [hasGeminiKey, setHasGeminiKey] = useState(false);

  useEffect(() => {
    // Load from local storage
    const savedDuration = localStorage.getItem("priora_focus_duration");
    if (savedDuration) setFocusDuration(savedDuration);

    // Check if gemini key exists in env (we can't read it directly in client, but we can hit our API to test it)
    const checkGemini = async () => {
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: "ping" })
        });
        if (res.ok || res.status === 400) {
          // If it responds with 400 or ok, the route exists. 
          // A 503 means the key is missing in our route.ts logic.
          setHasGeminiKey(res.status !== 503);
        } else {
          setHasGeminiKey(false);
        }
      } catch (err) {
        setHasGeminiKey(false);
      }
    };
    checkGemini();
  }, []);

  const saveFocusDuration = (val: string) => {
    setFocusDuration(val);
    localStorage.setItem("priora_focus_duration", val);
    showToast("Focus duration saved!");
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleClearCompleted = () => {
    const completedTasks = tasks.filter(t => t.status === "done");
    if (completedTasks.length === 0) {
      showToast("No completed tasks to clear.");
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${completedTasks.length} completed tasks?`)) {
      completedTasks.forEach(t => deleteTask(t.id));
      showToast(`Cleared ${completedTasks.length} tasks!`);
    }
  };

  return (
    <div className="flex flex-col gap-8 h-full max-w-4xl mx-auto w-full">
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

      <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl text-[var(--color-text-heading)] mb-2">Settings</h1>
          <p className="text-[var(--color-text-secondary)] font-sans">Configure your productivity engine.</p>
        </div>
      </header>

      <div className="flex flex-col gap-6">
        
        {/* System Connections */}
        <div className="bg-[var(--color-cream)]/80 backdrop-blur-md rounded-[var(--radius-skeuo)] p-6 md:p-8 shadow-[var(--shadow-skeuo)] border border-white/40">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-6 h-6 text-[var(--color-primary)]" />
            <h2 className="text-xl font-heading text-[var(--color-text-heading)]">System Connections</h2>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-4 bg-[var(--color-bg-card)] rounded-xl shadow-[var(--shadow-skeuo-inset)] border border-[var(--color-primary)]/10">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isDbConnected() ? 'bg-[var(--color-status-success)] shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-[var(--color-status-danger)]'}`}></div>
                <div>
                  <h3 className="font-medium text-[var(--color-text-primary)]">Supabase Database</h3>
                  <p className="text-xs text-[var(--color-text-secondary)]">Sync tasks and habits to the cloud.</p>
                </div>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${isDbConnected() ? 'bg-[var(--color-status-success)]/10 text-[var(--color-status-success)]' : 'bg-[var(--color-status-danger)]/10 text-[var(--color-status-danger)]'}`}>
                {isDbConnected() ? "Connected" : "Disconnected (.env missing)"}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-[var(--color-bg-card)] rounded-xl shadow-[var(--shadow-skeuo-inset)] border border-[var(--color-primary)]/10">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${hasGeminiKey ? 'bg-[var(--color-status-success)] shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-[var(--color-status-danger)]'}`}></div>
                <div>
                  <h3 className="font-medium text-[var(--color-text-primary)]">Google Gemini AI</h3>
                  <p className="text-xs text-[var(--color-text-secondary)]">Powers Priora AI Planner and Chat.</p>
                </div>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${hasGeminiKey ? 'bg-[var(--color-status-success)]/10 text-[var(--color-status-success)]' : 'bg-[var(--color-status-danger)]/10 text-[var(--color-status-danger)]'}`}>
                {hasGeminiKey ? "Connected" : "Disconnected (.env missing)"}
              </span>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-[var(--color-cream)]/80 backdrop-blur-md rounded-[var(--radius-skeuo)] p-6 md:p-8 shadow-[var(--shadow-skeuo)] border border-white/40">
          <div className="flex items-center gap-3 mb-6">
            <Settings2 className="w-6 h-6 text-[var(--color-primary)]" />
            <h2 className="text-xl font-heading text-[var(--color-text-heading)]">Preferences</h2>
          </div>
          
          <div className="flex flex-col gap-6">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Default Focus Duration (Minutes)</label>
              <select 
                value={focusDuration}
                onChange={(e) => saveFocusDuration(e.target.value)}
                className="w-full md:w-1/2 px-4 py-3 rounded-xl bg-[var(--color-bg-card)] shadow-[var(--shadow-skeuo-inset)] border-none outline-none text-[var(--color-text-primary)]"
              >
                <option value="15">15 Minutes (Quick Sprint)</option>
                <option value="25">25 Minutes (Standard Pomodoro)</option>
                <option value="45">45 Minutes (Deep Work)</option>
                <option value="60">60 Minutes (Marathon)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-4">Focus Mode Background Image</label>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                {[
                  { name: "Your Image", url: "/watercolor_bg.png", thumb: "/watercolor_bg.png" },
                  { name: "Animated Space", url: "space_animation", thumb: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2011&auto=format&fit=crop" },
                  { name: "Dark Mountains", url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop", thumb: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop" },
                  { name: "Serene Lake", url: "https://images.unsplash.com/photo-1439853949127-fa647821eba0?q=80&w=1974&auto=format&fit=crop", thumb: "https://images.unsplash.com/photo-1439853949127-fa647821eba0?q=80&w=1974&auto=format&fit=crop" },
                  { name: "Deep Space", url: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?q=80&w=2070&auto=format&fit=crop", thumb: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?q=80&w=2070&auto=format&fit=crop" },
                  { name: "Minimalist Dune", url: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=2041&auto=format&fit=crop", thumb: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=2041&auto=format&fit=crop" }
                ].map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      setFocusBgImage(preset.url);
                      localStorage.setItem("priora_focus_bg", preset.url);
                      showToast(`${preset.name} selected!`);
                    }}
                    className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all shadow-[var(--shadow-skeuo)] ${focusBgImage === preset.url ? 'border-[var(--color-primary)] scale-105' : 'border-transparent hover:border-white/40'}`}
                    title={preset.name}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preset.thumb} alt={preset.name} className="w-full h-full object-cover" />
                    {focusBgImage === preset.url && (
                      <div className="absolute inset-0 bg-[var(--color-primary)]/20 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-white drop-shadow-md" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <input 
                type="text"
                placeholder="Or paste a custom Image URL (e.g. from Unsplash)..."
                value={focusBgImage}
                onChange={(e) => {
                  setFocusBgImage(e.target.value);
                  localStorage.setItem("priora_focus_bg", e.target.value);
                  showToast("Background image updated!");
                }}
                className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-card)] shadow-[var(--shadow-skeuo-inset)] border-none outline-none text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]"
              />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-500/5 border border-red-500/20 backdrop-blur-md rounded-[var(--radius-skeuo)] p-6 md:p-8 shadow-[var(--shadow-skeuo)]">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-heading text-red-600 dark:text-red-400">Danger Zone</h2>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-[var(--color-bg-card)] rounded-xl shadow-[var(--shadow-skeuo-inset)] border border-red-500/10">
            <div>
              <h3 className="font-medium text-[var(--color-text-primary)]">Clear Completed Tasks</h3>
              <p className="text-xs text-[var(--color-text-secondary)]">Permanently delete all tasks marked as "done".</p>
            </div>
            <button 
              onClick={handleClearCompleted}
              className="w-full md:w-auto px-6 py-2 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Clear Now
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
