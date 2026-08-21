-- ============================================================
-- RSVP TABLE SCHEMA MIGRATION
-- Kim & James Wedding Site
-- Run this ONCE in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Add soft-delete column (marks deleted RSVPs without destroying them)
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- 2. Add guest_details column (stores per-guest name + meal selections as JSON)
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS guest_details JSONB DEFAULT '[]'::jsonb;

-- 3. Ensure created_at has a proper default (so server doesn't need to supply it)
ALTER TABLE rsvps ALTER COLUMN created_at SET DEFAULT NOW();

-- 4. Add index for faster dashboard queries
CREATE INDEX IF NOT EXISTS idx_rsvps_is_deleted ON rsvps (is_deleted);
CREATE INDEX IF NOT EXISTS idx_rsvps_created_at ON rsvps (created_at DESC);

-- 5. Verify the table structure looks correct
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'rsvps'
ORDER BY ordinal_position;

-- ============================================================
-- RLS POLICIES — Run AFTER the column migration above
-- ============================================================

-- Enable RLS (likely already on, this is idempotent)
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

-- Allow anyone to INSERT (guests submitting RSVPs)
-- The service_role key bypasses RLS, but this makes it explicit
DROP POLICY IF EXISTS "Allow anon insert" ON rsvps;
CREATE POLICY "Allow anon insert" ON rsvps
  FOR INSERT TO anon WITH CHECK (true);

-- Allow service_role to do everything (dashboard reads, deletes, updates)
DROP POLICY IF EXISTS "Allow service_role full access" ON rsvps;
CREATE POLICY "Allow service_role full access" ON rsvps
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- DONE. After running this, your RSVP submissions will persist.
-- ============================================================
