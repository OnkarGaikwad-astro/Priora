"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Brain, Clock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-main)] overflow-hidden relative">
      {/* Navbar */}
      <nav className="absolute top-0 w-full px-8 py-6 z-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 overflow-hidden flex items-center justify-center">
            <Image src="/logo.svg" alt="Priora Logo" width={32} height={32} className="w-full h-full" />
          </div>
          <span className="font-heading text-2xl tracking-wide text-[var(--color-text-heading)]">Priora</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-[var(--color-text-secondary)] font-sans">
          <Link href="#features" className="hover:text-[var(--color-primary)] transition-colors">Features</Link>
          <Link href="#ai-planner" className="hover:text-[var(--color-primary)] transition-colors">AI Planner</Link>
          <Link href="#deadline-rescue" className="hover:text-[var(--color-primary)] transition-colors">Deadline Rescue</Link>
          <Link href="#analytics" className="hover:text-[var(--color-primary)] transition-colors">Analytics</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard"
            className="px-6 py-2.5 rounded-full bg-[var(--color-primary)] text-[var(--color-accent)] font-medium shadow-[var(--shadow-skeuo)] hover:shadow-[var(--shadow-skeuo-hover)] transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row items-center justify-between min-h-[90vh]">
        
        {/* Left Content */}
        <div className="lg:w-1/2 flex flex-col items-start pt-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="px-4 py-1.5 rounded-full bg-[var(--color-bg-elevated)] text-[var(--color-primary)] text-sm font-medium mb-6 shadow-[var(--shadow-skeuo-inset)] inline-flex items-center gap-2"
          >
            <Brain className="w-4 h-4" /> Meet Priora
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="text-6xl md:text-7xl font-heading text-[var(--color-text-heading)] leading-[1.1] mb-6"
          >
            Your AI <br/>
            Productivity <br/>
            <span className="text-[var(--color-primary)] italic">Strategist</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg text-[var(--color-text-secondary)] max-w-md mb-10 leading-relaxed font-sans"
          >
            Priora doesn’t just remind you. It predicts what might go wrong, creates execution plans, reorganizes your schedule, and actively helps you finish work before deadlines become emergencies.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="flex items-center gap-4"
          >
            <Link 
              href="/dashboard"
              className="group flex items-center gap-2 px-8 py-4 rounded-[var(--radius-skeuo)] bg-[var(--color-primary)] text-[var(--color-accent)] font-medium text-lg shadow-[var(--shadow-skeuo)] hover:shadow-[var(--shadow-skeuo-hover)] transition-all hover:-translate-y-1 active:translate-y-0"
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button 
              onClick={() => alert("Interactive Demo Video Player coming soon!")}
              className="px-8 py-4 rounded-[var(--radius-skeuo)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)] font-medium text-lg shadow-[var(--shadow-skeuo)] hover:shadow-[var(--shadow-skeuo-hover)] transition-all hover:-translate-y-1 active:translate-y-0"
            >
              Watch Demo
            </button>
          </motion.div>
        </div>

        {/* Right Visuals (Glass Panels) */}
        <div className="lg:w-1/2 relative h-[600px] w-full mt-20 lg:mt-0 flex items-center justify-center">
          
          {/* Main Dashboard Preview Panel */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotateX: 10, rotateY: -15 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0, rotateY: -5 }}
            transition={{ duration: 1.2, delay: 0.4, type: "spring" }}
            className="absolute z-20 w-[480px] h-[320px] rounded-[var(--radius-skeuo)] bg-[var(--color-bg-card)]/70 backdrop-blur-xl shadow-[var(--shadow-skeuo)] hover:shadow-[var(--shadow-skeuo-hover)] hover:-translate-y-1 transition-all duration-300 border border-[var(--color-primary)]/20 p-6 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[var(--color-bg-elevated)] shadow-[var(--shadow-skeuo-inset)]"></div>
                <div>
                  <div className="h-3 w-24 bg-[var(--color-text-muted)]/20 rounded-full mb-1"></div>
                  <div className="h-2 w-16 bg-[var(--color-text-muted)]/10 rounded-full"></div>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                <Brain className="w-4 h-4" />
              </div>
            </div>
            
            <div className="flex-1 rounded-2xl bg-[var(--color-bg-surface)] shadow-[var(--shadow-skeuo-inset)] p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-[var(--color-text-primary)] font-medium text-sm">Today's Mission</span>
                <span className="text-[var(--color-primary)] text-xs font-bold">85% Priority</span>
              </div>
              <div className="h-2 w-full bg-[var(--color-bg-main)] rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-[var(--color-primary)] rounded-full"></div>
              </div>
              <div className="flex-1 mt-2 space-y-2">
                <div className="h-10 w-full bg-[var(--color-bg-card)] rounded-xl shadow-[var(--shadow-skeuo)] flex items-center px-3">
                  <div className="w-3 h-3 rounded-full bg-[var(--color-status-warning)] mr-3"></div>
                  <div className="h-2 w-32 bg-[var(--color-text-muted)]/20 rounded-full"></div>
                </div>
                <div className="h-10 w-full bg-[var(--color-bg-card)] rounded-xl shadow-[var(--shadow-skeuo)] flex items-center px-3">
                  <div className="w-3 h-3 rounded-full bg-[var(--color-status-danger)] mr-3 animate-pulse"></div>
                  <div className="h-2 w-40 bg-[var(--color-text-muted)]/20 rounded-full"></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Floating Widget 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 50, x: -50 }}
            animate={{ opacity: 1, y: 80, x: -140 }}
            transition={{ duration: 1, delay: 0.6, type: "spring" }}
            className="absolute z-30 w-[220px] h-[140px] rounded-[var(--radius-skeuo)] bg-[var(--color-bg-elevated)]/80 backdrop-blur-md shadow-[var(--shadow-skeuo)] hover:shadow-[var(--shadow-skeuo-hover)] hover:-translate-y-1 transition-all duration-300 border border-[var(--color-primary)]/30 p-5 flex flex-col justify-between"
          >
            <div className="flex items-center gap-2 text-[var(--color-status-danger)]">
              <Clock className="w-5 h-5" />
              <span className="font-semibold text-sm">Rescue Mode</span>
            </div>
            <div>
              <div className="text-2xl font-heading text-[var(--color-text-heading)]">16 Hours</div>
              <div className="text-xs text-[var(--color-text-secondary)]">Hackathon Due</div>
            </div>
          </motion.div>

          {/* Floating Widget 2 */}
          <motion.div 
            initial={{ opacity: 0, y: -50, x: 50 }}
            animate={{ opacity: 1, y: -100, x: 120 }}
            transition={{ duration: 1, delay: 0.8, type: "spring" }}
            className="absolute z-10 w-[200px] h-[180px] rounded-[var(--radius-skeuo)] bg-[var(--color-secondary)]/90 backdrop-blur-md shadow-[var(--shadow-skeuo)] hover:shadow-[var(--shadow-skeuo-hover)] hover:-translate-y-1 transition-all duration-300 border border-[var(--color-primary)]/10 p-5 flex flex-col text-[var(--color-accent)]"
          >
            <ShieldCheck className="w-6 h-6 mb-3 text-[var(--color-accent-soft)]" />
            <span className="font-medium text-sm mb-1">Burnout Prevented</span>
            <span className="text-xs text-[var(--color-accent)]/70 mb-auto">Rescheduled 2 tasks</span>
            <div className="h-10 w-full bg-[var(--color-bg-main)]/20 rounded-xl mt-4"></div>
          </motion.div>

        </div>
      </main>
      
      {/* Background Soft Gradients */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--color-primary)]/10 blur-[120px] rounded-full pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[var(--color-secondary)]/10 blur-[100px] rounded-full pointer-events-none transform -translate-x-1/3 translate-y-1/3"></div>
    </div>
  );
}
