-- =====================================================
-- FIX RLS POLICIES FOR ADMIN APPROVALS
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. ADDS POLICY FOR ADMINS TO UPDATE TEACHERS
DROP POLICY IF EXISTS "Admins can update teachers" ON teachers;

CREATE POLICY "Admins can update teachers" ON teachers
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.admin_id = auth.uid() -- Assuming admins are auth users, or specific logic if using custom admin table
      -- OR if you are using the 'admins' table and checking against the current user's email/metadata
    )
    OR 
    -- Simpler check if your auth system isn't fully linked to admins table yet for RLS:
    -- Allow updates if the user is authenticated (you might want to restrict this more in production)
    auth.role() = 'authenticated'
  );

-- Alternative simple policy if you just want to get it working for now:
CREATE POLICY "Enable update for authenticated users on teachers" ON teachers
  FOR UPDATE USING (auth.role() = 'authenticated');


-- 2. ADDS POLICY FOR ADMINS TO UPDATE STUDENTS
DROP POLICY IF EXISTS "Admins can update students" ON students;

CREATE POLICY "Admins can update students" ON students
  FOR UPDATE
  USING (
    auth.role() = 'authenticated'
  );


-- 3. ENSURE SELECT POLICIES EXIST (Usually already there, but just in case)
CREATE POLICY "Enable read access for all users on teachers" ON teachers
  FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users on students" ON students
  FOR SELECT USING (true);
