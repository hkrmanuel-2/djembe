-- =====================================================
-- ADMIN SYSTEM DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. CREATE ADMINS TABLE
CREATE TABLE IF NOT EXISTS admins (
  admin_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  school_id UUID REFERENCES schools(school_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ADD APPROVAL STATUS TO TEACHERS AND STUDENTS
-- Add approval_status column to teachers table
ALTER TABLE teachers
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES admins(admin_id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- Add approval_status column to students table
ALTER TABLE students
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES admins(admin_id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- 3. CREATE CLASSES TABLE (if not exists)
CREATE TABLE IF NOT EXISTS classes (
  class_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_name VARCHAR(255) NOT NULL,
  school_id UUID REFERENCES schools(school_id) ON DELETE CASCADE,
  grade_level VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CREATE CLASS ASSIGNMENTS TABLE (Teacher-Class relationships)
CREATE TABLE IF NOT EXISTS class_assignments (
  assignment_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES teachers(teacher_id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(class_id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES admins(admin_id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(teacher_id, class_id)
);

-- 5. CREATE STUDENT CLASS ENROLLMENTS (if not exists)
CREATE TABLE IF NOT EXISTS student_enrollments (
  enrollment_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(student_id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(class_id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, class_id)
);

-- 6. CREATE ACCESS CONTROLS TABLE
CREATE TABLE IF NOT EXISTS access_controls (
  control_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES schools(school_id) ON DELETE CASCADE,
  feature_name VARCHAR(100) NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  max_students_per_teacher INTEGER DEFAULT NULL,
  max_projects_per_student INTEGER DEFAULT NULL,
  allow_student_signup BOOLEAN DEFAULT true,
  allow_teacher_signup BOOLEAN DEFAULT true,
  require_admin_approval BOOLEAN DEFAULT false,
  custom_settings JSONB DEFAULT '{}',
  updated_by UUID REFERENCES admins(admin_id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(school_id, feature_name)
);

-- 7. ENABLE ROW LEVEL SECURITY
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_controls ENABLE ROW LEVEL SECURITY;

-- 8. CREATE POLICIES

-- Admins table policies
CREATE POLICY "Admins can view all admins in their school" ON admins
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert new admins" ON admins
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update their own record" ON admins
  FOR UPDATE USING (true);

-- Classes policies
CREATE POLICY "Anyone can view classes in their school" ON classes
  FOR SELECT USING (true);

CREATE POLICY "Admins can create classes" ON classes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update classes" ON classes
  FOR UPDATE USING (true);

CREATE POLICY "Admins can delete classes" ON classes
  FOR DELETE USING (true);

-- Class assignments policies
CREATE POLICY "Anyone can view class assignments" ON class_assignments
  FOR SELECT USING (true);

CREATE POLICY "Admins can create class assignments" ON class_assignments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can delete class assignments" ON class_assignments
  FOR DELETE USING (true);

-- Student enrollments policies
CREATE POLICY "Anyone can view student enrollments" ON student_enrollments
  FOR SELECT USING (true);

CREATE POLICY "Teachers and admins can create enrollments" ON student_enrollments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Teachers and admins can delete enrollments" ON student_enrollments
  FOR DELETE USING (true);

-- Access controls policies
CREATE POLICY "Anyone can view access controls for their school" ON access_controls
  FOR SELECT USING (true);

CREATE POLICY "Admins can create access controls" ON access_controls
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update access controls" ON access_controls
  FOR UPDATE USING (true);

-- 9. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_admins_school_id ON admins(school_id);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

CREATE INDEX IF NOT EXISTS idx_teachers_approval_status ON teachers(approval_status);
CREATE INDEX IF NOT EXISTS idx_teachers_school_approval ON teachers(school_id, approval_status);

CREATE INDEX IF NOT EXISTS idx_students_approval_status ON students(approval_status);
CREATE INDEX IF NOT EXISTS idx_students_school_approval ON students(school_id, approval_status);

CREATE INDEX IF NOT EXISTS idx_classes_school_id ON classes(school_id);

CREATE INDEX IF NOT EXISTS idx_class_assignments_teacher ON class_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_class_assignments_class ON class_assignments(class_id);

CREATE INDEX IF NOT EXISTS idx_student_enrollments_student ON student_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_enrollments_class ON student_enrollments(class_id);

CREATE INDEX IF NOT EXISTS idx_access_controls_school ON access_controls(school_id);

-- 10. CREATE AUTO-UPDATE TIMESTAMP FUNCTIONS
CREATE OR REPLACE FUNCTION update_admin_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_admin_timestamp
  BEFORE UPDATE ON admins
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_updated_at();

CREATE TRIGGER trigger_update_class_timestamp
  BEFORE UPDATE ON classes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_access_controls_timestamp
  BEFORE UPDATE ON access_controls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 11. SAMPLE DATA FOR DEFAULT ACCESS CONTROLS
-- Insert default access controls for each school (run after schools are created)
-- INSERT INTO access_controls (school_id, feature_name, is_enabled)
-- SELECT school_id, 'default_access', true
-- FROM schools
-- WHERE NOT EXISTS (
--   SELECT 1 FROM access_controls
--   WHERE access_controls.school_id = schools.school_id
--   AND access_controls.feature_name = 'default_access'
-- );

-- 12. VIEW FOR PENDING APPROVALS
CREATE OR REPLACE VIEW pending_approvals AS
SELECT
  'teacher' as user_type,
  teacher_id as user_id,
  first_name,
  last_name,
  email,
  school_id,
  created_at
FROM teachers
WHERE approval_status = 'pending'
UNION ALL
SELECT
  'student' as user_type,
  student_id as user_id,
  first_name,
  last_name,
  email,
  school_id,
  created_at
FROM students
WHERE approval_status = 'pending'
ORDER BY created_at DESC;

-- NOTES:
-- 1. Run this script in your Supabase SQL Editor
-- 2. Make sure the schools table exists before running this
-- 3. Update existing users' approval_status if needed:
--    UPDATE teachers SET approval_status = 'approved' WHERE approval_status IS NULL;
--    UPDATE students SET approval_status = 'approved' WHERE approval_status IS NULL;
