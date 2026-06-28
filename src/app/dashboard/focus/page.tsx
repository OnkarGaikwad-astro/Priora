"use client";

import { Play, Pause, Square, RefreshCcw, Target, Focus as FocusIcon, Coffee, ChevronDown, CheckCircle2, PartyPopper } from "lucide-react";
import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { motion, AnimatePresence } from "framer-motion";

export default function FocusPage() {
  const { tasks, focusState, updateFocusState, addFocusSeconds } = useAppContext();
  
  const [localTimeLeft, setLocalTimeLeft] = useState(focusState.remainingTime);
  
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completedMode, setCompletedMode] = useState<"focus" | "break">("focus");
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);

  // Keep local display in sync with global timer
  useEffect(() => {
    if (focusState.isActive && focusState.endTime) {
      // Initial calculation to prevent 1s delay
      const now = Date.now();
      const initialDiff = Math.max(0, Math.floor((focusState.endTime - now) / 1000));
      setLocalTimeLeft(initialDiff);

      const interval = setInterval(() => {
        const now = Date.now();
        const diff = Math.max(0, Math.floor((focusState.endTime! - now) / 1000));
        setLocalTimeLeft(diff);
        
        if (diff === 0) {
          // Timer finished
          if (focusState.mode === 'focus') {
             addFocusSeconds(focusState.remainingTime); // Add elapsed time for this segment
          }
          updateFocusState({ isActive: false, remainingTime: 0, endTime: null });
          setCompletedMode(focusState.mode);
          setShowCompletionModal(true);
          
          try {
            const audioUrl = focusState.mode === 'focus' 
              ? "https://cdn.freesound.org/previews/511/511484_6890478-lq.mp3"
              : "https://cdn.freesound.org/previews/411/411089_5121236-lq.mp3";
            const audio = new Audio(audioUrl);
            audio.play().catch(e => console.log("Audio play blocked by browser"));
            setAudioPlayer(audio);
          } catch(e) {}
        }
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setLocalTimeLeft(focusState.remainingTime);
    }
  }, [focusState.isActive, focusState.endTime, focusState.mode, focusState.focusMinutes, updateFocusState, addFocusSeconds, focusState.remainingTime]);

  const FOCUS_TIME = focusState.focusMinutes * 60;
  const BREAK_TIME = focusState.breakMinutes * 60;

  // Task Selection
  const activeTasks = tasks.filter(t => t.status !== "done");
  const defaultTask = activeTasks.find(t => t.status === "in-progress") || activeTasks[0] || null;
  
  useEffect(() => {
    if (focusState.selectedTaskId === null && defaultTask) {
      updateFocusState({ selectedTaskId: defaultTask.id });
    }
  }, [defaultTask, focusState.selectedTaskId, updateFocusState]);

  const currentTask = activeTasks.find(t => t.id === focusState.selectedTaskId) || defaultTask;

  const recordElapsedIfActive = () => {
    if (focusState.isActive && focusState.mode === 'focus') {
      const elapsed = focusState.remainingTime - localTimeLeft;
      if (elapsed > 0) addFocusSeconds(elapsed);
    }
  };

  const toggleTimer = () => {
    if (focusState.isActive) {
      // Pause
      recordElapsedIfActive();
      updateFocusState({ 
        isActive: false, 
        remainingTime: localTimeLeft,
        endTime: null 
      });
    } else {
      // Play / Resume
      if (localTimeLeft === 0) {
         const duration = focusState.mode === "focus" ? FOCUS_TIME : BREAK_TIME;
         updateFocusState({
           isActive: true,
           remainingTime: duration,
           endTime: Date.now() + duration * 1000
         });
      } else {
         updateFocusState({ 
           isActive: true, 
           remainingTime: localTimeLeft, // IMPORTANT: update remainingTime to start from localTimeLeft
           endTime: Date.now() + localTimeLeft * 1000 
         });
      }
    }
  };
  
  const resetTimer = () => {
    recordElapsedIfActive();
    const duration = focusState.mode === "focus" ? FOCUS_TIME : BREAK_TIME;
    updateFocusState({
      isActive: false,
      remainingTime: duration,
      endTime: null
    });
  };

  const switchMode = (newMode: "focus" | "break") => {
    recordElapsedIfActive();
    const duration = newMode === "focus" ? focusState.focusMinutes * 60 : focusState.breakMinutes * 60;
    updateFocusState({
      isActive: false,
      mode: newMode,
      remainingTime: duration,
      endTime: null
    });
  };

  // Format MM:SS
  const mins = Math.floor(localTimeLeft / 60).toString().padStart(2, "0");
  const secs = (localTimeLeft % 60).toString().padStart(2, "0");

  return (
    <div className="flex flex-col gap-8 h-full items-center">
      {/* Completion Modal */}
      <AnimatePresence>
        {showCompletionModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-[var(--color-bg-card)] rounded-[var(--radius-skeuo)] shadow-[var(--shadow-skeuo),0_20px_60px_rgba(0,0,0,0.2)] p-8 text-center relative border border-white/20"
            >
              <div className="mx-auto w-20 h-20 rounded-full bg-[var(--color-bg-main)] shadow-[var(--shadow-skeuo-inset)] flex items-center justify-center mb-6">
                {completedMode === 'focus' ? (
                  <PartyPopper className="w-10 h-10 text-[var(--color-status-success)]" />
                ) : (
                  <CheckCircle2 className="w-10 h-10 text-[var(--color-primary)]" />
                )}
              </div>
              <h2 className="text-3xl font-heading text-[var(--color-text-heading)] mb-2">
                {completedMode === 'focus' ? "Session Complete!" : "Break Over!"}
              </h2>
              <p className="text-[var(--color-text-secondary)] font-sans mb-8">
                {completedMode === 'focus' 
                  ? "Great job staying focused. Take a moment to rest and recharge." 
                  : "Hope you enjoyed your break. Ready to dive back in?"}
              </p>
              
              <button 
                onClick={() => {
                  if (audioPlayer) {
                    audioPlayer.pause();
                    audioPlayer.currentTime = 0;
                  }
                  setShowCompletionModal(false);
                  const nextMode = completedMode === "focus" ? "break" : "focus";
                  const nextDuration = nextMode === "focus" ? FOCUS_TIME : BREAK_TIME;
                  updateFocusState({
                    mode: nextMode,
                    isActive: false,
                    remainingTime: nextDuration,
                    endTime: null
                  });
                }}
                className={`w-full py-4 rounded-xl text-white font-semibold text-lg shadow-[var(--shadow-skeuo)] hover:shadow-[var(--shadow-skeuo-hover)] active:shadow-[var(--shadow-skeuo-inset)] transition-all ${completedMode === 'focus' ? 'bg-[var(--color-status-success)]' : 'bg-[#8BB2B5]'}`}
              >
                {completedMode === 'focus' ? "Start Break" : "Start Focus Session"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <header className="flex flex-col md:flex-row items-center md:items-end justify-between w-full gap-4 text-center md:text-left">
        <div>
          <h1 className="font-heading text-4xl text-[var(--color-text-heading)] mb-2">Focus Mode</h1>
          <p className="text-[var(--color-text-secondary)] font-sans">Deep work. Zero distractions.</p>
        </div>
        
        {/* Mode Switcher */}
        <div className="flex items-center gap-2 bg-[var(--color-bg-card)] p-1.5 rounded-full shadow-[var(--shadow-skeuo-inset)]">
          <button 
            onClick={() => switchMode("focus")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${focusState.mode === 'focus' ? 'bg-[var(--color-status-danger)] text-white shadow-[var(--shadow-skeuo)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}
          >
            <FocusIcon className="w-4 h-4" /> Focus
          </button>
          <button 
            onClick={() => switchMode("break")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${focusState.mode === 'break' ? 'bg-[var(--color-status-success)] text-white shadow-[var(--shadow-skeuo)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}
          >
            <Coffee className="w-4 h-4" /> Break
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mt-8">
        
        {/* Current Task Badge / Selector */}
        <div className={`relative bg-[var(--color-bg-card)] px-6 py-3 rounded-full shadow-[var(--shadow-skeuo-inset)] flex items-center gap-3 mb-12 border ${currentTask ? 'border-[var(--color-primary)]/20' : 'border-transparent'}`}>
          <Target className={`w-5 h-5 shrink-0 ${focusState.mode === 'focus' ? 'text-[var(--color-status-danger)]' : 'text-[var(--color-status-success)]'}`} />
          {activeTasks.length > 0 ? (
            <div className="relative flex items-center">
              <select 
                value={focusState.selectedTaskId || ''} 
                onChange={(e) => updateFocusState({ selectedTaskId: Number(e.target.value) })}
                className="appearance-none bg-transparent font-medium text-[var(--color-text-primary)] outline-none cursor-pointer pr-6 truncate max-w-[200px] md:max-w-[300px]"
                title="Select a task to focus on"
              >
                {activeTasks.map(task => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)] absolute right-0 pointer-events-none" />
            </div>
          ) : (
            <span className={`font-medium text-[var(--color-text-muted)] italic`}>
              No task active. Time to reflect.
            </span>
          )}
        </div>

        {/* Massive Timer */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center mb-12 shrink-0">
          {/* Outer glowing ring */}
          <div className={`absolute inset-0 rounded-full blur-xl transition-all duration-1000 ${focusState.isActive ? 'opacity-30 scale-110' : 'opacity-10 scale-100'} ${focusState.mode === 'focus' ? 'bg-[var(--color-status-danger)]' : 'bg-[var(--color-status-success)]'}`}></div>
          
          {/* Neumorphic Circle */}
          <div className="absolute inset-4 rounded-full bg-[var(--color-cream)]/90 backdrop-blur-md shadow-[inset_4px_4px_10px_rgba(255,255,255,1),inset_-4px_-4px_10px_rgba(0,0,0,0.05),var(--shadow-skeuo)] border border-white/50"></div>
          
          {/* Inner inset circle */}
          <div className="absolute inset-10 rounded-full bg-[var(--color-bg-main)] shadow-[var(--shadow-skeuo-inset)] flex items-center justify-center flex-col z-10 border border-[var(--color-primary)]/10">
            <span className="font-heading text-7xl text-[var(--color-text-heading)] tabular-nums tracking-tight">{mins}:{secs}</span>
            <span className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-widest mt-2">
              {focusState.mode === 'focus' ? 'Deep Work' : 'Resting'}
            </span>
          </div>
        </div>

        {/* Focus Duration Selector */}
        {!focusState.isActive && focusState.mode === 'focus' && (
          <div className="flex items-center gap-3 mb-8 bg-[var(--color-bg-card)] p-1.5 rounded-full shadow-[var(--shadow-skeuo-inset)] border border-[var(--color-primary)]/10">
            {[15, 25, 50, 90].map(min => (
              <button 
                key={min}
                onClick={() => updateFocusState({ focusMinutes: min, remainingTime: min * 60, endTime: null })}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${focusState.focusMinutes === min ? 'bg-[var(--color-primary)] text-white shadow-[var(--shadow-skeuo)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}
              >
                {min}m
              </button>
            ))}
          </div>
        )}

        {/* Break Duration Selector */}
        {!focusState.isActive && focusState.mode === 'break' && (
          <div className="flex items-center gap-3 mb-8 bg-[var(--color-bg-card)] p-1.5 rounded-full shadow-[var(--shadow-skeuo-inset)] border border-[var(--color-primary)]/10">
            {[1, 5, 10, 15].map(min => (
              <button 
                key={min}
                onClick={() => updateFocusState({ breakMinutes: min, remainingTime: min * 60, endTime: null })}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${focusState.breakMinutes === min ? 'bg-[var(--color-primary)] text-white shadow-[var(--shadow-skeuo)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}
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
            className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-[var(--shadow-skeuo)] hover:shadow-[var(--shadow-skeuo-hover)] active:shadow-[var(--shadow-skeuo-inset)] transition-all ${focusState.mode === 'focus' ? (focusState.isActive ? 'bg-[var(--color-status-warning)]' : 'bg-[var(--color-status-danger)]') : (focusState.isActive ? 'bg-[var(--color-status-warning)]' : 'bg-[var(--color-status-success)]')}`}
          >
            {focusState.isActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
          </button>
          
          <button 
            onClick={() => { 
              recordElapsedIfActive();
              updateFocusState({ isActive: false, remainingTime: 0, endTime: null }); 
            }} // instantly finish
            className="w-14 h-14 rounded-full bg-[var(--color-bg-card)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] shadow-[var(--shadow-skeuo)] hover:shadow-[var(--shadow-skeuo-hover)] active:shadow-[var(--shadow-skeuo-inset)] transition-all"
          >
            <Square className="w-5 h-5 fill-current" />
          </button>
        </div>

      </div>
    </div>
  );
}
