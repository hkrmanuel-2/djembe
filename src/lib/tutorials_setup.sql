-- Tutorials System Setup for Djembe
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. TUTORIALS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS tutorials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category VARCHAR(100) NOT NULL,
  target_audience VARCHAR(20) NOT NULL CHECK (target_audience IN ('student', 'teacher', 'both')),
  difficulty_level VARCHAR(20) NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  duration_minutes INT,
  is_preset BOOLEAN DEFAULT FALSE,
  created_by_teacher_id UUID REFERENCES teachers(teacher_id) ON DELETE SET NULL,
  school_id UUID REFERENCES schools(school_id) ON DELETE CASCADE,
  order_index INT DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  view_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories: 'getting-started', 'daw', 'assignments', 'worlds', 'teacher-tools'
-- Target Audience: 'student', 'teacher', 'both'
-- Difficulty: 'beginner', 'intermediate', 'advanced'

-- ============================================
-- 2. INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_tutorials_category ON tutorials(category);
CREATE INDEX IF NOT EXISTS idx_tutorials_audience ON tutorials(target_audience);
CREATE INDEX IF NOT EXISTS idx_tutorials_school ON tutorials(school_id);
CREATE INDEX IF NOT EXISTS idx_tutorials_preset ON tutorials(is_preset);
CREATE INDEX IF NOT EXISTS idx_tutorials_published ON tutorials(is_published);
CREATE INDEX IF NOT EXISTS idx_tutorials_order ON tutorials(order_index);

-- ============================================
-- 3. ROW LEVEL SECURITY POLICIES
-- ============================================

ALTER TABLE tutorials ENABLE ROW LEVEL SECURITY;

