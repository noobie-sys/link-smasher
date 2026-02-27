import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.WXT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.WXT_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[supabase] Missing WXT_SUPABASE_URL or WXT_SUPABASE_ANON_KEY environment variables.",
  );
}

export const HARDCODED_USER_ID = "dev-user-placeholder";

console.log("[supabase] Initializing client", {
  urlDefined: Boolean(supabaseUrl),
  anonKeyDefined: Boolean(supabaseAnonKey),
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

