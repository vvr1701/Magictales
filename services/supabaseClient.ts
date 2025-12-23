
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase Configuration
 * 
 * For Vercel deployment, set these environment variables:
 * - VITE_SUPABASE_URL: Your Supabase project URL
 * - VITE_SUPABASE_ANON_KEY: Your Supabase anon/public key
 * 
 * Get these from: Supabase Dashboard > Project Settings > API
 */

// Get Supabase credentials from environment variables
// Vite injects VITE_ prefixed variables via import.meta.env
// But we're using the define block in vite.config.ts to inject as process.env
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Logging for debugging
const LOG_PREFIX = "🗄️ [Supabase]";

const logSupabaseStatus = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(`${LOG_PREFIX} ⚠️ Supabase credentials not configured`);
    console.warn(`${LOG_PREFIX} ℹ️ Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local`);
    console.warn(`${LOG_PREFIX} ℹ️ App will run in limited mode (no auth/storage)`);
  } else {
    console.log(`${LOG_PREFIX} ✅ Supabase configured: ${supabaseUrl.substring(0, 30)}...`);
  }
};

// Log status on module load
logSupabaseStatus();

// Only initialize if we have the credentials to prevent app crash
export const supabase: SupabaseClient | null = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey && supabase);
};
