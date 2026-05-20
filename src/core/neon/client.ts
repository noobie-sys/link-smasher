import { neon } from "@neondatabase/serverless";

const databaseUrl = import.meta.env.WXT_NEON_DATABASE_URL;

if (!databaseUrl) {
  console.warn("[neon] Missing WXT_NEON_DATABASE_URL environment variable.");
}

export const sql = databaseUrl ? neon(databaseUrl) : null;

export const HARDCODED_USER_ID = "dev-user-placeholder";

export async function initializeDatabase() {
  if (!sql) {
    console.warn("[neon] Database client not initialized due to missing connection URL.");
    return;
  }

  try {
    console.log("[neon] Initializing database tables...");
    
    // Create the links table if it doesn't exist.
    // Storing tags as a standard PostgreSQL text array and created_at as bigint for Javascript timestamp.
    await sql`
      CREATE TABLE IF NOT EXISTS links (
        id text PRIMARY KEY,
        user_id text NOT NULL,
        url text NOT NULL,
        title text NOT NULL,
        hostname text NOT NULL,
        tags text[] DEFAULT '{}',
        notes text,
        created_at bigint NOT NULL,
        synced_at timestamptz DEFAULT now()
      )
    `;
    
    console.log("[neon] Database tables initialized successfully.");
  } catch (error) {
    console.error("[neon] Failed to initialize database tables:", error);
  }
}
