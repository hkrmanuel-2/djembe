-- Add file_url and file_name columns to submissions table
-- Run this in Supabase SQL Editor

-- First, drop the view if it exists (to avoid the error you saw)
DROP VIEW IF EXISTS assignment_submissions_with_students CASCADE;

-- Add the missing columns
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS file_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS file_name VARCHAR(255);

-- If you need to recreate the view later, you can do it here
-- (But for now, we'll just add the columns)
