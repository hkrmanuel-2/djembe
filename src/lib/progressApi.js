import { supabase } from "./supabase";

/**
 * Get all students for a teacher with their progress summaries
 * @param {string} schoolId - The school ID to filter students
 * @param {string|string[]|null} classFilter - Single class ID, array of class IDs, or null
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export async function getStudentsWithProgress(schoolId, classFilter = null) {
  let query = supabase
    .from("students")
    .select(`
      student_id,
      first_name,
      last_name,
      email,
      created_at,
      class_id,
      student_progress (
        total_xp,
        current_level,
        assignments_completed,
        projects_created,
        projects_exported,
        loops_placed_total,
        current_streak,
        last_activity_date,
        updated_at
      )
    `)
    .eq("school_id", schoolId);

  // Filter by class(es) if provided
  if (classFilter) {
    if (Array.isArray(classFilter)) {
      // Filter by multiple class IDs
      query = query.in("class_id", classFilter);
    } else {
      // Filter by single class ID
      query = query.eq("class_id", classFilter);
    }
  }

  const { data, error } = await query.order("last_name", { ascending: true });

  if (error) return { data: null, error: error.message };

  // Flatten the progress data
  const studentsWithProgress = data.map(student => ({
    ...student,
    progress: student.student_progress?.[0] || null,
    student_progress: undefined,
  }));

  return { data: studentsWithProgress, error: null };
}

/**
 * Get detailed progress for a single student
 * @param {string} studentId - The student's ID
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export async function getStudentDetailedProgress(studentId) {
  try {
    // Get student info
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("*")
      .eq("student_id", studentId)
      .single();

    if (studentError) throw studentError;

    // Get progress
    const { data: progress, error: progressError } = await supabase
      .from("student_progress")
      .select("*")
      .eq("student_id", studentId)
      .single();

    // Get badges
    const { data: badges, error: badgesError } = await supabase
      .from("student_badges")
      .select(`
        *,
        badge_definitions (*)
      `)
      .eq("student_id", studentId)
      .order("unlocked_at", { ascending: false });

    if (badgesError) throw badgesError;

    // Get recent activities (last 30)
    const { data: activities, error: activitiesError } = await supabase
      .from("xp_activities")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
      .limit(30);

    if (activitiesError) throw activitiesError;

    // Get activity trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: dailyTrend, error: trendError } = await supabase
      .from("daily_activity")
      .select("*")
      .eq("student_id", studentId)
      .gte("activity_date", thirtyDaysAgo.toISOString().split("T")[0])
      .order("activity_date", { ascending: true });

    if (trendError) throw trendError;

    return {
      data: {
        student,
        progress: progress || null,
        badges: badges || [],
        activities: activities || [],
        dailyTrend: dailyTrend || [],
      },
      error: null,
    };

  } catch (error) {
    console.error("Get student detailed progress error:", error);
    return { data: null, error: error.message };
  }
}

/**
 * Get class aggregate statistics
 * @param {string} schoolId - The school ID
 * @param {string|string[]|null} classFilter - Single class ID, array of class IDs, or null
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export async function getClassStatistics(schoolId, classFilter = null) {
  let query = supabase
    .from("students")
    .select(`
      student_id,
      student_progress (
        total_xp,
        current_level,
        assignments_completed,
        projects_created,
        projects_exported,
        current_streak
      )
    `)
    .eq("school_id", schoolId);

  // Filter by class(es) if provided
  if (classFilter) {
    if (Array.isArray(classFilter)) {
      query = query.in("class_id", classFilter);
    } else {
      query = query.eq("class_id", classFilter);
    }
  }

  const { data: students, error } = await query;

  if (error) return { data: null, error: error.message };

  // Calculate aggregates
  const stats = students.reduce((acc, student) => {
    const progress = student.student_progress?.[0] || {};
    return {
      totalStudents: acc.totalStudents + 1,
      totalXP: acc.totalXP + (progress.total_xp || 0),
      totalAssignments: acc.totalAssignments + (progress.assignments_completed || 0),
      totalProjects: acc.totalProjects + (progress.projects_created || 0),
      totalExports: acc.totalExports + (progress.projects_exported || 0),
      avgLevel: acc.avgLevel + (progress.current_level || 1),
      activeStreaks: acc.activeStreaks + (progress.current_streak > 0 ? 1 : 0),
    };
  }, {
    totalStudents: 0,
    totalXP: 0,
    totalAssignments: 0,
    totalProjects: 0,
    totalExports: 0,
    avgLevel: 0,
    activeStreaks: 0,
  });

  if (stats.totalStudents > 0) {
    stats.avgLevel = Math.round((stats.avgLevel / stats.totalStudents) * 10) / 10;
    stats.avgXP = Math.round(stats.totalXP / stats.totalStudents);
    stats.avgAssignments = Math.round((stats.totalAssignments / stats.totalStudents) * 10) / 10;
    stats.avgProjects = Math.round((stats.totalProjects / stats.totalStudents) * 10) / 10;
  }

  return { data: stats, error: null };
}

/**
 * Get top students by XP (leaderboard - for teacher view only)
 * @param {string} schoolId - The school ID
 * @param {number} limit - Number of students to return
 * @returns {Promise<{data: Array|null, error: string|null}>}
 */
