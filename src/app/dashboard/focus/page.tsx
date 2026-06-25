"use client";

import { Play, Pause, Square, RefreshCcw, Target, Focus as FocusIcon, Coffee } from "lucide-react";
import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";

export default function FocusPage() {
  const { tasks } = useAppContext();
  
  const [focusMinutes, setFocusMinutes] = useState(25);
  const FOCUS_TIME = focusMinutes * 60; // dynamic focus time
  const BREAK_TIME = 5 * 60;  // 5 minutes in seconds

  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);

  // Get the most critical task or default message
  const currentTask = tasks.find(t => t.status === "in-progress") || tasks[0] || null;

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Timer finished! Play sound, switch mode
      const nextMode = mode === "focus" ? "break" : "focus";
      setMode(nextMode);
      setTimeLeft(nextMode === "focus" ? FOCUS_TIME : BREAK_TIME);
      setIsActive(false); // require user to hit play again
      
      // Attempt to play a subtle ping if browser allows
      try {
        const audio = new Audio("https://cdn.freesound.org/previews/320/320181_527080-lq.mp3"); // gentle bell
        audio.play().catch(e => console.log("Audio play blocked by browser"));
      } catch (e) {}
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === "focus" ? FOCUS_TIME : BREAK_TIME);
  };

  const switchMode = (newMode: "focus" | "break") => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(newMode === "focus" ? FOCUS_TIME : BREAK_TIME);
  };

  // Format MM:SS
  const mins = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const secs = (timeLeft % 60).toString().padStart(2, "0");

  return (
    <div className="flex flex-col gap-8 h-full items-center">
      <header className="flex flex-col md:flex-row items-center md:items-end justify-between w-full gap-4 text-center md:text-left">
        <div>
          <h1 className="font-heading text-4xl text-[var(--color-text-heading)] mb-2">Focus Mode</h1>
          <p className="text-[var(--color-text-secondary)] font-sans">Deep work. Zero distractions.</p>
        </div>
        
        {/* Mode Switcher */}
        <div className="flex items-center gap-2 bg-[var(--color-bg-card)] p-1.5 rounded-full shadow-[var(--shadow-skeuo-inset)]">
          <button 
            onClick={() => switchMode("focus")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${mode === 'focus' ? 'bg-[var(--color-status-danger)] text-white shadow-[var(--shadow-skeuo)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}
          >
            <FocusIcon className="w-4 h-4" /> Focus
          </button>
          <button 
            onClick={() => switchMode("break")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${mode === 'break' ? 'bg-[var(--color-status-success)] text-white shadow-[var(--shadow-skeuo)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}
          >
            <Coffee className="w-4 h-4" /> Break
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mt-8">
        
        {/* Current Task Badge */}
        <div className={`bg-[var(--color-bg-card)] px-6 py-3 rounded-full shadow-[var(--shadow-skeuo-inset)] flex items-center gap-3 mb-12 border ${currentTask ? 'border-[var(--color-primary)]/20' : 'border-transparent'}`}>
          <Target className={`w-5 h-5 ${mode === 'focus' ? 'text-[var(--color-status-danger)]' : 'text-[var(--color-status-success)]'}`} />
          <span className={`font-medium ${currentTask ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)] italic'}`}>
            {currentTask ? currentTask.title : "No task active. Time to reflect."}
          </span>
        </div>

        {/* Massive Timer */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center mb-12 shrink-0">
          {/* Outer glowing ring */}
          <div className={`absolute inset-0 rounded-full blur-xl transition-all duration-1000 ${isActive ? 'opacity-30 scale-110' : 'opacity-10 scale-100'} ${mode === 'focus' ? 'bg-[var(--color-status-danger)]' : 'bg-[var(--color-status-success)]'}`}></div>
          
          {/* Neumorphic Circle */}
          <div className="absolute inset-4 rounded-full bg-[var(--color-cream)]/90 backdrop-blur-md shadow-[inset_4px_4px_10px_rgba(255,255,255,1),inset_-4px_-4px_10px_rgba(0,0,0,0.05),var(--shadow-skeuo)] border border-white/50"></div>
          
          {/* Inner inset circle */}
          <div className="absolute inset-10 rounded-full bg-[var(--color-bg-main)] shadow-[var(--shadow-skeuo-inset)] flex items-center justify-center flex-col z-10 border border-[var(--color-primary)]/10">
            <span className="font-heading text-7xl text-[var(--color-text-heading)] tabular-nums tracking-tight">{mins}:{secs}</span>
            <span className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-widest mt-2">
              {mode === 'focus' ? 'Deep Work' : 'Resting'}
            </span>
          </div>
        </div>

        {/* Focus Duration Selector */}
        {!isActive && mode === 'focus' && (
          <div className="flex items-center gap-3 mb-8 bg-[var(--color-bg-card)] p-1.5 rounded-full shadow-[var(--shadow-skeuo-inset)] border border-[var(--color-primary)]/10">
            {[15, 25, 50, 90].map(min => (
              <button 
                key={min}
                onClick={() => {
                  setFocusMinutes(min);
                  setTimeLeft(min * 60);
                }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${focusMinutes === min ? 'bg-[var(--color-primary)] text-white shadow-[var(--shadow-skeuo)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}
              >
                {min}m
              </button>
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-6">
          <button 
            onClick={resetTimer}
            className="w-14 h-14 rounded-full bg-[var(--color-bg-card)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] shadow-[var(--shadow-skeuo)] hover:shadow-[var(--shadow-skeuo-hover)] active:shadow-[var(--shadow-skeuo-inset)] transition-all"
          >
            <RefreshCcw className="w-5 h-5" />
          </button>
          
          <button 
            onClick={toggleTimer}
            className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-[var(--shadow-skeuo)] hover:shadow-[var(--shadow-skeuo-hover)] active:shadow-[var(--shadow-skeuo-inset)] transition-all ${mode === 'focus' ? (isActive ? 'bg-[var(--color-status-warning)]' : 'bg-[var(--color-status-danger)]') : (isActive ? 'bg-[var(--color-status-warning)]' : 'bg-[var(--color-status-success)]')}`}
          >
            {isActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
          </button>
          
          <button 
            onClick={() => { setIsActive(false); setTimeLeft(0); }} // instantly finish
            className="w-14 h-14 rounded-full bg-[var(--color-bg-card)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] shadow-[var(--shadow-skeuo)] hover:shadow-[var(--shadow-skeuo-hover)] active:shadow-[var(--shadow-skeuo-inset)] transition-all"
          >
            <Square className="w-5 h-5 fill-current" />
          </button>
        </div>

      </div>
    </div>
  );
}
