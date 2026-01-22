-- ============================================
-- TEACHER FEATURES SETUP
-- Run this in Supabase SQL Editor
-- ============================================
-- NOTE: Using existing 'feedback' table with schema:
--   feedback_id (uuid, PK)
--   submission_id (uuid)
--   teacher_id (uuid)
--   comment (text)
--   score (int4, 0-100)
--   created_at, updated_at (timestamp)
-- ============================================

-- 1. ASSIGNMENTS TABLE ENHANCEMENTS
-- Add teacher and school tracking, assignment types
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES teachers(teacher_id);
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS school_id UUID;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS assignment_type VARCHAR(20) DEFAULT 'upload';
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. INDEXES FOR PERFORMANCE
-- Feedback table indexes (using existing feedback table)
CREATE INDEX IF NOT EXISTS idx_feedback_teacher ON feedback(teacher_id);
CREATE INDEX IF NOT EXISTS idx_feedback_submission ON feedback(submission_id);

-- Assignment indexes
CREATE INDEX IF NOT EXISTS idx_assignments_teacher ON assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_school ON assignments(school_id);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);

-- 3. ROW LEVEL SECURITY FOR FEEDBACK TABLE
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Teachers can manage feedback they created
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'feedback' AND policyname = 'Teachers can manage own feedback'
  ) THEN
    CREATE POLICY "Teachers can manage own feedback" ON feedback
      FOR ALL USING (
        teacher_id IN (SELECT teacher_id FROM teachers WHERE email = auth.jwt()->>'email')
      );
  END IF;
END $$;

-- Students can view feedback on their submissions (read-only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'feedback' AND policyname = 'Students can view own feedback'
  ) THEN
    CREATE POLICY "Students can view own feedback" ON feedback
      FOR SELECT USING (
        submission_id IN (
          SELECT id FROM assignment_submissions
          WHERE student_id IN (SELECT student_id FROM students WHERE email = auth.jwt()->>'email')
        )
      );
  END IF;
END $$;

-- 4. ROW LEVEL SECURITY FOR ASSIGNMENTS
-- Assignment policies (if not already exist)
DO $$
BEGIN
  -- Teachers can manage assignments in their school
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'assignments' AND policyname = 'Teachers can manage school assignments'
  ) THEN
    CREATE POLICY "Teachers can manage school assignments" ON assignments
      FOR ALL USING (
        school_id IN (SELECT school_id FROM teachers WHERE email = auth.jwt()->>'email')
        OR teacher_id IN (SELECT teacher_id FROM teachers WHERE email = auth.jwt()->>'email')
      );
  END IF;

  -- Students can view assignments for their school
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'assignments' AND policyname = 'Students can view school assignments'
  ) THEN
    CREATE POLICY "Students can view school assignments" ON assignments
      FOR SELECT USING (
        school_id IN (SELECT school_id FROM students WHERE email = auth.jwt()->>'email')
      );
  END IF;
END $$;

-- 5. AUTO-UPDATE TRIGGER FOR updated_at ON FEEDBACK
CREATE OR REPLACE FUNCTION update_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_feedback_updated_at ON feedback;
CREATE TRIGGER update_feedback_updated_at
  BEFORE UPDATE ON feedback
  FOR EACH ROW EXECUTE FUNCTION update_feedback_updated_at();

-- 6. HELPER VIEW FOR ASSIGNMENT SUBMISSIONS WITH STUDENT INFO
CREATE OR REPLACE VIEW assignment_submissions_with_students AS
SELECT
  asub.*,
  s.first_name,
  s.last_name,
  s.email as student_email,
  a.title as assignment_title,
  a.due_date,
  a.assignment_type,
  CASE
    WHEN asub.submitted_at <= a.due_date THEN true
    ELSE false
  END as is_on_time
FROM assignment_submissions asub
JOIN students s ON asub.student_id = s.student_id
JOIN assignments a ON asub.assignment_id = a.id;

-- 7. HELPER VIEW FOR PROJECTS WITH STUDENT INFO (for teachers)
CREATE OR REPLACE VIEW projects_with_students AS
SELECT
  p.*,
  s.first_name,
  s.last_name,
  s.email as student_email,
  s.school_id,
  jsonb_array_length(COALESCE(p.placed_loops, '[]'::jsonb)) as loop_count
FROM projects p
JOIN students s ON p.student_id = s.student_id;

-- ============================================
-- VERIFICATION QUERIES (run to test)
-- ============================================

-- Check feedback table indexes
-- SELECT indexname FROM pg_indexes WHERE tablename = 'feedback';

-- Check assignments columns were added
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'assignments';

-- Check views work
-- SELECT * FROM assignment_submissions_with_students LIMIT 1;
-- SELECT * FROM projects_with_students LIMIT 1;