-- Everyone can view published tutorials (presets or their school's)
CREATE POLICY "view_tutorials" ON tutorials
  FOR SELECT USING (
    is_published = TRUE AND (
      is_preset = TRUE OR
      school_id IN (
        SELECT school_id FROM students WHERE email = auth.jwt()->>'email'
        UNION
        SELECT school_id FROM teachers WHERE email = auth.jwt()->>'email'
      )
    )
  );

-- Teachers can create tutorials for their school
CREATE POLICY "teachers_create_tutorials" ON tutorials
  FOR INSERT WITH CHECK (
    created_by_teacher_id IN (
      SELECT teacher_id FROM teachers WHERE email = auth.jwt()->>'email'
    )
  );

-- Teachers can update/delete their own tutorials (not presets)
CREATE POLICY "teachers_manage_own_tutorials" ON tutorials
  FOR ALL USING (
    is_preset = FALSE AND
    created_by_teacher_id IN (
      SELECT teacher_id FROM teachers WHERE email = auth.jwt()->>'email'
    )
  );

-- ============================================
-- 4. HELPER FUNCTION - INCREMENT VIEW COUNT
-- ============================================

CREATE OR REPLACE FUNCTION increment_tutorial_views(tutorial_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE tutorials
  SET view_count = view_count + 1
  WHERE id = tutorial_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_tutorial_views TO authenticated;

-- ============================================
-- 5. SEED PRESET TUTORIALS
-- ============================================

-- Student Tutorials
INSERT INTO tutorials (
  title,
  description,
  video_url,
  thumbnail_url,
  category,
  target_audience,
  difficulty_level,
  duration_minutes,
  is_preset,
  order_index,
  is_published
) VALUES
  -- Getting Started
  (
    'Welcome to Djembe',
    'Quick overview of the Djembe platform and its features for students. Learn how to navigate the interface and get started with your musical journey.',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    'getting-started',
    'student',
    'beginner',
    2,
    TRUE,
    1,
    TRUE
  ),
  (
    'Platform Navigation',
    'Learn how to use the navigation bar and access different sections of Djembe. Understand the layout and find your way around easily.',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    'getting-started',
    'student',
    'beginner',
    3,
    TRUE,
    2,
    TRUE
  ),

  -- DAW-Lite Tutorials
  (
    'DAW-Lite Basics',
    'Introduction to the Digital Audio Workstation. Learn about the timeline, loops, and basic controls for creating music.',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    'daw',
    'student',
    'beginner',
    5,
    TRUE,
    3,
    TRUE
  ),
  (
    'Creating Your First Beat',
    'Step-by-step guide to creating your first beat using the DAW-Lite. Learn how to drag loops, arrange them on the timeline, and play back your creation.',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    'daw',
    'student',
    'beginner',
    8,
    TRUE,
    4,
    TRUE
  ),
  (
    'Understanding BPM and Tempo',
    'Learn about beats per minute and how tempo affects your music. Discover how to adjust BPM and match loops correctly.',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    'daw',
    'student',
    'intermediate',
    6,
    TRUE,
    5,
    TRUE
  ),
  (
    'Advanced Timeline Techniques',
    'Master advanced features like loop trimming, timeline extension, and precise placement for professional-sounding tracks.',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    'daw',
    'student',
    'advanced',
    10,
    TRUE,
    6,
    TRUE
  ),
  (
    'Exporting Your Project',
    'Learn how to export your finished project as an audio file. Understand the difference between MP3 and WAV formats.',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    'daw',
    'student',
    'beginner',
    4,
    TRUE,
    7,
    TRUE
  ),

  -- Assignments Tutorials
  (
    'Viewing Assignments',
    'Learn how to view your assigned projects and understand due dates, requirements, and submission status.',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    'assignments',
    'student',
    'beginner',
    3,
    TRUE,
    8,
    TRUE
  ),
  (
    'Submitting Your Work',
    'Step-by-step guide to submitting assignments. Learn how to upload files and confirm your submission.',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    'assignments',
    'student',
    'beginner',
    4,
    TRUE,
    9,
    TRUE
  ),
  (
    'Understanding Feedback',
    'Learn how to view and interpret teacher feedback on your assignments. Use feedback to improve your skills.',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    'assignments',
    'student',
    'beginner',
    3,
    TRUE,
    10,
    TRUE
  ),

  -- 3D Worlds Tutorials
  (
    'Exploring 3D Worlds',
    'Navigate and interact with immersive 3D environments. Learn camera controls and how to explore each world.',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    'worlds',
    'student',
    'beginner',
    5,
    TRUE,
    11,
    TRUE
  ),
  (
    'Using the Voices Panel',
    'Learn how to use the Voices Panel to control music in 3D worlds. Adjust stems and customize your listening experience.',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    'worlds',
    'student',
    'intermediate',
    6,
    TRUE,
    12,
    TRUE
  ),

  -- Teacher Tutorials
  (
    'Teacher Dashboard Overview',
    'Comprehensive guide to the teacher dashboard. Learn how to monitor student progress, view statistics, and manage your classes.',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    'teacher-tools',
    'teacher',
    'beginner',
    7,
    TRUE,
    1,
    TRUE
  ),
  (
    'Creating and Managing Classes',
    'Learn how to create classes, add students, and organize your teaching groups for better management.',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    'teacher-tools',
    'teacher',
    'beginner',
    5,
    TRUE,
    2,
    TRUE
  ),
  (
    'Creating Assignments',
    'Step-by-step guide to creating and distributing assignments. Learn about assignment types, due dates, and class targeting.',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    'assignments',
    'teacher',
    'beginner',
    6,
    TRUE,
    3,
    TRUE
  ),
  (
    'Reviewing Submissions',
    'Learn how to view student submissions, access their files, and track submission status.',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    'teacher-tools',
    'teacher',
    'beginner',
    5,
    TRUE,
    4,
    TRUE
  ),
  (
    'Grading and Providing Feedback',
    'Master the grading interface. Learn how to assign scores, write meaningful feedback, and help students improve.',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    'teacher-tools',
    'teacher',
    'beginner',
    8,
    TRUE,
    5,
    TRUE
  ),
  (
    'Understanding Student Analytics',
    'Learn how to use analytics to identify struggling students and track class progress. Use data to inform your teaching.',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    'teacher-tools',
    'teacher',
    'intermediate',
    9,
    TRUE,
    6,
    TRUE
  ),
  (
    'Creating Custom Tutorials',
    'Learn how to create and upload your own tutorial videos for your students. Customize learning materials for your class.',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    'teacher-tools',
    'teacher',
    'intermediate',
    7,
    TRUE,
    7,
    TRUE
  );

-- ============================================
-- 6. UPDATED_AT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_tutorials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tutorials_updated_at_trigger
  BEFORE UPDATE ON tutorials
  FOR EACH ROW
  EXECUTE FUNCTION update_tutorials_updated_at();

-- ============================================
-- SETUP COMPLETE
-- ============================================

-- Verify installation
SELECT COUNT(*) as preset_tutorials_count FROM tutorials WHERE is_preset = TRUE;
