-- Notifications System Setup for Djembe
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. NOTIFICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID NOT NULL,
  recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('student', 'teacher')),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification types:
-- STUDENT: 'assignment_created', 'assignment_graded', 'feedback_received', 'due_date_reminder'
-- TEACHER: 'submission_received', 'late_submission'

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, recipient_type);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(recipient_id, read) WHERE read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (
    (recipient_type = 'student' AND recipient_id IN (
      SELECT student_id FROM students WHERE email = auth.jwt()->>'email'
    ))
    OR
    (recipient_type = 'teacher' AND recipient_id IN (
      SELECT teacher_id FROM teachers WHERE email = auth.jwt()->>'email'
    ))
  );

-- RLS Policy: Users can update (mark as read) their own notifications
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (
    (recipient_type = 'student' AND recipient_id IN (
      SELECT student_id FROM students WHERE email = auth.jwt()->>'email'
    ))
    OR
    (recipient_type = 'teacher' AND recipient_id IN (
      SELECT teacher_id FROM teachers WHERE email = auth.jwt()->>'email'
    ))
  );

-- RLS Policy: Service role can insert notifications (for triggers)
CREATE POLICY "Service role can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Enable Realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ============================================
-- 2. HELPER FUNCTION TO CREATE NOTIFICATIONS
-- ============================================

CREATE OR REPLACE FUNCTION create_notification(
  p_recipient_id UUID,
  p_recipient_type VARCHAR(20),
  p_type VARCHAR(50),
  p_title VARCHAR(255),
  p_message TEXT,
  p_data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (recipient_id, recipient_type, type, title, message, data)
  VALUES (p_recipient_id, p_recipient_type, p_type, p_title, p_message, p_data)
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. FUNCTION TO NOTIFY ALL STUDENTS IN SCHOOL
-- ============================================

CREATE OR REPLACE FUNCTION notify_school_students(
  p_school_id UUID,
  p_type VARCHAR(50),
  p_title VARCHAR(255),
  p_message TEXT,
  p_data JSONB DEFAULT '{}'
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  v_student RECORD;
BEGIN
  FOR v_student IN
    SELECT student_id FROM students WHERE school_id = p_school_id
  LOOP
    INSERT INTO notifications (recipient_id, recipient_type, type, title, message, data)
    VALUES (v_student.student_id, 'student', p_type, p_title, p_message, p_data);
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. GRANT PERMISSIONS
-- ============================================

-- Allow authenticated users to execute notification functions
GRANT EXECUTE ON FUNCTION create_notification TO authenticated;
GRANT EXECUTE ON FUNCTION notify_school_students TO authenticated;
