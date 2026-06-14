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
-- Security model: clients NEVER read these tables directly through the public
-- Supabase API key. ALL data access goes through the Next.js API, which
-- authenticates the user with Better Auth and queries via Prisma using the
-- privileged DATABASE_URL connection (Prisma bypasses RLS).
--
-- Therefore the correct policy here is: enable RLS and define NO policy for
-- the anon/authenticated roles. With RLS enabled and no permissive policy,
-- Postgres DENIES all direct reads/writes via PostgREST and Realtime. This
-- closes the previous data leak where a permissive `USING (true)` policy let
-- anyone holding the public key read every user's rows.
--
-- (The app no longer uses Supabase Realtime; the web dashboard and extension
-- stay in sync by polling the secured Next.js API.)
-- ============================================================

ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- Remove any previously-defined policies so re-running is idempotent and the
-- old wide-open "Allow realtime reads" / auth.uid() policies can never linger.
DROP POLICY IF EXISTS "Users can manage their own links." ON links;
DROP POLICY IF EXISTS "Allow realtime reads" ON links;
-- No policy is defined: RLS enabled + no policy = all direct access denied.

-- ============================================================
-- Analytics Tables RLS — Run these in Supabase SQL Editor
-- ============================================================
-- Same model: RLS on, no policy → no direct access. Data flows only through
-- the Next.js API.
-- ============================================================

ALTER TABLE site_time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow realtime reads" ON site_time_logs;
DROP POLICY IF EXISTS "Allow realtime reads" ON link_events;
