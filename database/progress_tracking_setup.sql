-- ============================================
-- STUDENT PROGRESS TRACKING SYSTEM
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Student Progress Summary Table
CREATE TABLE IF NOT EXISTS student_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(student_id) ON DELETE CASCADE UNIQUE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  xp_to_next_level INTEGER NOT NULL DEFAULT 110,
  assignments_completed INTEGER DEFAULT 0,
  projects_created INTEGER DEFAULT 0,
  projects_exported INTEGER DEFAULT 0,
  loops_placed_total INTEGER DEFAULT 0,
  total_time_minutes INTEGER DEFAULT 0,  -- Total active time on platform
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. XP Activity Log
CREATE TABLE IF NOT EXISTS xp_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  activity_reference_id UUID,
  xp_awarded INTEGER NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Badge Definitions
CREATE TABLE IF NOT EXISTS badge_definitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  badge_key VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  category VARCHAR(50) NOT NULL,
  xp_reward INTEGER DEFAULT 25,
  unlock_criteria JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Student Badges (earned badges)
CREATE TABLE IF NOT EXISTS student_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badge_definitions(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unlock_context JSONB DEFAULT '{}',
  UNIQUE(student_id, badge_id)
);

-- 5. Daily Activity (for streaks and daily caps)
CREATE TABLE IF NOT EXISTS daily_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  login_recorded BOOLEAN DEFAULT false,
  daw_time_minutes INTEGER DEFAULT 0,
  loops_placed INTEGER DEFAULT 0,
  projects_saved INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, activity_date)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_student_progress_student_id ON student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_xp_activities_student_id ON xp_activities(student_id);
CREATE INDEX IF NOT EXISTS idx_xp_activities_created_at ON xp_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_badges_student_id ON student_badges(student_id);
CREATE INDEX IF NOT EXISTS idx_daily_activity_student_date ON daily_activity(student_id, activity_date);
CREATE INDEX IF NOT EXISTS idx_badge_definitions_category ON badge_definitions(category);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_definitions ENABLE ROW LEVEL SECURITY;

-- Badge definitions are public (read-only)
CREATE POLICY "Badge definitions are viewable by all authenticated users" ON badge_definitions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Students can view and update their own progress
CREATE POLICY "Students can view own progress" ON student_progress
  FOR SELECT USING (
    student_id IN (SELECT student_id FROM students WHERE email = auth.jwt()->>'email')
  );

CREATE POLICY "Students can insert own progress" ON student_progress
  FOR INSERT WITH CHECK (
    student_id IN (SELECT student_id FROM students WHERE email = auth.jwt()->>'email')
  );

CREATE POLICY "Students can update own progress" ON student_progress
  FOR UPDATE USING (
    student_id IN (SELECT student_id FROM students WHERE email = auth.jwt()->>'email')
  );

-- Teachers can view progress of students in their school
CREATE POLICY "Teachers can view student progress" ON student_progress
  FOR SELECT USING (
    student_id IN (
      SELECT s.student_id FROM students s
      JOIN teachers t ON s.school_id = t.school_id
      WHERE t.email = auth.jwt()->>'email'
    )
  );

-- XP Activities policies
CREATE POLICY "Students can view own XP activities" ON xp_activities
  FOR SELECT USING (
    student_id IN (SELECT student_id FROM students WHERE email = auth.jwt()->>'email')
  );

CREATE POLICY "Students can insert own XP activities" ON xp_activities
  FOR INSERT WITH CHECK (
    student_id IN (SELECT student_id FROM students WHERE email = auth.jwt()->>'email')
  );

CREATE POLICY "Teachers can view student XP activities" ON xp_activities
  FOR SELECT USING (
    student_id IN (
      SELECT s.student_id FROM students s
      JOIN teachers t ON s.school_id = t.school_id
      WHERE t.email = auth.jwt()->>'email'
    )
  );

-- Student Badges policies
CREATE POLICY "Students can view own badges" ON student_badges
  FOR SELECT USING (
    student_id IN (SELECT student_id FROM students WHERE email = auth.jwt()->>'email')
  );

CREATE POLICY "Students can insert own badges" ON student_badges
  FOR INSERT WITH CHECK (
    student_id IN (SELECT student_id FROM students WHERE email = auth.jwt()->>'email')
  );

CREATE POLICY "Teachers can view student badges" ON student_badges
  FOR SELECT USING (
    student_id IN (
      SELECT s.student_id FROM students s
      JOIN teachers t ON s.school_id = t.school_id
      WHERE t.email = auth.jwt()->>'email'
    )
  );

-- Daily Activity policies
CREATE POLICY "Students can manage own daily activity" ON daily_activity
  FOR ALL USING (
    student_id IN (SELECT student_id FROM students WHERE email = auth.jwt()->>'email')
  );

CREATE POLICY "Teachers can view student daily activity" ON daily_activity
  FOR SELECT USING (
    student_id IN (
      SELECT s.student_id FROM students s
      JOIN teachers t ON s.school_id = t.school_id
      WHERE t.email = auth.jwt()->>'email'
    )
  );

-- ============================================
-- AUTO-UPDATE TRIGGER FOR updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_student_progress_updated_at
  BEFORE UPDATE ON student_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_activity_updated_at
  BEFORE UPDATE ON daily_activity
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED BADGE DEFINITIONS
-- ============================================

