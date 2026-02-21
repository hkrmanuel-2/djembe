-- ============================================
-- FIX FEEDBACK RLS POLICIES (table already exists)
-- Run this in Supabase SQL Editor
-- ============================================
-- Use this when the feedback table exists but inserts fail (table stays empty).
-- RLS is likely blocking teacher INSERT.
-- ============================================

-- 1. Drop ALL existing feedback policies
DROP POLICY IF EXISTS "Teachers can manage own feedback" ON feedback;
DROP POLICY IF EXISTS "Teachers can insert feedback" ON feedback;
DROP POLICY IF EXISTS "Teachers can view and update own feedback" ON feedback;
DROP POLICY IF EXISTS "Students can view own feedback" ON feedback;

-- 2. Ensure RLS is enabled
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- 3. Teachers: INSERT - allow when teacher_id matches logged-in teacher
--    Uses auth.email() (more reliable) and auth.jwt() ->> 'email' as fallback
CREATE POLICY "Teachers can insert feedback"
ON feedback FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM teachers t
    WHERE t.teacher_id = teacher_id
    AND (t.email = auth.email() OR t.email = (auth.jwt() ->> 'email'))
  )
);

-- 4. Teachers: SELECT, UPDATE, DELETE - own feedback only
CREATE POLICY "Teachers can manage own feedback"
ON feedback FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM teachers t
    WHERE t.teacher_id = feedback.teacher_id
    AND (t.email = COALESCE(auth.email(), auth.jwt() ->> 'email'))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM teachers t
    WHERE t.teacher_id = feedback.teacher_id
    AND (t.email = COALESCE(auth.email(), auth.jwt() ->> 'email'))
  )
);

-- 5. Students: SELECT only
CREATE POLICY "Students can view own feedback"
ON feedback FOR SELECT
TO authenticated
USING (
  submission_id IN (
    SELECT submission_id FROM submissions s
    WHERE s.student_id IN (
      SELECT student_id FROM students st
      WHERE st.email = auth.email() OR st.email = (auth.jwt() ->> 'email')
    )
  )
);

-- ============================================
-- DIAGNOSTIC QUERIES (run in SQL Editor)
-- ============================================
-- 1. Check policies exist:
--    SELECT policyname, cmd FROM pg_policies WHERE tablename = 'feedback';
--
-- 2. Verify your teacher email matches auth (run while logged in as teacher):
--    SELECT email FROM teachers WHERE email = (auth.jwt() ->> 'email');
--    (Should return 1 row. If empty, your teachers.email doesn't match auth.)
--
-- 3. Test insert manually (replace UUIDs with real values):
--    INSERT INTO feedback (submission_id, teacher_id, comment, score)
--    VALUES ('your-submission-uuid', 'your-teacher-uuid', 'test', 80);
--    (If RLS blocks, you'll see "new row violates row-level security policy")
