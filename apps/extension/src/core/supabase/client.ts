import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.WXT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.WXT_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[supabase] Missing WXT_SUPABASE_URL or WXT_SUPABASE_PUBLISHABLE_KEY environment variables."
  );
}

/**
 * The Supabase client is retained for potential future use (e.g. realtime subscriptions).
 * All authenticated data operations now go through the Next.js API gateway via apiFetch.
 * Do NOT use this client for CRUD operations or authentication.
 */
export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
