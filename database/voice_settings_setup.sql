-- ============================================
-- VOICE SETTINGS TABLE FOR 3D WORLDS
-- Run this in Supabase SQL Editor
-- ============================================
-- This table stores teacher configurations for
-- the Voices panel in 3D Worlds. Settings control
-- how Suno API generates and separates stems.
-- ============================================

-- 1. CREATE VOICE_SETTINGS TABLE
CREATE TABLE IF NOT EXISTS voice_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(school_id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES teachers(teacher_id) ON DELETE CASCADE,
  world_id VARCHAR(50) NOT NULL DEFAULT 'world1',  -- e.g., "world1", "world2"

  -- Music generation settings
  bpm INTEGER DEFAULT 120 CHECK (bpm >= 60 AND bpm <= 200),
  genre VARCHAR(50),           -- e.g., "afrobeat", "jazz", "electronic", "hip-hop"
  style VARCHAR(100),          -- e.g., "upbeat", "relaxed", "energetic", "chill"
  mood VARCHAR(100),           -- e.g., "happy", "calm", "intense", "dreamy"

  -- Optional: Custom prompt additions
  custom_prompt TEXT,          -- Additional prompt text for Suno

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one setting per school + world combination
  UNIQUE(school_id, world_id)
);

-- 2. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_voice_settings_school ON voice_settings(school_id);
CREATE INDEX IF NOT EXISTS idx_voice_settings_teacher ON voice_settings(teacher_id);
CREATE INDEX IF NOT EXISTS idx_voice_settings_world ON voice_settings(school_id, world_id);

-- 2b. MIGRATION: Add world_id to existing table (run this if table already exists)
-- ALTER TABLE voice_settings ADD COLUMN IF NOT EXISTS world_id VARCHAR(50) NOT NULL DEFAULT 'world1';
-- ALTER TABLE voice_settings DROP CONSTRAINT IF EXISTS voice_settings_school_id_key;
-- ALTER TABLE voice_settings ADD CONSTRAINT voice_settings_school_world_unique UNIQUE(school_id, world_id);

-- 3. ROW LEVEL SECURITY
ALTER TABLE voice_settings ENABLE ROW LEVEL SECURITY;

-- Teachers can manage voice settings for their school
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'voice_settings' AND policyname = 'Teachers can manage school voice settings'
  ) THEN
    CREATE POLICY "Teachers can manage school voice settings" ON voice_settings
      FOR ALL USING (
        school_id IN (SELECT school_id FROM teachers WHERE email = auth.jwt()->>'email')
        OR teacher_id IN (SELECT teacher_id FROM teachers WHERE email = auth.jwt()->>'email')
      );
  END IF;
END $$;

-- Students can read voice settings for their school (to fetch settings for Suno generation)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'voice_settings' AND policyname = 'Students can read school voice settings'
  ) THEN
    CREATE POLICY "Students can read school voice settings" ON voice_settings
      FOR SELECT USING (
        school_id IN (SELECT school_id FROM students WHERE email = auth.jwt()->>'email')
      );
  END IF;
END $$;

-- 4. AUTO-UPDATE TRIGGER FOR updated_at
CREATE OR REPLACE FUNCTION update_voice_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_voice_settings_updated_at ON voice_settings;
CREATE TRIGGER update_voice_settings_updated_at
  BEFORE UPDATE ON voice_settings
  FOR EACH ROW EXECUTE FUNCTION update_voice_settings_updated_at();

-- ============================================
-- VERIFICATION QUERIES (run to test)
-- ============================================

-- Check table was created
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'voice_settings';

-- Check policies
-- SELECT policyname FROM pg_policies WHERE tablename = 'voice_settings';

-- Test insert (replace with actual IDs)
-- INSERT INTO voice_settings (school_id, teacher_id, bpm, genre, style, mood)
-- VALUES ('your-school-id', 'your-teacher-id', 100, 'afrobeat', 'upbeat', 'happy');
