# Feedback Table Empty - Fix Guide

## Why the feedback table stays empty

Common causes:

1. **RLS blocking inserts** – Teachers can't INSERT because policies reference the wrong table (`assignment_submissions` instead of `submissions`) or use incorrect auth checks.
2. **Wrong foreign key** – `feedback.submission_id` may reference `submissions(id)` while your `submissions` table uses `submission_id` as the primary key.
3. **Auth mismatch** – Teacher lookup by `auth.jwt() ->> 'email'` may not match the `teachers` table.

## Fix

1. Open **Supabase Dashboard** → **SQL Editor**.
2. Run the script: `database/fix_feedback_table.sql`.

This script will:

- Create the `feedback` table if it doesn’t exist
- Drop and recreate RLS policies so teachers can INSERT
- Fix the students policy to use `submissions` (not `assignment_submissions`)
- Add indexes for performance

## If you still get FK errors

If `feedback` was created with `REFERENCES submissions(id)` but your `submissions` table uses `submission_id` as the primary key, run:

```sql
-- Check your submissions primary key
SELECT column_name FROM information_schema.key_column_usage 
WHERE table_name = 'submissions' AND constraint_name LIKE '%pkey%';

-- If it returns submission_id, fix the FK:
ALTER TABLE feedback DROP CONSTRAINT IF EXISTS feedback_submission_id_fkey;
ALTER TABLE feedback ADD CONSTRAINT feedback_submission_id_fkey 
  FOREIGN KEY (submission_id) REFERENCES submissions(submission_id) ON DELETE CASCADE;
```

## Verify

After running the fix:

1. As a teacher, submit feedback on a student submission.
2. In Supabase: **Table Editor** → **feedback** – confirm new rows appear.
3. As a student, open Assignments and check that feedback is visible.
