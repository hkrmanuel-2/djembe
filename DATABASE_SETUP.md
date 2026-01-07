# Database Setup for Email Domain Validation

## Step 1: Add `allowed_domains` Column to Schools Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Add allowed_domains column to Schools table
-- This can store an array of allowed email domains (e.g., ["school.edu", "school.org"])
ALTER TABLE Schools 
ADD COLUMN IF NOT EXISTS allowed_domains TEXT[];

-- Or if you prefer JSON format:
-- ALTER TABLE Schools 
-- ADD COLUMN IF NOT EXISTS allowed_domains JSONB;
```

## Step 2: Add Sample Data

Update your schools with allowed domains:

```sql
-- Example: Update a school with allowed domains
UPDATE Schools 
SET allowed_domains = ARRAY['school.edu', 'school.org', 'mail.school.edu']
WHERE name = 'Your School Name';

-- Or using JSON format:
-- UPDATE Schools 
-- SET allowed_domains = '["school.edu", "school.org"]'::jsonb
-- WHERE name = 'Your School Name';
```

## Step 3: Example Schools with Domains

```sql
-- Example schools with domain restrictions
INSERT INTO Schools (name, address, allowed_domains) VALUES
  ('Lincoln High School', '123 Main St', ARRAY['lincoln.edu', 'lhs.edu']),
  ('Washington Elementary', '456 Oak Ave', ARRAY['washington.edu']),
  ('Roosevelt Middle School', '789 Pine Rd', ARRAY['roosevelt.edu', 'rms.edu'])
ON CONFLICT DO NOTHING;
```

## How It Works

1. **During Signup**: When a user selects a school and enters their email, the system:
   - Extracts the domain from the email (e.g., "user@school.edu" → "school.edu")
   - Checks if the domain matches any of the school's `allowed_domains`
   - Shows an error if the domain doesn't match
   - Allows signup if the domain matches

2. **Domain Matching**:
   - Exact match: "user@school.edu" matches "school.edu"
   - Subdomain match: "user@mail.school.edu" matches "school.edu"

3. **Flexibility**:
   - If `allowed_domains` is NULL or empty, any email is accepted (for schools without restrictions)
   - Multiple domains can be configured per school

## Notes

- The `allowed_domains` column can be:
  - `TEXT[]` (PostgreSQL array) - Recommended
  - `JSONB` (JSON array) - Also supported
  - `NULL` - No restrictions (any email accepted)

- Domain matching is case-insensitive
- Subdomains are automatically supported (e.g., "mail.school.edu" matches "school.edu")