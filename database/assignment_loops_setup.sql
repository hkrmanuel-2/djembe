-- ============================================
-- ASSIGNMENT LOOPS FEATURE
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add BPM and bars columns to assignments table
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS bpm INTEGER DEFAULT 120;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS bars INTEGER DEFAULT 10;

-- 2. Create assignment_loops table
CREATE TABLE IF NOT EXISTS assignment_loops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID NOT NULL REFERENCES assignments(assignment_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT DEFAULT '🎵',
  color TEXT DEFAULT 'bg-purple-400',
  hover_color TEXT DEFAULT 'hover:bg-purple-500',
  border TEXT DEFAULT 'border-purple-600',
  bpm INTEGER NOT NULL DEFAULT 120,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_assignment_loops_assignment_id ON assignment_loops(assignment_id);

-- 4. Enable RLS
ALTER TABLE assignment_loops ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Anyone authenticated can read assignment loops (students need to load them)
CREATE POLICY "Authenticated users can view assignment loops"
  ON assignment_loops FOR SELECT
  USING (auth.role() = 'authenticated');

-- Anyone authenticated can insert (teachers create them)
CREATE POLICY "Authenticated users can insert assignment loops"
  ON assignment_loops FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Anyone authenticated can delete (teachers manage them)
CREATE POLICY "Authenticated users can delete assignment loops"
  ON assignment_loops FOR DELETE
  USING (auth.role() = 'authenticated');