export async function getTopStudents(schoolId, limit = 10) {
  const { data, error } = await supabase
    .from("students")
    .select(`
      student_id,
      first_name,
      last_name,
      student_progress (
        total_xp,
        current_level,
        current_streak
      )
    `)
    .eq("school_id", schoolId);

  if (error) return { data: null, error: error.message };

  // Sort by XP and limit
  const sorted = data
    .map(student => ({
      ...student,
      progress: student.student_progress?.[0] || { total_xp: 0, current_level: 1 },
    }))
    .sort((a, b) => (b.progress?.total_xp || 0) - (a.progress?.total_xp || 0))
    .slice(0, limit);

  return { data: sorted, error: null };
}

/**
 * Get assignment completion statistics
 * @param {string} schoolId - The school ID
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export async function getAssignmentStats(schoolId) {
  // Get all assignments
  const { data: assignments, error: assignmentsError } = await supabase
    .from("assignments")
    .select(`
      assignment_id,
      title,
      due_date
    `);

  if (assignmentsError) return { data: null, error: assignmentsError.message };

  // Get all students in school
  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select("student_id")
    .eq("school_id", schoolId);

  if (studentsError) return { data: null, error: studentsError.message };

  // Get all submissions
  const { data: submissions, error: submissionsError } = await supabase
    .from("submissions")
    .select(`
      assignment_id,
      student_id,
      submitted_at
    `);

  if (submissionsError) return { data: null, error: submissionsError.message };

  const studentIds = new Set(students.map(s => s.student_id));
  const totalStudents = studentIds.size;

  // Calculate per-assignment stats
  const assignmentStats = assignments.map(assignment => {
    const assignmentSubmissions = submissions.filter(
      s => s.assignment_id === assignment.assignment_id && studentIds.has(s.student_id)
    );

    const onTimeSubmissions = assignmentSubmissions.filter(
      s => new Date(s.submitted_at) <= new Date(assignment.due_date)
    );

    return {
      ...assignment,
      totalSubmissions: assignmentSubmissions.length,
      onTimeSubmissions: onTimeSubmissions.length,
      completionRate: totalStudents > 0
        ? Math.round((assignmentSubmissions.length / totalStudents) * 100)
        : 0,
      onTimeRate: assignmentSubmissions.length > 0
        ? Math.round((onTimeSubmissions.length / assignmentSubmissions.length) * 100)
        : 0,
    };
  });

  return {
    data: {
      assignments: assignmentStats,
      totalStudents,
      overallCompletionRate: assignmentStats.length > 0
        ? Math.round(assignmentStats.reduce((sum, a) => sum + a.completionRate, 0) / assignmentStats.length)
        : 0,
    },
    error: null,
  };
}

/**
 * Get all badge definitions
 * @returns {Promise<{data: Array|null, error: string|null}>}
 */
export async function getAllBadges() {
  const { data, error } = await supabase
    .from("badge_definitions")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  return { data, error: error?.message || null };
}

/**
 * Get badge statistics for a school
 * @param {string} schoolId - The school ID
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export async function getBadgeStats(schoolId) {
  // Get all students
  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select("student_id")
    .eq("school_id", schoolId);

  if (studentsError) return { data: null, error: studentsError.message };

  const studentIds = students.map(s => s.student_id);

  // Get all badges earned by students
  const { data: earnedBadges, error: badgesError } = await supabase
    .from("student_badges")
    .select(`
      badge_id,
      student_id,
      badge_definitions (
        badge_key,
        name,
        icon,
        category
      )
    `)
    .in("student_id", studentIds);

  if (badgesError) return { data: null, error: badgesError.message };

  // Count badges by type
  const badgeCounts = {};
  earnedBadges.forEach(eb => {
    const key = eb.badge_definitions?.badge_key;
    if (key) {
      badgeCounts[key] = (badgeCounts[key] || 0) + 1;
    }
  });

  // Get all badge definitions
  const { data: allBadges } = await getAllBadges();

  const badgeStats = (allBadges || []).map(badge => ({
    ...badge,
    earnedCount: badgeCounts[badge.badge_key] || 0,
    earnedPercentage: students.length > 0
      ? Math.round(((badgeCounts[badge.badge_key] || 0) / students.length) * 100)
      : 0,
  }));

  return {
    data: {
      badges: badgeStats,
      totalBadgesEarned: earnedBadges.length,
      totalStudents: students.length,
    },
    error: null,
  };
}
