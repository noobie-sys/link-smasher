import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.WXT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.WXT_SUPABASE_PUBLISHABLE_KEY || import.meta.env.WXT_SUPABASE_ANON_KEY;

// Return null instead of throwing — a missing Supabase config only disables Realtime;
// it must not crash the background service worker and break core sync functionality.
export const supabaseClient: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      })
    : null;

if (!supabaseClient) {
  console.warn(
    "[supabaseClient] Not configured — set WXT_SUPABASE_URL and WXT_SUPABASE_PUBLISHABLE_KEY (or WXT_SUPABASE_ANON_KEY) to enable Realtime sync.",
  );
}
