-- ============================================
-- FIX FEEDBACK TABLE
-- Run this in Supabase SQL Editor
-- ============================================
-- The feedback table may be empty because:
-- 1. RLS policies block teacher INSERT
-- 2. Foreign key references wrong column (submissions.id vs submissions.submission_id)
-- 3. Students policy references wrong table (assignment_submissions vs submissions)
-- ============================================

-- 1. Ensure feedback table exists
CREATE TABLE IF NOT EXISTS feedback (
  feedback_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL,
  teacher_id UUID NOT NULL REFERENCES teachers(teacher_id),
  comment TEXT,
  score INT CHECK (score >= 0 AND score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fix FK: submissions table uses submission_id as PK (not id)
-- Drop old FK, add correct one. If this fails, your submissions table may use 'id' - see FEEDBACK_TABLE_README.md
DO $$
BEGIN
  ALTER TABLE feedback DROP CONSTRAINT IF EXISTS feedback_submission_id_fkey;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
ALTER TABLE feedback ADD CONSTRAINT feedback_submission_id_fkey 
  FOREIGN KEY (submission_id) REFERENCES submissions(submission_id) ON DELETE CASCADE;

-- 2. Drop existing feedback RLS policies (they may block inserts)
DROP POLICY IF EXISTS "Teachers can manage own feedback" ON feedback;
DROP POLICY IF EXISTS "Teachers can insert feedback" ON feedback;
DROP POLICY IF EXISTS "Teachers can view and update own feedback" ON feedback;
DROP POLICY IF EXISTS "Students can view own feedback" ON feedback;

-- 3. Enable RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- 4. Teachers: full access to feedback (INSERT, SELECT, UPDATE, DELETE)
CREATE POLICY "Teachers can manage own feedback"
ON feedback FOR ALL
TO authenticated
USING (
  teacher_id IN (
    SELECT teacher_id FROM teachers 
    WHERE email = (auth.jwt() ->> 'email')
  )
)
WITH CHECK (
  teacher_id IN (
    SELECT teacher_id FROM teachers 
    WHERE email = (auth.jwt() ->> 'email')
  )
);

-- 5. Students: SELECT only - view feedback on their own submissions
-- Uses submissions table (not assignment_submissions) with submission_id
CREATE POLICY "Students can view own feedback"
ON feedback FOR SELECT
TO authenticated
USING (
  submission_id IN (
    SELECT submission_id FROM submissions
    WHERE student_id IN (
      SELECT student_id FROM students 
      WHERE email = (auth.jwt() ->> 'email')
    )
  )
);

-- 6. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_feedback_submission_id ON feedback(submission_id);
CREATE INDEX IF NOT EXISTS idx_feedback_teacher_id ON feedback(teacher_id);

-- ============================================
-- VERIFICATION (run after to test)
-- ============================================
-- Check table exists: SELECT * FROM feedback LIMIT 1;
-- Check policies: SELECT * FROM pg_policies WHERE tablename = 'feedback';
-- Check submissions PK: SELECT column_name FROM information_schema.key_column_usage WHERE table_name = 'submissions' AND constraint_name LIKE '%pkey%';
