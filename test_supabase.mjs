import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("URL:", supabaseUrl);
console.log("Key defined:", !!supabaseAnonKey);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const newTask = {
    id: Date.now(),
    title: "Test Task from Node",
    status: "todo",
    category: "General",
    est: "1h",
    priority: "Low",
    isCritical: false,
    deadline: "2026-10-31"
  };

  const { data, error } = await supabase.from('tasks').insert([newTask]);
  console.log("Insert response:");
  console.log("Error:", error);
  console.log("Data:", data);

  const { data: fetch, error: fetchError } = await supabase.from('tasks').select('*');
  console.log("Fetch response:");
  console.log("Error:", fetchError);
  console.log("Rows:", fetch?.length);
}

test();
