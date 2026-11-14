import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock-helpdesk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-anon-key-placeholder';

export const isLiveSupabaseClient =
  supabaseUrl &&
  !supabaseUrl.includes('mock') &&
  !supabaseUrl.includes('your-project') &&
  supabaseAnonKey &&
  !supabaseAnonKey.includes('mock');

export const supabase = isLiveSupabaseClient
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

