/**
 * Create test accounts for God's Grace International School
 *
 * Usage:
 *   1. Add SUPABASE_SERVICE_ROLE_KEY to your .env file
 *   2. Run: node scripts/create-test-accounts.js
 *
 * Creates:
 *   - 1 teacher account
 *   - 12 student accounts
 *   - All pre-approved and ready to log in
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load .env.local manually
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^\s*([\w]+)\s*=\s*"?([^"]*)"?\s*$/);
  if (match) env[match[1]] = match[2];
}

const supabaseUrl = env.VITE_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

// Admin client bypasses RLS
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const SCHOOL_NAME = "God's Grace International School";
const EMAIL_DOMAIN = 'godsgrace.test';
const DEFAULT_PASSWORD = 'djembe2026';

// Teacher account
const teacher = {
  first_name: 'Teacher',
  last_name: 'GodGrace',
  email: `teacher@${EMAIL_DOMAIN}`,
};

// 12 Student accounts
const students = Array.from({ length: 12 }, (_, i) => ({
  first_name: `Student`,
  last_name: `${i + 1}`,
  email: `student${i + 1}@${EMAIL_DOMAIN}`,
}));

async function main() {
  console.log('=== Creating Test Accounts for God\'s Grace International School ===\n');

  // 1. Ensure school exists
  console.log('1. Setting up school...');
  let { data: school } = await supabase
    .from('schools')
    .select('school_id')
    .eq('name', SCHOOL_NAME)
    .single();

  if (!school) {
    const { data, error } = await supabase
      .from('schools')
      .insert({
        name: SCHOOL_NAME,
        allowed_domains: [EMAIL_DOMAIN],
      })
      .select('school_id')
      .single();

    if (error) {
      console.error('Failed to create school:', error.message);
      process.exit(1);
    }
    school = data;
    console.log(`   Created school: ${SCHOOL_NAME}`);
  } else {
    // Make sure the test domain is in allowed_domains
    const { data: schoolData } = await supabase
      .from('schools')
      .select('allowed_domains')
      .eq('school_id', school.school_id)
      .single();

    const domains = schoolData?.allowed_domains || [];
    if (!domains.includes(EMAIL_DOMAIN)) {
      await supabase
        .from('schools')
        .update({ allowed_domains: [...domains, EMAIL_DOMAIN] })
        .eq('school_id', school.school_id);
      console.log(`   Added ${EMAIL_DOMAIN} to allowed domains`);
    }
    console.log(`   School already exists`);
  }

  const schoolId = school.school_id;

  // 2. Create teacher first (needed for class)
  console.log('\n2. Creating teacher account...');
  await createUser(teacher, 'teachers', 'teacher_id', schoolId, null);

  // Get teacher_id
  const { data: teacherRow } = await supabase
    .from('teachers')
    .select('teacher_id')
    .eq('email', teacher.email)
    .single();

  if (!teacherRow) {
    console.error('Failed to find teacher record');
    process.exit(1);
  }

  // 3. Create a class for the students
  console.log('\n3. Setting up class...');
  let { data: cls } = await supabase
    .from('classes')
    .select('class_id')
    .eq('school_id', schoolId)
    .limit(1)
    .single();

  if (!cls) {
    const { data, error } = await supabase
      .from('classes')
      .insert({
        name: 'Music Class 1',
        school_id: schoolId,
        teacher_id: teacherRow.teacher_id,
        grade_level: 'Primary',
        description: 'Test class for user testing',
      })
      .select('class_id')
      .single();

    if (error) {
      console.error('Failed to create class:', error.message);
      process.exit(1);
    }
    cls = data;
    console.log('   Created class: Music Class 1');
  } else {
    console.log('   Class already exists');
  }

  const classId = cls.class_id;

  // 4. Create students
  console.log('\n4. Creating student accounts...');
  for (const student of students) {
    await createUser(student, 'students', 'student_id', schoolId, classId);
  }

  // 4. Print summary
  console.log('\n=== All Done! ===\n');
  console.log('Password for ALL accounts:', DEFAULT_PASSWORD);
  console.log('\nTeacher:');
  console.log(`  Email: ${teacher.email}`);
  console.log('\nStudents:');
  students.forEach(s => console.log(`  Email: ${s.email}`));
  console.log(`\nSchool: ${SCHOOL_NAME}`);
}

async function createUser(user, table, idColumn, schoolId, classId) {
  // Check if profile already exists
  const { data: existing } = await supabase
    .from(table)
    .select(idColumn)
    .eq('email', user.email)
    .single();

  if (existing) {
    console.log(`   [skip] ${user.email} already exists`);
    return;
  }

  // Create auth user (admin API - no email confirmation needed)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: user.email,
    password: DEFAULT_PASSWORD,
    email_confirm: true, // Auto-confirm, no verification email
  });

  if (authError) {
    // User might exist in auth but not in profile table
    if (authError.message.includes('already been registered')) {
      console.log(`   [auth exists] ${user.email} - creating profile only`);
    } else {
      console.error(`   [error] ${user.email}: ${authError.message}`);
      return;
    }
  }

  // Create profile record
  const profileData = {
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    school_id: schoolId,
    approval_status: 'approved',
  };
  if (classId) profileData.class_id = classId;

  const { error: profileError } = await supabase
    .from(table)
    .insert(profileData);

  if (profileError) {
    console.error(`   [error] ${user.email} profile: ${profileError.message}`);
  } else {
    console.log(`   [created] ${user.email}`);
  }
}

main().catch(console.error);
