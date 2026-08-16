import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser client — safe for 'use client' components.
// Auth state is persisted in localStorage automatically by supabase-js.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: typeof window !== 'undefined', // Only persist in browser, not during SSR
    detectSessionInUrl: true,
  },
});

export default supabase;
