-- Fix RLS policies so teachers can view submissions
-- Run this in Supabase SQL Editor

-- First, drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Teachers can view all submissions" ON submissions;
DROP POLICY IF EXISTS "Students can view own submissions" ON submissions;

-- Recreate the teacher policy (more permissive)
CREATE POLICY "Teachers can view all submissions"
ON submissions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM teachers 
    WHERE teachers.email = (auth.jwt() ->> 'email')
  )
);

-- Recreate student policy
CREATE POLICY "Students can view own submissions"
ON submissions
FOR SELECT
TO authenticated
USING (
  student_id IN (
    SELECT student_id FROM students 
    WHERE email = (auth.jwt() ->> 'email')
  )
);

-- If the above doesn't work, try this simpler version (for testing):
-- DROP POLICY IF EXISTS "Allow all authenticated to view submissions" ON submissions;
-- CREATE POLICY "Allow all authenticated to view submissions"
-- ON submissions
-- FOR SELECT
-- TO authenticated
-- USING (true);
