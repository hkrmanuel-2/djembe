import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import {
  getTeacherAssignments,
  getAssignmentWithSubmissions,
  deleteAssignment,
  getTeacherClasses,
} from "@/lib/teacherApi";
import CloudShader from "@/components/ui/cloud-shader";
import {
  FileText,
  Plus,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Trash2,
  Edit,
  ChevronRight,
  ArrowLeft,
  X,
  Music,
  Upload,
  MessageSquare,
  Filter,
} from "lucide-react";
import AssignmentForm from "@/components/teacher/AssignmentForm";
import FeedbackModal from "@/components/teacher/FeedbackModal";

type ClassType = {
  class_id: string;
  name: string;
};

type Assignment = {
  id: string;
  title: string;
  description: string;
  due_date: string;
  assignment_type: "upload" | "project";
  created_at: string;
};

type StudentSubmission = {
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  submission: {
    id: string;
    file_url: string;
    file_name: string;
    submitted_at: string;
  } | null;
  feedback: {
    feedback_id: string;
    comment: string;
    score: number | null;
  } | null;
  status: "submitted" | "pending";
  is_on_time: boolean | null;
};

export default function TeacherAssignments() {
  const { userProfile } = useAuthStore();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [assignmentDetail, setAssignmentDetail] = useState<{
    assignment: Assignment;
    students: StudentSubmission[];
    totalStudents: number;
    submittedCount: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [feedbackStudent, setFeedbackStudent] = useState<StudentSubmission | null>(null);
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");

  // Load classes on mount
  useEffect(() => {
    if (userProfile?.teacher_id) {
      loadClasses();
    }
  }, [userProfile?.teacher_id]);

  useEffect(() => {
    if (userProfile?.school_id) {
      loadAssignments();
    }
  }, [userProfile?.school_id]);

  // Reload assignment detail when class filter changes
  useEffect(() => {
    if (selectedAssignment && userProfile?.school_id) {
      handleAssignmentClick(selectedAssignment);
    }
  }, [selectedClass]);

  const loadClasses = async () => {
    if (!userProfile?.teacher_id) return;
    const result = await getTeacherClasses(userProfile.teacher_id);
    if (result.data) {
      setClasses(result.data);
    }
  };

  const loadAssignments = async () => {
    if (!userProfile?.school_id) return;
    setIsLoading(true);
    try {
      const result = await getTeacherAssignments(userProfile.school_id);
      if (result.data) {
        setAssignments(result.data);
      }
    } catch (error) {
      console.error("Error loading assignments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignmentClick = async (assignment: Assignment) => {
    if (!userProfile?.school_id) return;
    setSelectedAssignment(assignment);
    setDetailLoading(true);
    try {
      const classFilter = selectedClass || null;
      const result = await getAssignmentWithSubmissions(assignment.id, userProfile.school_id, classFilter);
      if (result.data) {
        setAssignmentDetail(result.data);
      }
    } catch (error) {
      console.error("Error loading assignment detail:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async (assignmentId: string) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;
    try {
      await deleteAssignment(assignmentId);
      setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
    } catch (error) {
      console.error("Error deleting assignment:", error);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingAssignment(null);
    loadAssignments();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isPastDue = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  if (isLoading) {
    return (
      <div
        className="flex w-full flex-col min-h-screen relative overflow-hidden"
        style={{ backgroundColor: "#1A2B4A" }}
      >
        <div className="absolute inset-0 z-0">
          <CloudShader speed={0.3} octaves={5} scale={2.5} className="w-full h-full opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#1A2B4A]/90 via-[#1A2B4A]/70 to-[#4A9B9B]/30" />
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div
              className="w-16 h-16 border-4 border-white/20 rounded-full animate-spin mx-auto mb-4"
              style={{ borderTopColor: "#D97746" }}
            />
            <p className="text-lg text-white/70">Loading assignments...</p>
          </div>
        </div>
      </div>
    );
  }

  // Assignment Detail View
  if (selectedAssignment && assignmentDetail) {
    return (
      <div
        className="flex w-full flex-col min-h-screen relative overflow-hidden"
        style={{ backgroundColor: "#1A2B4A", fontFamily: "'Outfit', sans-serif" }}
      >
        <div className="absolute inset-0 z-0">
          <CloudShader speed={0.3} octaves={5} scale={2.5} className="w-full h-full opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#1A2B4A]/90 via-[#1A2B4A]/70 to-[#4A9B9B]/30" />
        </div>

        <div className="relative z-10 min-h-screen px-6 py-24">
          <div className="max-w-5xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => {
                setSelectedAssignment(null);
                setAssignmentDetail(null);
              }}
              className="flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Assignments</span>
            </button>

            {detailLoading ? (
              <div className="text-center py-20">
                <div
                  className="w-12 h-12 border-4 border-white/20 rounded-full animate-spin mx-auto mb-4"
                  style={{ borderTopColor: "#D97746" }}
                />
                <p className="text-white/70">Loading submissions...</p>
              </div>
            ) : (
              <motion.div variants={containerVariants} initial="hidden" animate="visible">
                {/* Assignment Header */}
                <motion.div variants={itemVariants} className="mb-8">
                  <div
                    className="rounded-2xl p-6 backdrop-blur-md border"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.08)",
                      borderColor: "rgba(255,255,255,0.15)",
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {assignmentDetail.assignment.assignment_type === "project" ? (
                            <Music size={20} style={{ color: "#4A9B9B" }} />
                          ) : (
                            <Upload size={20} style={{ color: "#D97746" }} />
                          )}
                          <span
                            className="text-sm px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor:
                                assignmentDetail.assignment.assignment_type === "project"
                                  ? "rgba(74, 155, 155, 0.2)"
                                  : "rgba(217, 119, 70, 0.2)",
                              color:
                                assignmentDetail.assignment.assignment_type === "project"
                                  ? "#4A9B9B"
                                  : "#D97746",
                            }}
                          >
                            {assignmentDetail.assignment.assignment_type === "project"
                              ? "Project"
                              : "Upload"}
                          </span>
                        </div>
                        <h1 className="text-3xl font-bold text-white">
                          {assignmentDetail.assignment.title}
                        </h1>
                        <p className="text-white/60 mt-2">
                          {assignmentDetail.assignment.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white/60 text-sm">Due Date</p>
                        <p
                          className="text-lg font-semibold"
                          style={{
                            color: isPastDue(assignmentDetail.assignment.due_date)
                              ? "#EF4444"
                              : "#E6B84D",
                          }}
                        >
                          {formatDate(assignmentDetail.assignment.due_date)}
                        </p>
                      </div>
                    </div>

                    {/* Submission Stats */}
                    <div className="flex items-center gap-6 pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={18} style={{ color: "#10B981" }} />
                        <span className="text-white">
                          {assignmentDetail.submittedCount} / {assignmentDetail.totalStudents}{" "}
                          submitted
                        </span>
                      </div>
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${
                              (assignmentDetail.submittedCount / assignmentDetail.totalStudents) *
                              100
                            }%`,
                            backgroundColor: "#10B981",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Class Filter for Submissions */}
                {classes.length > 0 && (
                  <motion.div variants={itemVariants} className="mb-6">
                    <div className="flex items-center gap-3">
                      <Filter size={18} className="text-white/60" />
                      <span className="text-white/60 text-sm">Filter by class:</span>
                      <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="px-4 py-2 rounded-xl backdrop-blur-md border focus:outline-none transition-all cursor-pointer min-w-[180px]"
                        style={{
                          backgroundColor: "rgba(255,255,255,0.1)",
                          borderColor: selectedClass ? "#4A9B9B" : "rgba(255,255,255,0.15)",
                          color: "white",
                        }}
                      >
                        <option value="" style={{ backgroundColor: "#1A2B4A", color: "white" }}>
                          All Classes
                        </option>
                        {classes.map((cls) => (
                          <option
                            key={cls.class_id}
                            value={cls.class_id}
                            style={{ backgroundColor: "#1A2B4A", color: "white" }}
                          >
                            {cls.name}
                          </option>
                        ))}
                      </select>
                      {selectedClass && (
                        <button
                          onClick={() => setSelectedClass("")}
                          className="text-white/60 hover:text-white text-sm underline"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Student Submissions List */}
                <motion.div variants={itemVariants}>
                  <h2 className="text-xl font-bold text-white mb-4">Student Submissions</h2>
                  <div
                    className="rounded-2xl backdrop-blur-md border overflow-hidden"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.08)",
                      borderColor: "rgba(255,255,255,0.15)",
                    }}
                  >
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/10 text-sm font-semibold text-white/60">
                      <div className="col-span-4">Student</div>
                      <div className="col-span-2 text-center">Status</div>
                      <div className="col-span-2 text-center">Submitted</div>
                      <div className="col-span-2 text-center">Grade</div>
                      <div className="col-span-2 text-center">Actions</div>
                    </div>

                    {/* Student Rows */}
                    {assignmentDetail.students.map((student, index) => (
                      <div
                        key={student.student_id}
                        className={`grid grid-cols-12 gap-4 px-6 py-4 items-center ${
                          index !== assignmentDetail.students.length - 1
                            ? "border-b border-white/10"
                            : ""
                        }`}
                      >
                        <div className="col-span-4 flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
                            style={{
                              backgroundColor: "rgba(217, 119, 70, 0.3)",
                              color: "#D97746",
                            }}
                          >
                            {student.first_name?.[0]}
                            {student.last_name?.[0]}
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {student.first_name} {student.last_name}
                            </p>
                            <p className="text-white/50 text-xs">{student.email}</p>
                          </div>
                        </div>

                        <div className="col-span-2 flex justify-center">
                          {student.status === "submitted" ? (
                            <span
                              className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: student.is_on_time
                                  ? "rgba(16, 185, 129, 0.2)"
                                  : "rgba(239, 68, 68, 0.2)",
                                color: student.is_on_time ? "#10B981" : "#EF4444",
                              }}
                            >
                              <CheckCircle2 size={12} />
                              {student.is_on_time ? "On Time" : "Late"}
                            </span>
                          ) : (
                            <span
                              className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: "rgba(255, 255, 255, 0.1)",
                                color: "rgba(255, 255, 255, 0.5)",
                              }}
                            >
                              <Clock size={12} />
                              Pending
                            </span>
                          )}
                        </div>

                        <div className="col-span-2 text-center text-white/70 text-sm">
                          {student.submission
                            ? formatDate(student.submission.submitted_at)
                            : "—"}
                        </div>

                        <div className="col-span-2 text-center">
                          {student.feedback?.score !== null && student.feedback?.score !== undefined ? (
                            <span
                              className="px-3 py-1 rounded-full text-sm font-semibold"
                              style={{
                                backgroundColor: "rgba(230, 184, 77, 0.2)",
                                color: "#E6B84D",
                              }}
                            >
                              {student.feedback.score}
                            </span>
                          ) : student.feedback?.comment ? (
                            <span className="text-white/50 text-xs">Feedback given</span>
                          ) : (
                            <span className="text-white/40">—</span>
                          )}
                        </div>

                        <div className="col-span-2 flex justify-center gap-2">
                          {student.submission && (
                            <>
                              <a
                                href={student.submission.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                title="View Submission"
                              >
                                <FileText size={16} className="text-white/70" />
                              </a>
                              <button
                                onClick={() => setFeedbackStudent(student)}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                title="Give Feedback"
                              >
                                <MessageSquare
                                  size={16}
                                  style={{
                                    color: student.feedback ? "#E6B84D" : "rgba(255,255,255,0.7)",
                                  }}
                                />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Feedback Modal */}
        <AnimatePresence>
          {feedbackStudent && feedbackStudent.submission && selectedAssignment && (
            <FeedbackModal
              student={feedbackStudent}
              submissionId={feedbackStudent.submission.id}
              existingFeedback={feedbackStudent.feedback}
              onClose={() => setFeedbackStudent(null)}
              onSuccess={() => {
                setFeedbackStudent(null);
                handleAssignmentClick(selectedAssignment);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Main Assignments List View
  return (
    <div
      className="flex w-full flex-col min-h-screen relative overflow-hidden"
      style={{ backgroundColor: "#1A2B4A", fontFamily: "'Outfit', sans-serif" }}
    >
      <div className="absolute inset-0 z-0">
        <CloudShader speed={0.3} octaves={5} scale={2.5} className="w-full h-full opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A2B4A]/90 via-[#1A2B4A]/70 to-[#4A9B9B]/30" />
      </div>

      <div className="relative z-10 min-h-screen px-6 py-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto"
        >
          {/* Header */}
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-between mb-10"
          >
            <div>
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border mb-4"
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderColor: "rgba(255,255,255,0.2)",
                }}
              >
                <FileText size={16} style={{ color: "#E6B84D" }} />
                <span className="text-sm font-medium text-white/90">Assignments</span>
              </div>
              <h1 className="text-4xl font-bold text-white">
                Manage <span style={{ color: "#D97746" }}>Assignments</span>
              </h1>
              <p className="text-white/60 mt-2">Create and track student assignments</p>
            </div>

            <button
              onClick={() => {
                setEditingAssignment(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #D97746 0%, #E6B84D 100%)",
              }}
            >
              <Plus size={20} />
              New Assignment
            </button>
          </motion.div>

          {/* Assignments List */}
          {assignments.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="text-center py-16 rounded-2xl backdrop-blur-md border"
              style={{
                backgroundColor: "rgba(255,255,255,0.08)",
                borderColor: "rgba(255,255,255,0.15)",
              }}
            >
              <FileText size={48} className="mx-auto mb-4 text-white/40" />
              <p className="text-white/60 text-lg">No assignments yet</p>
              <p className="text-white/40 mt-1">Create your first assignment to get started</p>
            </motion.div>
          ) : (
            <motion.div variants={itemVariants} className="space-y-4">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="rounded-2xl backdrop-blur-md border overflow-hidden cursor-pointer hover:bg-white/5 transition-colors"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.08)",
                    borderColor: "rgba(255,255,255,0.15)",
                  }}
                  onClick={() => handleAssignmentClick(assignment)}
                >
                  <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{
                          backgroundColor:
                            assignment.assignment_type === "project"
                              ? "rgba(74, 155, 155, 0.2)"
                              : "rgba(217, 119, 70, 0.2)",
                        }}
                      >
                        {assignment.assignment_type === "project" ? (
                          <Music
                            size={24}
                            style={{ color: "#4A9B9B" }}
                          />
                        ) : (
                          <Upload
                            size={24}
                            style={{ color: "#D97746" }}
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{assignment.title}</h3>
                        <p className="text-white/50 text-sm line-clamp-1">
                          {assignment.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Calendar
                          size={16}
                          style={{
                            color: isPastDue(assignment.due_date) ? "#EF4444" : "#E6B84D",
                          }}
                        />
                        <span
                          className="text-sm"
                          style={{
                            color: isPastDue(assignment.due_date)
                              ? "#EF4444"
                              : "rgba(255,255,255,0.7)",
                          }}
                        >
                          {formatDate(assignment.due_date)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingAssignment(assignment);
                            setShowForm(true);
                          }}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} className="text-white/70" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(assignment.id);
                          }}
                          className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} className="text-red-400" />
                        </button>
                        <ChevronRight size={20} className="text-white/40" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Assignment Form Modal */}
      <AnimatePresence>
        {showForm && (
          <AssignmentForm
            assignment={editingAssignment}
            onClose={() => {
              setShowForm(false);
              setEditingAssignment(null);
            }}
            onSuccess={handleFormSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
