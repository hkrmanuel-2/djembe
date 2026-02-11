# Assignments Database Setup

Run this SQL in your Supabase SQL Editor to set up the assignments system:

```sql
-- 1. ASSIGNMENTS TABLE (stores assignments created by teachers)
CREATE TABLE IF NOT EXISTS assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ASSIGNMENT SUBMISSIONS TABLE (stores student submissions)
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  grade INTEGER CHECK (grade >= 0 AND grade <= 100),
  feedback TEXT,
  UNIQUE(assignment_id, student_id)
);

-- 3. ENABLE ROW LEVEL SECURITY
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;

-- 4. CREATE POLICIES
-- Students can view all assignments
CREATE POLICY "Students can view assignments" ON assignments
  FOR SELECT USING (true);

-- Teachers can manage assignments
CREATE POLICY "Teachers can manage assignments" ON assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM teachers 
      WHERE teachers.user_id = auth.uid()
    )
  );

-- Students can view their own submissions
CREATE POLICY "Students can view own submissions" ON assignment_submissions
  FOR SELECT USING (student_id = auth.uid());

-- Students can insert their own submissions
CREATE POLICY "Students can submit assignments" ON assignment_submissions
  FOR INSERT WITH CHECK (student_id = auth.uid());

-- Teachers can view all submissions
CREATE POLICY "Teachers can view all submissions" ON assignment_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM teachers 
      WHERE teachers.user_id = auth.uid()
    )
  );

-- 5. CREATE STORAGE BUCKET FOR ASSIGNMENT FILES
INSERT INTO storage.buckets (id, name, public)
VALUES ('assignments', 'assignments', true)
ON CONFLICT (id) DO NOTHING;

-- 6. STORAGE POLICIES
-- Students can upload files
CREATE POLICY "Students can upload files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'assignments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Students can view their own files
CREATE POLICY "Students can view own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'assignments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Teachers can view all files
CREATE POLICY "Teachers can view all files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'assignments' AND
    EXISTS (
      SELECT 1 FROM teachers 
      WHERE teachers.user_id = auth.uid()
    )
  );

-- 7. CREATE INDEXES
CREATE INDEX IF NOT EXISTS assignments_created_by_idx ON assignments(created_by);
CREATE INDEX IF NOT EXISTS assignments_due_date_idx ON assignments(due_date);
CREATE INDEX IF NOT EXISTS submissions_assignment_id_idx ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS submissions_student_id_idx ON assignment_submissions(student_id);

-- 8. AUTO-UPDATE TIMESTAMP
CREATE OR REPLACE FUNCTION update_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_assignments_updated_at
  BEFORE UPDATE ON assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_assignments_updated_at();
```

## Sample Data

To test the assignments feature, you can insert sample assignments:

```sql
-- Insert sample assignment (replace created_by with a teacher's user_id)
INSERT INTO assignments (title, description, due_date, created_by)
VALUES (
  'Create Your First Beat',
  'Use DAW-Lite to create a 30-second beat using at least 3 different loops.',
  NOW() + INTERVAL '7 days',
  'YOUR_TEACHER_USER_ID_HERE'
);
```
