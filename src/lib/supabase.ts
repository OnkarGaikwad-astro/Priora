import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a single supabase client for interacting with your database
// We only initialize it if the keys are actually provided
export const supabase = supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your_supabase_url_here' 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Helper to check if DB is connected
export const isDbConnected = () => supabase !== null;
