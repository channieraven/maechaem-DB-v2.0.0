import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY -- Supabase features will be unavailable.'
  );
}

const supabase = createClient<Database>(
  supabaseUrl || 'https://mdedbsgnswflhcpyqoci.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZWRic2duc3dmbGhjcHlxb2NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMjkxNzksImV4cCI6MjA4NzcwNTE3OX0.YaQAsRMMPu_auifa4R2_eztBT7v9C_Y8_RqqUPsOCfg',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

export default supabase;
