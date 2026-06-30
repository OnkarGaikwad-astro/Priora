"use client";

import { Play, Pause, Square, RefreshCcw, Target, Focus as FocusIcon, Coffee, ChevronDown, CheckCircle2, PartyPopper } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAppContext } from "@/context/AppContext";
import { motion, AnimatePresence } from "framer-motion";

export default function FocusPage() {
  const { tasks, focusState, updateFocusState, addFocusSeconds, focusBgImage, focusBgMusic } = useAppContext();

  const [localTimeLeft, setLocalTimeLeft] = useState(focusState.remainingTime);

  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completedMode, setCompletedMode] = useState<"focus" | "break">("focus");
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync YouTube iframe with timer state natively
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(JSON.stringify({
        event: 'command',
        func: (focusState.isActive && focusState.mode === 'focus') ? 'playVideo' : 'pauseVideo',
        args: []
      }), '*');
    }
  }, [focusState.isActive, focusState.mode]);

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
          } catch (e) { }
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
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(e => console.log(e));
      }
      updateFocusState({
        isActive: false,
        remainingTime: localTimeLeft,
        endTime: null
      });
    } else {
      // Play / Resume
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(e => console.log(e));
      }
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
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(e => console.log(e));
    }
    const duration = focusState.mode === "focus" ? FOCUS_TIME : BREAK_TIME;
    updateFocusState({
      isActive: false,
      remainingTime: duration,
      endTime: null
    });
  };

  const switchMode = (newMode: "focus" | "break") => {
    recordElapsedIfActive();
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(e => console.log(e));
    }
    const duration = newMode === "focus" ? focusState.focusMinutes * 60 : focusState.breakMinutes * 60;
    updateFocusState({
      isActive: false,
      mode: newMode,
      remainingTime: duration,
      endTime: null
    });
  };

  const totalDuration = focusState.mode === "focus" ? focusState.focusMinutes * 60 : focusState.breakMinutes * 60;
  const progressPercentage = totalDuration > 0 ? ((totalDuration - localTimeLeft) / totalDuration) * 100 : 0;

  // Format MM:SS
  const mins = Math.floor(localTimeLeft / 60).toString().padStart(2, "0");
  const secs = (localTimeLeft % 60).toString().padStart(2, "0");

  // Keyboard shortcut: Press 'F' to toggle focus timer
  const toggleTimerRef = useRef(toggleTimer);
  useEffect(() => {
    toggleTimerRef.current = toggleTimer;
  }, [toggleTimer]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleTimerRef.current();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col gap-8 h-full items-center relative z-10 w-full">
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
        <div className="z-10 transition-colors duration-800">
          <h1 className={`font-heading text-5xl mb-2 transition-all duration-800 ${focusState.isActive ? 'text-white drop-shadow-md' : 'text-[var(--color-text-heading)]'}`}>Focus Mode</h1>
          <p className={`text-lg font-sans transition-all duration-800 ${focusState.isActive ? 'text-white/90 drop-shadow-md' : 'text-[var(--color-text-secondary)]'}`}>Deep work. Zero distractions.</p>
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

      <div className="flex-1 flex flex-col items-center w-full max-w-2xl mt-4 pb-8">

        <div className="flex-1 flex flex-col items-center justify-center w-full">
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
          <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center mb-4 shrink-0">
            {/* Outer glowing ring */}
            <div className={`absolute inset-0 rounded-full blur-xl transition-colors duration-1000 ${focusState.isActive ? 'opacity-30 scale-110' : 'opacity-10 scale-100'} ${focusState.isActive ? (focusState.mode === 'focus' ? 'bg-cyan-500' : 'bg-indigo-500') : (focusState.mode === 'focus' ? 'bg-[var(--color-status-danger)]' : 'bg-[var(--color-status-success)]')}`}></div>

            {/* Orbit 1: Inner (Fastest, Brightest) */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: focusState.isActive ? 25 : 60, repeat: Infinity, ease: "linear" }}
              className={`absolute inset-[-20px] md:inset-[-25px] rounded-full pointer-events-none transition-opacity duration-1000 border border-blue-500/5 ${focusState.isActive ? 'opacity-100' : 'opacity-40'}`}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-blue-300 rounded-full shadow-[0_0_16px_rgba(147,197,253,1)]" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1 h-1 bg-indigo-200 rounded-full shadow-[0_0_8px_rgba(199,210,254,0.8)]" />
              <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-sky-300 rounded-full shadow-[0_0_24px_rgba(125,211,252,1)]" />
            </motion.div>

            {/* Orbit 2: Mid-Inner (Counter-Revolving) */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: focusState.isActive ? 40 : 90, repeat: Infinity, ease: "linear" }}
              className={`absolute inset-[-50px] md:inset-[-65px] rounded-full pointer-events-none transition-opacity duration-1000 border border-blue-400/5 ${focusState.isActive ? 'opacity-80' : 'opacity-20'}`}
            >
              <div className="absolute top-[15%] left-[15%] -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-sky-200 rounded-full shadow-[0_0_8px_rgba(186,230,253,0.9)]" />
              <div className="absolute bottom-[15%] right-[15%] translate-x-1/2 translate-y-1/2 w-4 h-4 bg-blue-400 rounded-full shadow-[0_0_20px_rgba(96,165,250,1)]" />
              <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-200 rounded-full shadow-[0_0_10px_rgba(191,219,254,0.9)]" />
            </motion.div>

            {/* Orbit 3: Mid-Outer (Slower) */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: focusState.isActive ? 65 : 120, repeat: Infinity, ease: "linear" }}
              className={`absolute inset-[-80px] md:inset-[-105px] rounded-full pointer-events-none transition-opacity duration-1000 border border-blue-300/5 ${focusState.isActive ? 'opacity-60' : 'opacity-10'}`}
            >
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2.5 h-2.5 bg-indigo-300 rounded-full shadow-[0_0_16px_rgba(165,180,252,0.9)]" />
              <div className="absolute top-[15%] right-[15%] translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-sky-100 rounded-full shadow-[0_0_6px_rgba(224,242,254,0.8)]" />
              <div className="absolute left-[5%] bottom-[25%] -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-blue-200 rounded-full shadow-[0_0_12px_rgba(191,219,254,0.7)]" />
            </motion.div>

            {/* Orbit 4: Farthest (Very Slow, Faint) */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: focusState.isActive ? 95 : 160, repeat: Infinity, ease: "linear" }}
              className={`absolute inset-[-110px] md:inset-[-145px] rounded-full pointer-events-none transition-opacity duration-1000 border border-blue-200/5 ${focusState.isActive ? 'opacity-40' : 'opacity-0'}`}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-300 rounded-full shadow-[0_0_20px_rgba(147,197,253,0.8)]" />
              <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-indigo-400 rounded-full shadow-[0_0_8px_rgba(129,140,248,0.6)]" />
              <div className="absolute bottom-[20%] right-[10%] translate-x-1/2 translate-y-1/2 w-2 h-2 bg-sky-300 rounded-full shadow-[0_0_10px_rgba(125,211,252,0.8)]" />
            </motion.div>

            {/* Neumorphic Circle Container with Liquid Fill */}
            <div className="absolute inset-4 rounded-full bg-[var(--color-cream)]/90 shadow-[inset_4px_4px_10px_rgba(255,255,255,1),inset_-4px_-4px_10px_rgba(0,0,0,0.05),var(--shadow-skeuo)] border border-white/50 overflow-hidden">
              {/* Liquid Wave Effect spanning the whole timer */}
              <div
                className="absolute left-[calc(-50%)] w-[200%] h-[200%] transition-all duration-1000 ease-linear z-0"
                style={{ top: `${100 - progressPercentage}%` }}
              >
                <div className={`absolute inset-0 rounded-[40%] animate-[spin_8s_linear_infinite] transition-colors duration-1000 opacity-20 ${focusState.isActive ? (focusState.mode === 'focus' ? 'bg-cyan-500' : 'bg-indigo-500') : (focusState.mode === 'focus' ? 'bg-[var(--color-status-danger)]' : 'bg-[var(--color-status-success)]')}`} />
                <div className={`absolute inset-0 rounded-[45%] animate-[spin_12s_linear_infinite] transition-colors duration-1000 opacity-30 ${focusState.isActive ? (focusState.mode === 'focus' ? 'bg-blue-400' : 'bg-violet-400') : (focusState.mode === 'focus' ? 'bg-[var(--color-status-danger)]' : 'bg-[var(--color-status-success)]')}`} />
              </div>
            </div>

            {/* Inner inset circle (Fully transparent to see liquid seamlessly) */}
            <div className="absolute inset-10 rounded-full shadow-[var(--shadow-skeuo-inset)] flex items-center justify-center flex-col z-10 border border-white/20 pointer-events-none">

              {/* Text Layer */}
              <div className="relative z-20 flex flex-col items-center">
                <span className="font-heading text-7xl text-[var(--color-text-heading)] tabular-nums tracking-tight drop-shadow-sm">{mins}:{secs}</span>
                <span className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-widest mt-2 bg-white/50 px-3 py-1 rounded-full backdrop-blur-md border border-white/30 shadow-sm">
                  {focusState.mode === 'focus' ? 'Deep Work' : 'Resting'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center mt-8">
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
              }}
              className="w-14 h-14 rounded-full bg-[var(--color-bg-card)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] shadow-[var(--shadow-skeuo)] hover:shadow-[var(--shadow-skeuo-hover)] active:shadow-[var(--shadow-skeuo-inset)] transition-all"
            >
              <Square className="w-5 h-5 fill-current" />
            </button>
          </div>
        </div>

        {/* Ambient YouTube Player (Hidden but active) */}
        {mounted && (
          <div className="absolute opacity-0 pointer-events-none w-[1px] h-[1px] overflow-hidden -z-50">
            <iframe
              ref={iframeRef}
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${focusBgMusic || 'aBRmSdIcgOs'}?enablejsapi=1&rel=0&controls=0&start=15&vq=tiny`}
              title="Ambient Focus Space"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )}
      </div>
    </div>
  );
}

