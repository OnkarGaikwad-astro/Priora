"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  Brain,
  Focus,
  Activity,
  Trophy,
  Settings,
  User,
  Zap,
  ArrowRight,
  Menu,
  X,
  BrainCircuit
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AppProvider, useAppContext } from "@/context/AppContext";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: CheckSquare, label: "Tasks", href: "/dashboard/tasks" },
  { icon: CalendarDays, label: "Calendar", href: "/dashboard/calendar" },
  { icon: Brain, label: "AI Planner", href: "/dashboard/planner" },
  { icon: Focus, label: "Focus Mode", href: "/dashboard/focus" },
  { icon: Activity, label: "Habits", href: "/dashboard/habits" },
  { icon: Trophy, label: "Achievements", href: "/dashboard/achievements" },
];

function DashboardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { tasks, addTask } = useAppContext();
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // AI Panel Chat State
  const [aiInput, setAiInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{role: 'user'|'ai', text: string}[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Dynamic AI Data
  const highPriorityTasks = tasks.filter(t => t.priority === "High" && t.status !== "done");
  const inProgressTask = tasks.find(t => t.status === "in-progress");
  const topTask = inProgressTask || tasks.find(t => t.status !== "done") || null;

  const handleAiSubmit = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && aiInput.trim() && !isTyping) {
      const userText = aiInput.trim();
      setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
      setAiInput("");
      setIsTyping(true);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: userText,
            currentDate: new Date().toISOString()
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.action === "create_task" && data.task) {
            addTask({
              id: Date.now(),
              title: data.task.title,
              status: "todo",
              category: data.task.category || "General",
              est: data.task.est || "Est. 1h",
              priority: data.task.priority || "Medium",
              isCritical: data.task.isCritical || false,
              deadline: data.task.deadline
            });
          }
          setChatMessages(prev => [...prev, { role: 'ai', text: data.response }]);
        } else {
          setChatMessages(prev => [...prev, { role: 'ai', text: "I'm having trouble connecting to my logic center right now." }]);
        }
      } catch (error) {
        setChatMessages(prev => [...prev, { role: 'ai', text: "An error occurred while processing your request." }]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  return (
    <div className="flex h-screen bg-[var(--color-bg-main)] overflow-hidden font-sans relative">
      {/* Mobile Header */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-16 bg-[var(--color-bg-sidebar)] border-b border-[var(--color-primary)]/20 z-40 flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 overflow-hidden flex items-center justify-center">
            <Image src="/logo.svg" alt="Priora Logo" width={32} height={32} className="w-full h-full" />
          </div>
          <span className="font-heading text-xl tracking-wide text-[var(--color-text-heading)]">Priora</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="text-[var(--color-text-primary)] bg-[var(--color-bg-card)] p-2 rounded-lg shadow-[var(--shadow-skeuo)] active:shadow-[var(--shadow-skeuo-inset)]">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Left Sidebar (Desktop + Mobile Drawer) */}
      <aside className={`fixed md:static inset-y-0 left-0 w-64 bg-[var(--color-bg-sidebar)] border-r border-[var(--color-primary)]/40 flex flex-col justify-between py-6 shadow-[10px_0_20px_rgba(109,156,159,0.05)] z-50 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div>
          <div className="px-8 mb-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 overflow-hidden flex items-center justify-center">
                <Image src="/logo.svg" alt="Priora Logo" width={32} height={32} className="w-full h-full" />
              </div>
              <span className="font-heading text-xl tracking-wide text-[var(--color-text-heading)]">Priora</span>
            </div>
            <button className="md:hidden text-[var(--color-text-muted)]" onClick={() => setIsMobileMenuOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex flex-col gap-2 px-4">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 relative group
                    ${isActive ? "text-[var(--color-text-primary)] font-semibold bg-[var(--color-cream)]/60 backdrop-blur-md shadow-[8px_8px_20px_rgba(0,0,0,0.15),-8px_-8px_20px_rgba(255,255,255,0.9)]" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-cadet-blue)]/10 hover:text-[var(--color-text-primary)]"}`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-2xl bg-[var(--color-primary)]/10 pointer-events-none"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="px-4 flex flex-col gap-2">
          <Link 
            href="/dashboard/settings" 
            onClick={() => setIsMobileMenuOpen(false)} 
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 relative group
              ${pathname === '/dashboard/settings' ? "text-[var(--color-text-primary)] font-semibold bg-[var(--color-cream)]/60 backdrop-blur-md shadow-[8px_8px_20px_rgba(0,0,0,0.15),-8px_-8px_20px_rgba(255,255,255,0.9)]" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-cadet-blue)]/10 hover:text-[var(--color-text-primary)]"}`}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
            {pathname === '/dashboard/settings' && (
              <motion.div
                layoutId="sidebar-active"
                className="absolute inset-0 rounded-2xl bg-[var(--color-primary)]/10 pointer-events-none"
              />
            )}
          </Link>
          <div className="flex items-center gap-3 px-4 py-3 mt-2 border-t border-[var(--color-text-muted)]/10">
            <div className="w-8 h-8 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center shadow-[var(--shadow-skeuo-inset)]">
              <User className="w-4 h-4 text-[var(--color-primary)]" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-[var(--color-text-primary)]">Alex</span>
              <span className="text-xs text-[var(--color-text-muted)]">Pro Plan</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Center Workspace */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 md:pt-8 z-10 relative">
        {children}
      </main>

      {/* Floating Action Button for Priora AI */}
      <button 
        onClick={() => setIsAiOpen(!isAiOpen)}
        className="fixed bottom-6 md:bottom-8 right-6 md:right-8 w-14 h-14 bg-[var(--color-primary)] rounded-full shadow-[var(--shadow-skeuo)] hover:shadow-[var(--shadow-skeuo-hover)] active:shadow-[var(--shadow-skeuo-inset)] flex items-center justify-center text-[var(--color-accent)] z-[60] transition-all hover:-translate-y-1"
      >
        <BrainCircuit className="w-6 h-6" />
      </button>

      {/* Floating AI Assistant Panel */}
      <AnimatePresence>
        {isAiOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 md:bottom-28 right-4 md:right-8 w-[calc(100vw-32px)] md:w-80 h-[500px] md:h-[600px] max-h-[70vh] md:max-h-[80vh] bg-[var(--color-bg-surface)]/95 backdrop-blur-xl border border-[var(--color-primary)]/40 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] z-50 flex flex-col overflow-hidden"
          >
            <div className="p-6 border-b border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 backdrop-blur-md relative shrink-0">
              <button onClick={() => setIsAiOpen(false)} className="absolute top-6 right-6 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 mb-1">
                <BrainCircuit className="w-5 h-5 text-[var(--color-primary)]" />
                <h3 className="font-heading text-lg font-medium text-[var(--color-text-heading)]">Priora AI</h3>
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">Active • Context Aware</p>
            </div>

            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
              
              {/* Dynamic Content OR Chat Log */}
              {chatMessages.length === 0 ? (
                <>
                  {/* AI Recommendation Widget */}
                  {topTask && (
                    <div className="bg-[var(--color-bg-card)] p-4 rounded-[var(--radius-skeuo)] shadow-[var(--shadow-skeuo)] hover:shadow-[var(--shadow-skeuo-hover)] transition-all duration-300 relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-primary)]"></div>
                      <div className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-[var(--color-primary)] shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-[var(--color-text-primary)] mb-1">Deep Work Suggestion</h4>
                          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                            I recommend you focus on: <span className="font-semibold text-[var(--color-text-primary)]">{topTask.title}</span> right now.
                          </p>
                          <Link href="/dashboard/focus" onClick={() => setIsAiOpen(false)} className="mt-3 text-xs font-medium text-[var(--color-primary)] flex items-center gap-1 group-hover:gap-2 transition-all inline-flex">
                            Start Focus Mode <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI Upcoming Risks */}
                  <div className="bg-[var(--color-bg-elevated)] p-4 rounded-[var(--radius-skeuo)] shadow-[var(--shadow-skeuo-inset)] transition-all duration-300 border border-[var(--color-primary)]/20">
                    <h4 className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Predicted Risks</h4>
                    <div className="flex flex-col gap-3">
                      {highPriorityTasks.length > 0 ? highPriorityTasks.map(task => (
                        <div key={task.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2 max-w-[70%]">
                            <div className="w-2 h-2 shrink-0 rounded-full bg-[var(--color-status-warning)] animate-pulse"></div>
                            <span className="text-sm text-[var(--color-text-primary)] truncate">{task.title}</span>
                          </div>
                          <span className="text-xs text-[var(--color-status-warning)] font-medium">High Risk</span>
                        </div>
                      )) : (
                        <div className="text-xs text-[var(--color-status-success)] flex items-center gap-2 font-medium">
                          <div className="w-2 h-2 rounded-full bg-[var(--color-status-success)]"></div> No immediate risks detected.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-4">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`max-w-[85%] rounded-2xl p-3 text-sm ${msg.role === 'user' ? 'bg-[var(--color-primary)] text-white self-end shadow-md' : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] self-start shadow-[var(--shadow-skeuo-inset)] border border-[var(--color-primary)]/10'}`}>
                      {msg.text}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] self-start rounded-2xl p-3 text-sm shadow-[var(--shadow-skeuo-inset)] flex items-center gap-1">
                      <div className="w-2 h-2 bg-[var(--color-primary)]/50 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-[var(--color-primary)]/50 rounded-full animate-bounce" style={{animationDelay: "0.1s"}}></div>
                      <div className="w-2 h-2 bg-[var(--color-primary)]/50 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 bg-[var(--color-bg-sidebar)] shrink-0">
              <div className="bg-[var(--color-bg-elevated)] rounded-full px-4 py-3 shadow-[var(--shadow-skeuo-inset)] flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                <input
                  type="text"
                  placeholder="Ask Priora anything... (Press Enter)"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={handleAiSubmit}
                  className="bg-transparent border-none outline-none text-sm w-full text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Wrap layout content inside AppProvider, but extract logic into DashboardContent so it can consume useAppContext
  return (
    <AppProvider>
      <DashboardContent>{children}</DashboardContent>
    </AppProvider>
  );
}
