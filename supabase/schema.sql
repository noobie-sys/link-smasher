-- ============================================================
-- Link Smasher — Supabase Reference Schema
-- ============================================================
-- NOTE: This file is a REFERENCE ONLY.
-- The actual `links` and `categories` tables are managed by Prisma
-- via DATABASE_URL. Do NOT run this entire file as a migration.
--
-- The ONLY section you need to run manually in the Supabase SQL
-- Editor is the RLS POLICIES section at the bottom.
-- ============================================================

-- Reference: What Prisma creates for the `links` table
-- (user_id is TEXT matching Better Auth nanoid user IDs — NOT uuid)
--
-- CREATE TABLE links (
--     id text PRIMARY KEY,
--     user_id text NOT NULL,          -- Better Auth nanoid string, not uuid
--     url text NOT NULL,
--     title text NOT NULL,
--     hostname text NOT NULL,
--     tags text[] DEFAULT '{}',
--     notes text,
--     category_id text,
--     created_at bigint NOT NULL,
--     updated_at bigint,
--     synced_at timestamptz DEFAULT now()
-- );

-- ============================================================
-- RLS POLICIES — Run these in Supabase SQL Editor
-- ============================================================
-- Supabase Realtime requires Row Level Security to be enabled,
-- but the default auth.uid() policy breaks because Better Auth
-- users do not have Supabase JWTs.
--
-- Data security is enforced at the Next.js API layer (Better Auth).
-- The permissive SELECT policy below allows Supabase Realtime to
-- deliver postgres_changes events to subscribed clients.
-- ============================================================

ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- Drop the old broken policy (uses auth.uid() which is always null for Better Auth)
DROP POLICY IF EXISTS "Users can manage their own links." ON links;

-- Allow Supabase Realtime to broadcast change events.
-- Actual authorization is handled by Better Auth in the Next.js API.
CREATE POLICY IF NOT EXISTS "Allow realtime reads"
    ON links FOR SELECT
    USING (true);

-- ============================================================
-- Analytics Tables RLS — Run these in Supabase SQL Editor
-- ============================================================
-- Same pattern as links: permissive SELECT for Realtime,
-- actual authorization enforced at the Next.js API layer.
-- ============================================================

ALTER TABLE site_time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow realtime reads"
    ON site_time_logs FOR SELECT
    USING (true);

CREATE POLICY IF NOT EXISTS "Allow realtime reads"
    ON link_events FOR SELECT
    USING (true);
