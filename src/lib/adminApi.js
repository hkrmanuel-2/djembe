import { supabase } from './supabase';

// ============================
// ADMIN USER MANAGEMENT
// ============================

/**
 * Get admin profile by email
 */
export async function getAdminByEmail(email) {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching admin:', error);
    return { data: null, error };
  }
}

/**
 * Create a new admin
 */
export async function createAdmin(adminData) {
  try {
    const { data, error } = await supabase
      .from('admins')
      .insert([adminData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating admin:', error);
    return { data: null, error };
  }
}

// ============================
// PENDING APPROVALS
// ============================

/**
 * Get all pending approvals for a school
 */
export async function getPendingApprovals(schoolId) {
  try {
    const { data, error } = await supabase
      .from('pending_approvals')
      .select('*')
      .eq('school_id', schoolId);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    return { data: null, error };
  }
}

/**
 * Approve a user (teacher or student)
 */
export async function approveUser(userType, userId, adminId) {
  try {
    const table = userType === 'teacher' ? 'teachers' : 'students';
    const idColumn = userType === 'teacher' ? 'teacher_id' : 'student_id';

    const { data, error } = await supabase
      .from(table)
      .update({
        approval_status: 'approved',
        approved_by: adminId,
        approved_at: new Date().toISOString()
      })
      .eq(idColumn, userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error approving user:', error);
    return { data: null, error };
  }
}

/**
 * Reject a user (teacher or student)
 */
export async function rejectUser(userType, userId, adminId) {
  try {
    const table = userType === 'teacher' ? 'teachers' : 'students';
    const idColumn = userType === 'teacher' ? 'teacher_id' : 'student_id';

    const { data, error } = await supabase
      .from(table)
      .update({
        approval_status: 'rejected',
        approved_by: adminId,
        approved_at: new Date().toISOString()
      })
      .eq(idColumn, userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error rejecting user:', error);
    return { data: null, error };
  }
}

// ============================
// CLASS MANAGEMENT
// ============================

/**
 * Get all classes for a school
 */
export async function getSchoolClasses(schoolId) {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('school_id', schoolId)
      .order('class_name');

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching classes:', error);
    return { data: null, error };
  }
}

/**
 * Create a new class
 */
export async function createClass(classData) {
  try {
    const { data, error } = await supabase
      .from('classes')
      .insert([classData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating class:', error);
    return { data: null, error };
  }
}

/**
 * Update a class
 */
export async function updateClass(classId, updates) {
  try {
    const { data, error } = await supabase
      .from('classes')
      .update(updates)
      .eq('class_id', classId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating class:', error);
    return { data: null, error };
  }
}

/**
 * Delete a class
 */
export async function deleteClass(classId) {
  try {
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('class_id', classId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting class:', error);
    return { error };
  }
}

// ============================
// TEACHER-CLASS ASSIGNMENTS
// ============================

/**
 * Get all teachers for a school
 */
export async function getSchoolTeachers(schoolId) {
  try {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('school_id', schoolId)
      .eq('approval_status', 'approved')
      .order('last_name');

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return { data: null, error };
  }
}

/**
 * Get class assignments for a teacher
 */
export async function getTeacherClasses(teacherId) {
  try {
    const { data, error } = await supabase
      .from('class_assignments')
      .select(`
        *,
        classes:class_id (
          class_id,
          class_name,
          grade_level,
          description
        )
      `)
      .eq('teacher_id', teacherId);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching teacher classes:', error);
    return { data: null, error };
  }
}

/**
 * Assign a teacher to a class
 */
export async function assignTeacherToClass(teacherId, classId, adminId) {
  try {
    const { data, error } = await supabase
      .from('class_assignments')
      .insert([{
        teacher_id: teacherId,
        class_id: classId,
        assigned_by: adminId
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error assigning teacher to class:', error);
    return { data: null, error };
  }
}

/**
 * Remove a teacher from a class
 */
export async function removeTeacherFromClass(teacherId, classId) {
  try {
    const { error } = await supabase
      .from('class_assignments')
      .delete()
      .eq('teacher_id', teacherId)
      .eq('class_id', classId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error removing teacher from class:', error);
    return { error };
  }
}

// ============================
// STUDENT ENROLLMENTS
// ============================

/**
 * Get students for a school
 */
export async function getSchoolStudents(schoolId) {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('school_id', schoolId)
      .eq('approval_status', 'approved')
      .order('last_name');

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching students:', error);
    return { data: null, error };
  }
}

/**
 * Get students enrolled in a class
 */
export async function getClassStudents(classId) {
  try {
    const { data, error } = await supabase
      .from('student_enrollments')
      .select(`
        *,
        students:student_id (
          student_id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('class_id', classId);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching class students:', error);
    return { data: null, error };
  }
}

/**
 * Enroll a student in a class
 */
export async function enrollStudent(studentId, classId) {
  try {
    const { data, error } = await supabase
      .from('student_enrollments')
      .insert([{
        student_id: studentId,
        class_id: classId
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error enrolling student:', error);
    return { data: null, error };
  }
}

/**
 * Remove a student from a class
 */
export async function unenrollStudent(studentId, classId) {
  try {
    const { error } = await supabase
      .from('student_enrollments')
      .delete()
      .eq('student_id', studentId)
      .eq('class_id', classId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error unenrolling student:', error);
    return { error };
  }
}

// ============================
// ACCESS CONTROLS
// ============================

/**
 * Get access controls for a school
 */
export async function getAccessControls(schoolId) {
  try {
    const { data, error } = await supabase
      .from('access_controls')
      .select('*')
      .eq('school_id', schoolId);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching access controls:', error);
    return { data: null, error };
  }
}

/**
 * Update access control setting
 */
export async function updateAccessControl(controlId, updates, adminId) {
  try {
    const { data, error } = await supabase
      .from('access_controls')
      .update({
        ...updates,
        updated_by: adminId,
        updated_at: new Date().toISOString()
      })
      .eq('control_id', controlId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating access control:', error);
    return { data: null, error };
  }
}

/**
 * Create or update access control for a feature
 */
export async function upsertAccessControl(schoolId, featureName, settings, adminId) {
  try {
    const { data, error } = await supabase
      .from('access_controls')
      .upsert([{
        school_id: schoolId,
        feature_name: featureName,
        ...settings,
        updated_by: adminId,
        updated_at: new Date().toISOString()
      }], {
        onConflict: 'school_id,feature_name'
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error upserting access control:', error);
    return { data: null, error };
  }
}

// ============================
// STATISTICS AND REPORTS
// ============================

/**
 * Get dashboard statistics for a school
 */
export async function getSchoolStatistics(schoolId) {
  try {
    // Get counts
    const [teachersResult, studentsResult, classesResult, pendingResult] = await Promise.all([
      supabase.from('teachers').select('teacher_id', { count: 'exact', head: true }).eq('school_id', schoolId).eq('approval_status', 'approved'),
      supabase.from('students').select('student_id', { count: 'exact', head: true }).eq('school_id', schoolId).eq('approval_status', 'approved'),
      supabase.from('classes').select('class_id', { count: 'exact', head: true }).eq('school_id', schoolId),
      supabase.from('pending_approvals').select('user_id', { count: 'exact', head: true }).eq('school_id', schoolId)
    ]);

    return {
      data: {
        totalTeachers: teachersResult.count || 0,
        totalStudents: studentsResult.count || 0,
        totalClasses: classesResult.count || 0,
        pendingApprovals: pendingResult.count || 0
      },
      error: null
    };
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return { data: null, error };
  }
}
