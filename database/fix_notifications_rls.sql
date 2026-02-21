-- ============================================
-- FIX NOTIFICATIONS RLS
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Drop ALL existing policies
DROP POLICY IF EXISTS "Service role can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Teachers can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Teachers and admins can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Students can insert teacher notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

-- 2. Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 3. INSERT: Teachers can create notifications
CREATE POLICY "Teachers can insert notifications"
ON notifications FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM teachers WHERE email = (auth.jwt() ->> 'email'))
);

-- 4. INSERT: Students can create notifications for teachers
CREATE POLICY "Students can insert teacher notifications"
ON notifications FOR INSERT TO authenticated
WITH CHECK (
  recipient_type = 'teacher'
  AND EXISTS (SELECT 1 FROM students WHERE email = (auth.jwt() ->> 'email'))
);

-- 5. SELECT: Users see their own notifications
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT TO authenticated
USING (
  (recipient_type = 'student' AND recipient_id IN (
    SELECT student_id FROM students WHERE email = (auth.jwt() ->> 'email')
  ))
  OR (recipient_type = 'teacher' AND recipient_id IN (
    SELECT teacher_id FROM teachers WHERE email = (auth.jwt() ->> 'email')
  ))
);

-- 6. UPDATE: Users can mark own as read
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE TO authenticated
USING (
  (recipient_type = 'student' AND recipient_id IN (
    SELECT student_id FROM students WHERE email = (auth.jwt() ->> 'email')
  ))
  OR (recipient_type = 'teacher' AND recipient_id IN (
    SELECT teacher_id FROM teachers WHERE email = (auth.jwt() ->> 'email')
  ))
)
WITH CHECK (true);

-- Verify: SELECT * FROM pg_policies WHERE tablename = 'notifications';
