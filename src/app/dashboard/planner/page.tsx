"use client";

import { Brain, Sparkles, Send, Zap, Calendar, Target, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { useAppContext, Task } from "@/context/AppContext";
import { motion, AnimatePresence } from "framer-motion";

export default function PlannerPage() {
  const { tasks } = useAppContext();
  
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<null | {
    morning: Task[],
    afternoon: Task[],
    evening: Task[]
  }>(null);

  const pendingTasks = tasks.filter(t => t.status !== 'done');

  const handleGeneratePlan = async (prompt?: string) => {
    const userPrompt = prompt || input.trim();
    if (!userPrompt) return;
    
    setInput("");
    setIsGenerating(true);
    setGeneratedPlan(null);

    try {
      const response = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userPrompt, tasks: pendingTasks })
      });

      if (response.ok) {
        const aiPlan = await response.json();
        // The API returns arrays of task IDs. We need to map them back to Task objects.
        const mapIdsToTasks = (ids: number[]) => ids.map(id => pendingTasks.find(t => t.id === id)).filter(Boolean) as Task[];
        
        setGeneratedPlan({
          morning: mapIdsToTasks(aiPlan.morning || []),
          afternoon: mapIdsToTasks(aiPlan.afternoon || []),
          evening: mapIdsToTasks(aiPlan.evening || [])
        });
      } else {
        throw new Error("API not configured or failed");
      }
    } catch (error) {
      console.warn("Falling back to local AI simulation", error);
      // Fallback simple logic
      setTimeout(() => {
        const sorted = [...pendingTasks].sort((a, b) => a.priority === "High" ? -1 : 1);
        setGeneratedPlan({
          morning: sorted.slice(0, Math.ceil(sorted.length / 3)),
          afternoon: sorted.slice(Math.ceil(sorted.length / 3), Math.ceil(sorted.length / 3) * 2),
          evening: sorted.slice(Math.ceil(sorted.length / 3) * 2)
        });
        setIsGenerating(false);
      }, 1500);
      return;
    }

    setIsGenerating(false);
  };

  return (
    <div className="flex flex-col gap-8 h-full max-w-5xl mx-auto w-full">
      <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl text-[var(--color-text-heading)] mb-2">AI Strategist</h1>
          <p className="text-[var(--color-text-secondary)] font-sans">Tell Priora your goals. Get an optimized execution plan.</p>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Left Side: Input & Prompts */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4">
          <div className="bg-[var(--color-bg-card)] rounded-[var(--radius-skeuo)] p-6 shadow-[var(--shadow-skeuo)] border border-[var(--color-primary)]/10">
            <h3 className="font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--color-primary)]" /> Define your focus
            </h3>
            <div className="relative">
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="E.g. I need to clear my high priority tasks before noon..."
                className="w-full h-32 px-4 py-3 rounded-xl bg-[var(--color-bg-main)] border-2 border-[var(--color-primary)]/10 focus:border-[var(--color-primary)] outline-none text-[var(--color-text-primary)] resize-none"
              ></textarea>
            </div>
            <button 
              onClick={() => handleGeneratePlan()}
              disabled={isGenerating || pendingTasks.length === 0}
              className="mt-4 w-full py-3 rounded-xl bg-[var(--color-primary)] text-[var(--color-accent)] font-semibold shadow-[var(--shadow-skeuo)] hover:shadow-[var(--shadow-skeuo-hover)] disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
            >
              {isGenerating ? <Zap className="w-4 h-4 animate-pulse" /> : <Brain className="w-4 h-4" />}
              {isGenerating ? "Synthesizing..." : "Generate Plan"}
            </button>
            {pendingTasks.length === 0 && (
              <p className="text-xs text-[var(--color-status-warning)] mt-2 text-center">You have no pending tasks to plan!</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] ml-2 mb-1">Quick Prompts</p>
            {["Optimize my schedule for today", "Plan a deep work session", "Clear my backlog"].map((prompt, i) => (
              <button 
                key={i} 
                onClick={() => handleGeneratePlan(prompt)}
                disabled={isGenerating || pendingTasks.length === 0}
                className="text-left px-5 py-3 rounded-xl bg-[var(--color-bg-card)]/60 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] border border-[var(--color-primary)]/5 hover:border-[var(--color-primary)]/20 transition-all disabled:opacity-50"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Execution Plan Result */}
        <div className="flex-1 bg-[var(--color-cream)]/50 rounded-[var(--radius-skeuo)] p-6 md:p-8 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.9),inset_-2px_-2px_6px_rgba(0,0,0,0.05),var(--shadow-skeuo)] border border-white/30 overflow-y-auto min-h-[400px]">
          
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center gap-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-[var(--color-primary)] blur-xl opacity-20 rounded-full animate-pulse"></div>
                  <div className="w-16 h-16 bg-[var(--color-bg-elevated)] rounded-full shadow-[var(--shadow-skeuo-inset)] flex items-center justify-center relative">
                    <Brain className="w-8 h-8 text-[var(--color-primary)] animate-pulse" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="font-heading text-xl text-[var(--color-text-heading)] mb-2">Analyzing Task Landscape</h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">Optimizing priorities against energy levels...</p>
                </div>
              </motion.div>
            ) : generatedPlan ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-8 pb-8"
              >
                <div>
                  <h2 className="font-heading text-2xl text-[var(--color-text-heading)] flex items-center gap-2 mb-2">
                    <Target className="w-6 h-6 text-[var(--color-primary)]" /> Optimal Execution Plan
                  </h2>
                  <p className="text-sm text-[var(--color-text-secondary)]">Based on your {pendingTasks.length} pending tasks, here is the most efficient order of execution.</p>
                </div>

                <div className="flex flex-col gap-6">
                  {/* Time Blocks */}
                  {[
                    { title: "Morning Block", time: "09:00 - 12:00", tasks: generatedPlan.morning, color: "var(--color-status-danger)" },
                    { title: "Afternoon Block", time: "13:00 - 16:00", tasks: generatedPlan.afternoon, color: "var(--color-status-warning)" },
                    { title: "Evening Wrap-up", time: "16:00 - 18:00", tasks: generatedPlan.evening, color: "var(--color-primary)" }
                  ].map((block, idx) => {
                    if (block.tasks.length === 0) return null;
                    return (
                      <div key={idx} className="relative pl-6 border-l-2" style={{ borderColor: block.color }}>
                        <div className="absolute w-3 h-3 rounded-full -left-[7px] top-1 shadow-sm" style={{ backgroundColor: block.color }}></div>
                        <h3 className="font-bold text-[var(--color-text-primary)] tracking-wide">{block.title} <span className="text-xs font-normal text-[var(--color-text-muted)] ml-2">{block.time}</span></h3>
                        <div className="mt-3 flex flex-col gap-3">
                          {block.tasks.map(t => (
                            <div key={t.id} className="bg-[var(--color-bg-card)]/80 backdrop-blur-sm p-4 rounded-xl border border-[var(--color-primary)]/10 shadow-sm flex items-center justify-between">
                              <div>
                                <span className="font-medium text-[var(--color-text-primary)] text-sm">{t.title}</span>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] uppercase font-semibold text-[var(--color-text-muted)] bg-[var(--color-bg-elevated)] px-2 py-0.5 rounded-full">{t.category}</span>
                                  {t.priority === 'High' && <span className="text-[10px] flex items-center gap-1 text-[var(--color-status-danger)] font-semibold"><ShieldAlert className="w-3 h-3"/> High Priority</span>}
                                </div>
                              </div>
                              <span className="text-xs text-[var(--color-text-muted)]">{t.est}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                <div className="w-20 h-20 bg-[var(--color-bg-elevated)] rounded-full shadow-[var(--shadow-skeuo-inset)] flex items-center justify-center mb-6">
                  <Calendar className="w-10 h-10 text-[var(--color-primary)]" />
                </div>
                <h3 className="font-heading text-2xl text-[var(--color-text-heading)] mb-2">Awaiting Parameters</h3>
                <p className="text-[var(--color-text-secondary)] max-w-sm">Provide a prompt or click a suggestion to let Priora analyze your workload and formulate a plan.</p>
              </div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
