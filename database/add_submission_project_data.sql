-- Add project_data column to submissions table
-- This stores the placed loops arrangement so students can reopen submitted projects
-- Run this in Supabase SQL Editor

ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS project_data JSONB;
