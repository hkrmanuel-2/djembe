import { supabase } from "./supabase";
import { notifyStudentsNewAssignment, notifyStudentFeedback } from "./notificationApi";

// ============================================
// CLASS MANAGEMENT
// ============================================

/**
 * Get all classes assigned to a specific teacher
 */
export async function getTeacherClasses(teacherId) {
  try {
    const { data: classes, error } = await supabase
      .from("classes")
      .select("*")
      .eq("teacher_id", teacherId)
      .order("name", { ascending: true });

    if (error) throw error;
    return { data: classes || [], error: null };
  } catch (error) {
    console.error("Get teacher classes error:", error);
    return { data: [], error: error.message };
  }
}

/**
 * Create a new class
 */
export async function createClass(teacherId, schoolId, name) {
  try {
    const { data: newClass, error } = await supabase
      .from("classes")
      .insert([
        {
          teacher_id: teacherId,
          school_id: schoolId,
          name: name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return { data: newClass, error: null };
  } catch (error) {
    console.error("Create class error:", error);
    return { data: null, error: error.message };
  }
}

/**
 * Update a class
 */
export async function updateClass(classId, name) {
  try {
    const { data: updatedClass, error } = await supabase
      .from("classes")
      .update({
        name: name,
        updated_at: new Date().toISOString(),
      })
      .eq("class_id", classId)
      .select()
      .single();

    if (error) throw error;
    return { data: updatedClass, error: null };
  } catch (error) {
    console.error("Update class error:", error);
    return { data: null, error: error.message };
  }
}

/**
 * Delete a class
 */
export async function deleteClass(classId) {
  try {
    const { error } = await supabase
      .from("classes")
      .delete()
      .eq("class_id", classId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error("Delete class error:", error);
    return { success: false, error: error.message };
  }
}

// ============================================
// ASSIGNMENT MANAGEMENT
// ============================================

/**
 * Create a new assignment
 */
export async function createAssignment(teacherId, schoolId, data) {
  try {
    const { data: assignment, error } = await supabase
      .from("assignments")
      .insert([
        {
          teacher_id: teacherId,
          school_id: schoolId,
          class_id: data.class_id,
          title: data.title,
          description: data.description,
          due_date: data.due_date,
          assignment_type: data.assignment_type || "upload",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Notify all students in the school about the new assignment
    notifyStudentsNewAssignment({
      schoolId,
      assignmentId: assignment.id,
      assignmentTitle: data.title,
      dueDate: data.due_date,
      description: data.description,
    }).catch((err) => console.error("Failed to send assignment notifications:", err));

    return { data: assignment, error: null };
  } catch (error) {
    console.error("Create assignment error:", error);
    return { data: null, error: error.message };
  }
}

/**
 * Update an existing assignment
 */
export async function updateAssignment(assignmentId, data) {
  try {
    const { data: assignment, error } = await supabase
      .from("assignments")
      .update({
        title: data.title,
        description: data.description,
        due_date: data.due_date,
        assignment_type: data.assignment_type,
        updated_at: new Date().toISOString(),
      })
      .eq("id", assignmentId)
      .select()
      .single();

    if (error) throw error;
    return { data: assignment, error: null };
  } catch (error) {
    console.error("Update assignment error:", error);
    return { data: null, error: error.message };
  }
}

/**
 * Delete an assignment
 */
export async function deleteAssignment(assignmentId) {
  try {
    const { error } = await supabase
      .from("assignments")
      .delete()
      .eq("id", assignmentId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error("Delete assignment error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all assignments for a teacher/school
 */
export async function getTeacherAssignments(schoolId) {
  try {
    const { data: assignments, error } = await supabase
      .from("assignments")
      .select("*")
      .eq("school_id", schoolId)
      .order("due_date", { ascending: false });

    if (error) throw error;
    return { data: assignments || [], error: null };
  } catch (error) {
    console.error("Get teacher assignments error:", error);
    return { data: [], error: error.message };
  }
}

/**
 * Get assignment with all submissions
 */
export async function getAssignmentWithSubmissions(assignmentId, schoolId, classId = null) {
  try {
    // Get assignment details using assignment_id
    console.log("[TEACHER API] Getting assignment with ID:", assignmentId);
    const { data: assignment, error: assignmentError } = await supabase
      .from("assignments")
      .select("*")
      .eq("assignment_id", assignmentId)
      .single();

    if (assignmentError) throw assignmentError;
    console.log("[TEACHER API] Found assignment:", assignment);

    // Get all students in the school (optionally filtered by class)
    let studentsQuery = supabase
      .from("students")
      .select("student_id, first_name, last_name, email, class_id")
      .eq("school_id", schoolId);

    if (classId) {
      studentsQuery = studentsQuery.eq("class_id", classId);
    }

    const { data: students, error: studentsError } = await studentsQuery;

    if (studentsError) throw studentsError;

    // Get submissions for this assignment
    console.log("[TEACHER API] Querying submissions for assignment:", assignmentId);
    const { data: submissions, error: submissionsError } = await supabase
      .from("submissions")
      .select("*")
      .eq("assignment_id", assignmentId);

    console.log("[TEACHER API] Submissions query result:", {
      count: submissions?.length || 0,
      submissions: submissions,
      error: submissionsError
    });

    if (submissionsError) throw submissionsError;

    // Get feedback for these submissions (submissions table uses submission_id as primary key)
    const submissionIds = submissions?.map((s) => s.submission_id).filter(Boolean) || [];
    console.log("[TEACHER API] Submission IDs for feedback query:", submissionIds);

    let feedback = [];
    if (submissionIds.length > 0) {
      const { data: feedbackData } = await supabase
        .from("feedback")
        .select("*")
        .in("submission_id", submissionIds);
      feedback = feedbackData || [];
    }

    // Combine data
    const submissionMap = new Map();
    submissions?.forEach((sub) => {
      submissionMap.set(sub.student_id, sub);
    });

    const feedbackMap = new Map();
    feedback.forEach((fb) => {
      feedbackMap.set(fb.submission_id, fb);
    });

    const studentsWithSubmissions = students?.map((student) => {
      const submission = submissionMap.get(student.student_id);
      const submissionId = submission ? submission.submission_id : null;
      const submissionFeedback = submissionId
        ? feedbackMap.get(submissionId)
        : null;

      return {
        ...student,
        submission: submission || null,
        feedback: submissionFeedback || null,
        status: submission ? "submitted" : "pending",
        is_on_time: submission
          ? new Date(submission.submitted_at) <= new Date(assignment.due_date)
          : null,
      };
    });

    return {
      data: {
        assignment,
        students: studentsWithSubmissions || [],
        totalStudents: students?.length || 0,
        submittedCount: submissions?.length || 0,
      },
      error: null,
    };
  } catch (error) {
    console.error("Get assignment with submissions error:", error);
    return { data: null, error: error.message };
  }
}

// ============================================
// STUDENT DIFFICULTIES / ANALYTICS
// ============================================

/**
 * Get students who may be struggling
 */
export async function getStudentDifficulties(schoolId, classId = null) {
  try {
    // Get all students with their progress
    let studentsQuery = supabase
      .from("students")
      .select(
        `
        student_id,
        first_name,
        last_name,
        email,
        created_at,
        class_id,
        student_progress (
          total_xp,
          current_level,
          current_streak,
          longest_streak,
          last_activity_date,
          assignments_completed,
          projects_created,
          total_time_minutes
        )
      `
      )
      .eq("school_id", schoolId);

    if (classId) {
      studentsQuery = studentsQuery.eq("class_id", classId);
    }

    const { data: students, error: studentsError } = await studentsQuery;

    if (studentsError) throw studentsError;

    // Get assignment submission stats
    const { data: assignments, error: assignmentsError } = await supabase
      .from("assignments")
      .select("id, due_date")
      .eq("school_id", schoolId)
      .lt("due_date", new Date().toISOString());

    if (assignmentsError) throw assignmentsError;

    const { data: submissions, error: submissionsError } = await supabase
      .from("submissions")
      .select("student_id, assignment_id, submitted_at");

    if (submissionsError) throw submissionsError;

    // Calculate difficulties for each student
    const today = new Date();
    const difficulties = [];

    for (const student of students || []) {
      const progress = student.student_progress?.[0] || {};
      const issues = [];

      // Check for inactivity (7+ days)
      if (progress.last_activity_date) {
        const lastActive = new Date(progress.last_activity_date);
        const daysSinceActive = Math.floor(
          (today - lastActive) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceActive >= 7) {
          issues.push({
            type: "inactive",
            severity: daysSinceActive >= 14 ? "high" : "medium",
            message: `No activity for ${daysSinceActive} days`,
            value: daysSinceActive,
          });
        }
      } else {
        issues.push({
          type: "inactive",
          severity: "high",
          message: "Never logged in",
          value: null,
        });
      }

      // Check XP gain rate
      const accountAge = Math.max(
        1,
        Math.floor(
          (today - new Date(student.created_at)) / (1000 * 60 * 60 * 24)
        )
      );
      const xpPerDay = (progress.total_xp || 0) / accountAge;
      if (xpPerDay < 20 && accountAge > 3) {
        issues.push({
          type: "low_xp",
          severity: xpPerDay < 10 ? "high" : "medium",
          message: `Low XP rate: ${xpPerDay.toFixed(1)} XP/day`,
          value: xpPerDay,
        });
      }

      // Check missed assignments
      const studentSubmissions = submissions?.filter(
        (s) => s.student_id === student.student_id
      );
      const submittedAssignmentIds = new Set(
        studentSubmissions?.map((s) => s.assignment_id)
      );
      const missedAssignments =
        assignments?.filter((a) => !submittedAssignmentIds.has(a.id)) || [];

      if (missedAssignments.length >= 2) {
        issues.push({
          type: "missed_assignments",
          severity: missedAssignments.length >= 3 ? "high" : "medium",
          message: `${missedAssignments.length} missed assignments`,
          value: missedAssignments.length,
        });
      }

      // Check broken streak
      if (
        progress.longest_streak >= 3 &&
        progress.current_streak === 0
      ) {
        issues.push({
          type: "broken_streak",
          severity: "low",
          message: `Streak broken (was ${progress.longest_streak} days)`,
          value: progress.longest_streak,
        });
      }

      // Check low engagement time
      const avgTimePerDay = (progress.total_time_minutes || 0) / Math.max(1, accountAge);
      if (avgTimePerDay < 15 && accountAge > 7) {
        issues.push({
          type: "low_engagement",
          severity: avgTimePerDay < 5 ? "high" : "medium",
          message: `Low engagement: ${avgTimePerDay.toFixed(0)} min/day avg`,
          value: avgTimePerDay,
        });
      }

      if (issues.length > 0) {
        difficulties.push({
          student: {
            student_id: student.student_id,
            first_name: student.first_name,
            last_name: student.last_name,
            email: student.email,
          },
          progress: {
            total_xp: progress.total_xp || 0,
            current_level: progress.current_level || 1,
            current_streak: progress.current_streak || 0,
            last_activity_date: progress.last_activity_date,
            assignments_completed: progress.assignments_completed || 0,
            projects_created: progress.projects_created || 0,
          },
          issues,
          severity: issues.some((i) => i.severity === "high")
            ? "high"
            : issues.some((i) => i.severity === "medium")
              ? "medium"
              : "low",
        });
      }
    }

    // Sort by severity
    const severityOrder = { high: 0, medium: 1, low: 2 };
    difficulties.sort(
      (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
    );

    return { data: difficulties, error: null };
  } catch (error) {
    console.error("Get student difficulties error:", error);
    return { data: [], error: error.message };
  }
}

// ============================================
// STUDENT PROJECTS
// ============================================

/**
 * Get all student projects in a school
 */
export async function getStudentProjects(schoolId, classId = null) {
  try {
    let query = supabase
      .from("projects")
      .select(
        `
        project_id,
        title,
        bpm,
        bars,
        placed_loops,
        created_at,
        updated_at,
        student_id,
        students!inner (
          first_name,
          last_name,
          email,
          school_id,
          class_id
        )
      `
      )
      .eq("students.school_id", schoolId);

    if (classId) {
      query = query.eq("students.class_id", classId);
    }

    const { data: projects, error } = await query.order("updated_at", { ascending: false });

    if (error) throw error;

    // Transform data
    const transformedProjects = projects?.map((p) => ({
      project_id: p.project_id,
      title: p.title,
      bpm: p.bpm,
      bars: p.bars,
      loop_count: p.placed_loops?.length || 0,
      created_at: p.created_at,
      updated_at: p.updated_at,
      student: {
        student_id: p.student_id,
        first_name: p.students.first_name,
        last_name: p.students.last_name,
        email: p.students.email,
      },
    }));

    return { data: transformedProjects || [], error: null };
  } catch (error) {
    console.error("Get student projects error:", error);
    return { data: [], error: error.message };
  }
}

/**
 * Get a single project with full details
 */
export async function getStudentProjectById(projectId) {
  try {
    const { data: project, error } = await supabase
      .from("projects")
      .select(
        `
        *,
        students (
          student_id,
          first_name,
          last_name,
          email
        )
      `
      )
      .eq("project_id", projectId)
      .single();

    if (error) throw error;

    // Get any feedback for this project
    const { data: feedback } = await supabase
      .from("teacher_feedback")
      .select("*")
      .eq("reference_type", "project")
      .eq("reference_id", projectId)
      .order("created_at", { ascending: false });

    return {
      data: {
        ...project,
        feedback: feedback || [],
      },
      error: null,
    };
  } catch (error) {
    console.error("Get student project error:", error);
    return { data: null, error: error.message };
  }
}

// ============================================
// FEEDBACK (using existing feedback table)
// ============================================

/**
 * Create feedback for a submission
 */
export async function createFeedback(teacherId, data) {
  try {
    console.log("[TEACHER API] Creating feedback with data:", {
      teacherId,
      submission_id: data.submission_id,
      hasComment: !!data.comment,
      score: data.score
    });

    if (!data.submission_id) {
      throw new Error("submission_id is required");
    }

    const { data: feedback, error } = await supabase
      .from("feedback")
      .insert([
        {
          teacher_id: teacherId,
          submission_id: data.submission_id,
          comment: data.comment,
          score: data.score || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("[TEACHER API] Create feedback error:", error);
      console.error("[TEACHER API] Submission ID used:", data.submission_id);
      throw error;
    }

    console.log("[TEACHER API] Feedback created successfully, fetching submission details...");
    console.log("[TEACHER API] Submission ID:", data.submission_id);

    // Get submission details to notify the student
    const { data: submission } = await supabase
      .from("submissions")
      .select(`student_id, assignment_id`)
      .eq("submission_id", data.submission_id)
      .single();

    console.log("[TEACHER API] Found submission:", submission);

    // Get assignment title separately (using assignment_id)
    let assignmentTitle = "Assignment";
    if (submission?.assignment_id) {
      const { data: assignment } = await supabase
        .from("assignments")
        .select("title")
        .eq("assignment_id", submission.assignment_id)
        .single();
      if (assignment) {
        assignmentTitle = assignment.title;
      }
    }

    if (submission) {
      notifyStudentFeedback({
        studentId: submission.student_id,
        assignmentId: submission.assignment_id,
        assignmentTitle: assignmentTitle,
        score: data.score,
        feedbackPreview: data.comment?.substring(0, 100),
      }).catch((err) => console.error("Failed to send feedback notification:", err));
    }

    return { data: feedback, error: null };
  } catch (error) {
    console.error("Create feedback error:", error);
    return { data: null, error: error.message };
  }
}

/**
 * Update existing feedback
 */
export async function updateFeedback(feedbackId, data) {
  try {
    console.log("[TEACHER API] Updating feedback with data:", {
      feedbackId,
      submission_id: data.submission_id,
      hasComment: !!data.comment,
      score: data.score
    });

    const { data: feedback, error } = await supabase
      .from("feedback")
      .update({
        comment: data.comment,
        score: data.score,
        updated_at: new Date().toISOString(),
      })
      .eq("feedback_id", feedbackId)
      .select()
      .single();

    if (error) {
      console.error("[TEACHER API] Update feedback error:", error);
      console.error("[TEACHER API] Submission ID used:", data.submission_id);
      throw error;
    }

    console.log("[TEACHER API] Feedback updated successfully, fetching submission details...");
    console.log("[TEACHER API] Submission ID:", data.submission_id);

    // Get submission details to notify the student
    let submission = null;
    if (data.submission_id) {
      const { data: sub } = await supabase
        .from("submissions")
        .select(`student_id, assignment_id`)
        .eq("submission_id", data.submission_id)
        .single();
      submission = sub;
    }

    console.log("[TEACHER API] Found submission:", submission);

    // Get assignment title
    let assignmentTitle = "Assignment";
    if (submission?.assignment_id) {
      const { data: assignment } = await supabase
        .from("assignments")
        .select("title")
        .eq("assignment_id", submission.assignment_id)
        .single();
      if (assignment) {
        assignmentTitle = assignment.title;
      }
    }

    // Notify student of updated feedback
    if (submission) {
      notifyStudentFeedback({
        studentId: submission.student_id,
        assignmentId: submission.assignment_id,
        assignmentTitle: assignmentTitle,
        score: data.score,
        feedbackPreview: data.comment?.substring(0, 100),
      }).catch((err) => console.error("Failed to send feedback notification:", err));
    }

    return { data: feedback, error: null };
  } catch (error) {
    console.error("Update feedback error:", error);
    return { data: null, error: error.message };
  }
}

/**
 * Get feedback for a specific submission
 */
export async function getFeedbackForSubmission(submissionId) {
  try {
    const { data: feedback, error } = await supabase
      .from("feedback")
      .select(
        `
        *,
        teachers (
          first_name,
          last_name
        )
      `
      )
      .eq("submission_id", submissionId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data: feedback || [], error: null };
  } catch (error) {
    console.error("Get feedback for submission error:", error);
    return { data: [], error: error.message };
  }
}

/**
 * Get all feedback given by a teacher
 */
export async function getTeacherFeedback(teacherId) {
  try {
    const { data: feedback, error } = await supabase
      .from("feedback")
      .select(
        `
        *,
        submissions (
          student_id,
          assignment_id,
          file_name
        )
      `
      )
      .eq("teacher_id", teacherId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data: feedback || [], error: null };
  } catch (error) {
    console.error("Get teacher feedback error:", error);
    return { data: [], error: error.message };
  }
}

// ============================================
// VOICE SETTINGS (for 3D Worlds)
// ============================================

/**
 * Get voice settings for a school and world
 * Used by both teachers (to edit) and students (to fetch for Suno generation)
 * @param {string} schoolId - The school ID
 * @param {string} worldId - The world ID (e.g., "world1", "world2")
 */
export async function getVoiceSettings(schoolId, worldId = "world1") {
  try {
    const { data: settings, error } = await supabase
      .from("voice_settings")
      .select("*")
      .eq("school_id", schoolId)
      .eq("world_id", worldId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned (not an error, just no settings yet)
      throw error;
    }

    // Return default settings if none exist
    if (!settings) {
      return {
        data: {
          bpm: 120,
          genre: "afrobeat",
          style: "upbeat",
          mood: "happy",
          custom_prompt: null,
          world_id: worldId,
        },
        error: null,
      };
    }

    return { data: settings, error: null };
  } catch (error) {
    console.error("Get voice settings error:", error);
    return { data: null, error: error.message };
  }
}

/**
 * Create or update voice settings for a school and world
 * Only teachers can call this
 * @param {string} schoolId - The school ID
 * @param {string} teacherId - The teacher ID
 * @param {object} settings - The voice settings
 * @param {string} worldId - The world ID (e.g., "world1", "world2")
 */
export async function updateVoiceSettings(schoolId, teacherId, settings, worldId = "world1") {
  try {
    // Check if settings already exist for this school + world
    const { data: existing } = await supabase
      .from("voice_settings")
      .select("id")
      .eq("school_id", schoolId)
      .eq("world_id", worldId)
      .single();

    let result;

    if (existing) {
      // Update existing settings
      const { data, error } = await supabase
        .from("voice_settings")
        .update({
          bpm: settings.bpm,
          genre: settings.genre,
          style: settings.style,
          mood: settings.mood,
          custom_prompt: settings.custom_prompt || null,
          updated_at: new Date().toISOString(),
        })
        .eq("school_id", schoolId)
        .eq("world_id", worldId)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new settings
      const { data, error } = await supabase
        .from("voice_settings")
        .insert([
          {
            school_id: schoolId,
            teacher_id: teacherId,
            world_id: worldId,
            bpm: settings.bpm,
            genre: settings.genre,
            style: settings.style,
            mood: settings.mood,
            custom_prompt: settings.custom_prompt || null,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return { data: result, error: null };
  } catch (error) {
    console.error("Update voice settings error:", error);
    return { data: null, error: error.message };
  }
}
