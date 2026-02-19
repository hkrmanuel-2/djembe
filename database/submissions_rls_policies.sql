-- RLS Policies for submissions table
-- Run this in Supabase SQL Editor

-- Enable RLS if not already enabled
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Policy 1: Students can insert their own submissions
CREATE POLICY "Students can submit assignments"
ON submissions
FOR INSERT
TO authenticated
WITH CHECK (
  student_id IN (
    SELECT student_id FROM students 
    WHERE email = auth.jwt()->>'email'
  )
);

-- Policy 2: Students can view their own submissions
CREATE POLICY "Students can view own submissions"
ON submissions
FOR SELECT
TO authenticated
USING (
  student_id IN (
    SELECT student_id FROM students 
    WHERE email = auth.jwt()->>'email'
  )
);

-- Policy 3: Teachers can view all submissions
CREATE POLICY "Teachers can view all submissions"
ON submissions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM teachers 
    WHERE teachers.email = auth.jwt()->>'email'
  )
);

-- Policy 4: Teachers can update submissions (for grading/feedback)
CREATE POLICY "Teachers can update submissions"
ON submissions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM teachers 
    WHERE teachers.email = auth.jwt()->>'email'
  )
);
