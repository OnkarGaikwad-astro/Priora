"use client";

import { motion } from "framer-motion";
import { Brain, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase, isDbConnected } from "@/lib/supabase";
import { useState } from "react";
import Image from "next/image";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    if (!isDbConnected() || !supabase) {
      setError("Database connection not configured. Please add Supabase environment variables.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-main)] flex flex-col relative overflow-hidden">
      
      {/* Abstract Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--color-primary)]/20 rounded-full blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-screen"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--color-status-info)]/20 rounded-full blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-screen"></div>

      {/* Nav / Back Button */}
      <nav className="relative z-10 w-full px-8 py-6 flex items-center">
        <Link href="/" className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </nav>

      {/* Main Form Area */}
      <main className="flex-1 flex items-center justify-center relative z-10 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md bg-[var(--color-cream)]/80 dark:bg-black/40 backdrop-blur-2xl rounded-3xl p-8 md:p-10 shadow-[var(--shadow-skeuo),0_20px_40px_rgba(0,0,0,0.1)] border border-white/50 dark:border-white/10"
        >
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-status-info)] rounded-2xl flex items-center justify-center shadow-lg shadow-[var(--color-primary)]/20 mb-6">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-heading text-[var(--color-text-heading)] mb-2">Welcome Back</h1>
            <p className="text-[var(--color-text-secondary)] text-center">
              Log in to access your intelligent planner and stay ahead of your deadlines.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-[var(--color-status-danger)]/10 border border-[var(--color-status-danger)]/20 text-[var(--color-status-danger)] text-sm text-center font-medium">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="group relative w-full flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-[#1A1A1A] text-[var(--color-text-primary)] font-medium rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-[var(--color-text-secondary)]" />
              ) : (
                <>
                  <Image src="https://authjs.dev/img/providers/google.svg" alt="Google" width={20} height={20} className="w-5 h-5" />
                  Continue with Google
                </>
              )}
            </button>
          </div>

          <div className="mt-8 text-center text-sm text-[var(--color-text-muted)]">
            By continuing, you agree to Priora's <br />
            <a href="#" className="underline hover:text-[var(--color-primary)]">Terms of Service</a> and <a href="#" className="underline hover:text-[var(--color-primary)]">Privacy Policy</a>.
          </div>

        </motion.div>
      </main>

    </div>
  );
}
