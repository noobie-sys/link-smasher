import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.WXT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.WXT_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[supabase] Missing WXT_SUPABASE_URL or WXT_SUPABASE_PUBLISHABLE_KEY environment variables."
  );
}

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const HARDCODED_USER_ID = "dev-user-placeholder";
