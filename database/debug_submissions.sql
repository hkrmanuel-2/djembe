-- Debug query to check submissions
-- Run this in Supabase SQL Editor to see what's actually in the database

-- Check all submissions
SELECT 
  s.id,
  s.assignment_id,
  s.student_id,
  s.file_url,
  s.file_name,
  s.submitted_at,
  a.id as assignment_table_id,
  a.title as assignment_title,
  st.email as student_email
FROM submissions s
LEFT JOIN assignments a ON s.assignment_id = a.id
LEFT JOIN students st ON s.student_id = st.student_id
ORDER BY s.submitted_at DESC;

-- Check assignments table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'assignments'
ORDER BY ordinal_position;

-- Check submissions table structure  
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'submissions'
ORDER BY ordinal_position;
