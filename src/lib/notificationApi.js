import { supabase } from "./supabase";

/**
 * Notification types
 */
export const NOTIFICATION_TYPES = {
  // Student notifications
  ASSIGNMENT_CREATED: "assignment_created",
  ASSIGNMENT_GRADED: "assignment_graded",
  FEEDBACK_RECEIVED: "feedback_received",
  DUE_DATE_REMINDER: "due_date_reminder",

  // Teacher notifications
  SUBMISSION_RECEIVED: "submission_received",
  LATE_SUBMISSION: "late_submission",
};

/**
 * Create a single notification
 */
export async function createNotification({
  recipientId,
  recipientType,
  type,
  title,
  message,
  data = {},
}) {
  try {
    const { data: notification, error } = await supabase
      .from("notifications")
      .insert({
        recipient_id: recipientId,
        recipient_type: recipientType,
        type,
        title,
        message,
        data,
      })
      .select()
      .single();

    if (error) {
      console.error("[NOTIFICATION API] Create error:", error);
      throw error;
    }
    console.log("[NOTIFICATION API] Created notification for", recipientType, recipientId);
    return { data: notification, error: null };
  } catch (error) {
    console.error("[NOTIFICATION API] Create notification error:", error);
    return { data: null, error };
  }
}

/**
 * Create notifications for multiple recipients
 */
export async function createBulkNotifications(notifications) {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .insert(
        notifications.map((n) => ({
          recipient_id: n.recipientId,
          recipient_type: n.recipientType,
          type: n.type,
          title: n.title,
          message: n.message,
          data: n.data || {},
        }))
      )
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Create bulk notifications error:", error);
    return { data: null, error };
  }
}

/**
 * Notify all students in a school about a new assignment
 */
export async function notifyStudentsNewAssignment({
  schoolId,
  assignmentId,
  assignmentTitle,
  dueDate,
  description,
}) {
  try {
    // Get all students in the school
    const { data: students, error: studentsError } = await supabase
      .from("students")
      .select("student_id, first_name")
      .eq("school_id", schoolId);

    if (studentsError) throw studentsError;
    if (!students?.length) return { data: null, error: null };

    // Format the due date
    const formattedDate = new Date(dueDate).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    // Create notifications for all students
    const notifications = students.map((student) => ({
      recipientId: student.student_id,
      recipientType: "student",
      type: NOTIFICATION_TYPES.ASSIGNMENT_CREATED,
      title: "New Assignment",
      message: `"${assignmentTitle}" has been assigned. Due ${formattedDate}.`,
      data: {
        assignmentId,
        assignmentTitle,
        dueDate,
        description: description?.substring(0, 100),
      },
    }));

    return await createBulkNotifications(notifications);
  } catch (error) {
    console.error("Notify students error:", error);
    return { data: null, error };
  }
}

/**
 * Notify a student about grading/feedback
 */
export async function notifyStudentFeedback({
  studentId,
  assignmentId,
  assignmentTitle,
  score,
  feedbackPreview,
}) {
  const hasScore = score !== null && score !== undefined;

  return await createNotification({
    recipientId: studentId,
    recipientType: "student",
    type: hasScore ? NOTIFICATION_TYPES.ASSIGNMENT_GRADED : NOTIFICATION_TYPES.FEEDBACK_RECEIVED,
    title: hasScore ? "Assignment Graded" : "New Feedback",
    message: hasScore
      ? `You received ${score}/100 on "${assignmentTitle}"`
      : `Your teacher left feedback on "${assignmentTitle}"`,
    data: {
      assignmentId,
      assignmentTitle,
      score,
      feedbackPreview,
    },
  });
}

/**
 * Notify a teacher about a student submission
 */
export async function notifyTeacherSubmission({
  teacherId,
  studentId,
  studentName,
  assignmentId,
  assignmentTitle,
  isLate,
}) {
  console.log("[NOTIFICATION] Starting notifyTeacherSubmission");
  console.log("[NOTIFICATION] Parameters:", {
    teacherId,
    studentId,
    studentName,
    assignmentId,
    assignmentTitle,
    isLate
  });

  try {
    const notificationType = isLate ? NOTIFICATION_TYPES.LATE_SUBMISSION : NOTIFICATION_TYPES.SUBMISSION_RECEIVED;
    const notificationTitle = isLate ? "Late Submission" : "New Submission";
    const notificationMessage = `${studentName} submitted "${assignmentTitle}"${isLate ? " (late)" : ""}`;
    
    console.log("[NOTIFICATION] Notification details:", {
      type: notificationType,
      title: notificationTitle,
      message: notificationMessage
    });

    const result = await createNotification({
      recipientId: teacherId,
      recipientType: "teacher",
      type: notificationType,
      title: notificationTitle,
      message: notificationMessage,
      data: {
        studentId,
        studentName,
        assignmentId,
        assignmentTitle,
        isLate,
      },
    });

    console.log("[NOTIFICATION] Notification created successfully:", result);
    return result;
  } catch (error) {
    console.error("[NOTIFICATION] Error in notifyTeacherSubmission:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw error;
  }
}

/**
 * Get notification icon based on type
 */
export function getNotificationIcon(type) {
  const icons = {
    [NOTIFICATION_TYPES.ASSIGNMENT_CREATED]: "📝",
    [NOTIFICATION_TYPES.ASSIGNMENT_GRADED]: "⭐",
    [NOTIFICATION_TYPES.FEEDBACK_RECEIVED]: "💬",
    [NOTIFICATION_TYPES.DUE_DATE_REMINDER]: "⏰",
    [NOTIFICATION_TYPES.SUBMISSION_RECEIVED]: "📤",
    [NOTIFICATION_TYPES.LATE_SUBMISSION]: "⚠️",
  };
  return icons[type] || "🔔";
}

/**
 * Get notification link based on type and data
 */
export function getNotificationLink(type, data) {
  switch (type) {
    case NOTIFICATION_TYPES.ASSIGNMENT_CREATED:
    case NOTIFICATION_TYPES.ASSIGNMENT_GRADED:
    case NOTIFICATION_TYPES.FEEDBACK_RECEIVED:
      return "/assignments";
    case NOTIFICATION_TYPES.SUBMISSION_RECEIVED:
    case NOTIFICATION_TYPES.LATE_SUBMISSION:
      return "/teacher/assignments";
    default:
      return "/home";
  }
}