INSERT INTO badge_definitions (badge_key, name, description, icon, category, xp_reward, unlock_criteria, display_order) VALUES
  -- Creative Badges
  ('first_project', 'First Steps', 'Create your first music project', '🎹', 'creative', 25,
   '{"type": "count", "field": "projects_created", "threshold": 1}'::jsonb, 1),
  ('five_projects', 'Project Pro', 'Create 5 music projects', '📁', 'creative', 50,
   '{"type": "count", "field": "projects_created", "threshold": 5}'::jsonb, 2),
  ('ten_projects', 'Production Master', 'Create 10 music projects', '🎛️', 'creative', 100,
   '{"type": "count", "field": "projects_created", "threshold": 10}'::jsonb, 3),
  ('first_export', 'Sound Sharer', 'Export your first project', '⬇️', 'creative', 30,
   '{"type": "count", "field": "projects_exported", "threshold": 1}'::jsonb, 4),
  ('five_exports', 'Release Artist', 'Export 5 projects', '💿', 'creative', 75,
   '{"type": "count", "field": "projects_exported", "threshold": 5}'::jsonb, 5),
  ('loop_explorer', 'Loop Explorer', 'Place 10 loops in your projects', '🔄', 'creative', 25,
   '{"type": "count", "field": "loops_placed_total", "threshold": 10}'::jsonb, 6),
  ('loop_builder', 'Loop Builder', 'Place 50 loops total', '🎚️', 'creative', 50,
   '{"type": "count", "field": "loops_placed_total", "threshold": 50}'::jsonb, 7),
  ('loop_master', 'Loop Master', 'Place 100 loops total', '🎧', 'creative', 100,
   '{"type": "count", "field": "loops_placed_total", "threshold": 100}'::jsonb, 8),
  ('loop_legend', 'Loop Legend', 'Place 500 loops total', '🏆', 'creative', 250,
   '{"type": "count", "field": "loops_placed_total", "threshold": 500}'::jsonb, 9),

  -- Assignment Badges
  ('first_submission', 'Homework Hero', 'Submit your first assignment', '📝', 'assignment', 25,
   '{"type": "count", "field": "assignments_completed", "threshold": 1}'::jsonb, 20),
  ('five_submissions', 'Dedicated Student', 'Complete 5 assignments', '📚', 'assignment', 50,
   '{"type": "count", "field": "assignments_completed", "threshold": 5}'::jsonb, 21),
  ('ten_submissions', 'Assignment Ace', 'Complete 10 assignments', '🌟', 'assignment', 100,
   '{"type": "count", "field": "assignments_completed", "threshold": 10}'::jsonb, 22),
  ('twenty_submissions', 'Scholar', 'Complete 20 assignments', '🎓', 'assignment', 200,
   '{"type": "count", "field": "assignments_completed", "threshold": 20}'::jsonb, 23),

  -- Milestone Badges (Level-based)
  ('level_5', 'Rising Star', 'Reach Level 5', '⭐', 'milestone', 50,
   '{"type": "level", "level": 5}'::jsonb, 40),
  ('level_10', 'Shining Bright', 'Reach Level 10', '✨', 'milestone', 100,
   '{"type": "level", "level": 10}'::jsonb, 41),
  ('level_15', 'Beat Maker', 'Reach Level 15', '🎵', 'milestone', 150,
   '{"type": "level", "level": 15}'::jsonb, 42),
  ('level_25', 'Music Maestro', 'Reach Level 25', '🎭', 'milestone', 250,
   '{"type": "level", "level": 25}'::jsonb, 43),
  ('level_50', 'Living Legend', 'Reach Level 50', '👑', 'milestone', 500,
   '{"type": "level", "level": 50}'::jsonb, 44),

  -- Streak Badges
  ('streak_3', 'Three Day Groove', 'Login 3 days in a row', '🔥', 'streak', 25,
   '{"type": "streak", "days": 3}'::jsonb, 60),
  ('streak_7', 'Week Warrior', 'Login 7 days in a row', '🔥', 'streak', 75,
   '{"type": "streak", "days": 7}'::jsonb, 61),
  ('streak_14', 'Fortnight Fighter', 'Login 14 days in a row', '🔥', 'streak', 150,
   '{"type": "streak", "days": 14}'::jsonb, 62),
  ('streak_30', 'Monthly Master', 'Login 30 days in a row', '🔥', 'streak', 300,
   '{"type": "streak", "days": 30}'::jsonb, 63),

  -- Time-based Badges
  ('time_30', 'Getting Started', 'Spend 30 minutes on the platform', '⏱️', 'time', 25,
   '{"type": "time", "minutes": 30}'::jsonb, 80),
  ('time_60', 'Hour Hero', 'Spend 1 hour on the platform', '⏰', 'time', 50,
   '{"type": "time", "minutes": 60}'::jsonb, 81),
  ('time_300', 'Dedicated Learner', 'Spend 5 hours on the platform', '🕐', 'time', 100,
   '{"type": "time", "minutes": 300}'::jsonb, 82),
  ('time_600', 'Practice Makes Perfect', 'Spend 10 hours on the platform', '🕑', 'time', 200,
   '{"type": "time", "minutes": 600}'::jsonb, 83),
  ('time_1800', 'Music Marathon', 'Spend 30 hours on the platform', '🕒', 'time', 500,
   '{"type": "time", "minutes": 1800}'::jsonb, 84)
ON CONFLICT (badge_key) DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES (run to test)
-- ============================================

-- Check tables were created
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%progress%' OR table_name LIKE '%badge%' OR table_name = 'xp_activities' OR table_name = 'daily_activity';

-- Check badges were seeded
-- SELECT badge_key, name, category FROM badge_definitions ORDER BY display_order;
