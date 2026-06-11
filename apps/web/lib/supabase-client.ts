import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Supabase client for Realtime postgres_changes subscriptions.
 *
 * Returns null when environment variables are not configured so that
 * the app degrades gracefully in environments without Supabase set up
 * (e.g. CI, staging without Supabase, unit tests).
 *
 * Note: Authentication is handled by Better Auth, not Supabase Auth.
 * The Supabase client here is used solely for Realtime subscriptions.
 */
export const supabaseClient: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          // Disable Supabase Auth session management — we use Better Auth.
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      })
    : null;
