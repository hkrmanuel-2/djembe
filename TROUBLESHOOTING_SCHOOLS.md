# Troubleshooting: Schools Not Showing in Signup Form

## Common Issues and Solutions

### 1. Check Browser Console
Open your browser's developer console (F12) and look for errors when the signup page loads. You should see:
- "Loaded schools: [...]" if schools are loaded successfully
- Error messages if there's a problem

### 2. Verify Table Name
The code tries both `Schools` and `schools`. Check your actual table name in Supabase:

```sql
-- Check your table name
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%school%';
```

**If your table is lowercase `schools`:**
- The code will automatically try both, but you can update line 58 in `signup-form.tsx` to use `"schools"` directly

### 3. Check Row Level Security (RLS)
If RLS is enabled on the Schools table, you need to allow public read access:

```sql
-- Enable RLS
ALTER TABLE Schools ENABLE ROW LEVEL SECURITY;

-- Allow public to read schools (for signup)
CREATE POLICY "Allow public to read schools" ON Schools
  FOR SELECT
  USING (true);
```

### 4. Verify Schools Exist
Make sure you have schools in your database:

```sql
-- Check if schools exist
SELECT * FROM Schools;

-- If empty, add a test school
INSERT INTO Schools (name, address) 
VALUES ('Test School', '123 Test St');
```

### 5. Check Supabase Connection
Verify your Supabase credentials in `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 6. Check Network Tab
In browser DevTools → Network tab, look for the request to Supabase:
- Should be a GET request to `/rest/v1/Schools`
- Check the response status and body

## Quick Fix: Test Query

Run this in Supabase SQL Editor to test:

```sql
-- Test query (should return schools)
SELECT school_id, name, allowed_domains 
FROM Schools 
ORDER BY name;
```

If this works but the app doesn't show schools, it's likely an RLS policy issue.