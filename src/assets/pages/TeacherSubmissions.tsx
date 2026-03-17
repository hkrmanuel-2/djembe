import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { getTeacherAssignments, getAssignmentWithSubmissions, createFeedback, updateFeedback } from "@/lib/teacherApi";
import { getTeacherClasses } from "@/lib/teacherApi";
import {
  FileCheck,
  Clock,
  Download,
  MessageSquare,
  Star,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Filter,
  ChevronDown,
} from "lucide-react";

type Submission = {
  submission_id: string;
  student_id: string;
  assignment_id: string;
  file_url: string;
  file_name: string;
  submitted_at: string;
};

type Student = {
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  submission: Submission | null;
  feedback: any | null;
  status: "submitted" | "pending";
  is_on_time: boolean | null;
};

type Assignment = {
  assignment_id: string;
  title: string;
  description: string;
  due_date: string;
  assignment_type: string;
  created_at: string;
};

export default function TeacherSubmissions() {
  const { userProfile } = useAuthStore();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");

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

  const loadClasses = async () => {
    if (!userProfile?.teacher_id) return;
    const result = await getTeacherClasses(userProfile.teacher_id);
    if (result.data) {
      setClasses(result.data);
    }
  };

  const loadAssignments = async () => {
    if (!userProfile?.school_id) return;

    setLoading(true);
    try {
      const result = await getTeacherAssignments(userProfile.school_id);
      if (result.data) {
        setAssignments(result.data);
      }
    } catch (error) {
      console.error("Error loading assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async (assignment: Assignment) => {
    if (!userProfile?.school_id) return;

    setDetailLoading(true);
    setSelectedAssignment(assignment);

    try {
      const result = await getAssignmentWithSubmissions(
        assignment.assignment_id,
        userProfile.school_id,
        selectedClass || null
      );

      if (result.data) {
        setStudents(result.data.students);
      }
    } catch (error) {
      console.error("Error loading submissions:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleGiveGradeback = (student: Student) => {
    setSelectedStudent(student);
    if (student.feedback) {
      setFeedbackText(student.feedback.comment || "");
      setScore(student.feedback.score || null);
    } else {
      setFeedbackText("");
      setScore(null);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!selectedStudent?.submission || !userProfile?.teacher_id) return;

    const submissionId = selectedStudent.submission.submission_id;
    if (!submissionId) {
      console.error("Submission ID missing:", selectedStudent.submission);
      alert("Error: Submission ID is missing. Please refresh and try again.");
      return;
    }

    setSubmittingFeedback(true);
    try {
      const feedbackData = {
        submission_id: submissionId,
        comment: feedbackText,
        score: score,
      };

      if (selectedStudent.feedback) {
        // Update existing feedback
        await updateFeedback(selectedStudent.feedback.feedback_id, feedbackData);
      } else {
        // Create new feedback
        await createFeedback(userProfile.teacher_id, feedbackData);
      }

      // Reload submissions
      if (selectedAssignment) {
        await loadSubmissions(selectedAssignment);
      }

      setSelectedStudent(null);
      setFeedbackText("");
      setScore(null);
      alert("Feedback submitted successfully!");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (student: Student) => {
    if (student.status === "pending") {
      return (
        <span
          className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
          style={{ backgroundColor: "rgba(242, 201, 76, 0.12)", color: "#F2C94C" }}
        >
          <Clock size={12} /> Pending
        </span>
      );
    }

    if (student.is_on_time) {
      return (
        <span
          className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
          style={{ backgroundColor: "rgba(74, 186, 110, 0.12)", color: "#4ABA6E" }}
        >
          <CheckCircle2 size={12} /> On Time
        </span>
      );
    }

    return (
      <span
        className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
        style={{ backgroundColor: "rgba(232, 98, 122, 0.12)", color: "#E8627A" }}
      >
        <AlertCircle size={12} /> Late
      </span>
    );
  };

  if (loading) {
    return (
      <div
        className="flex w-full flex-col min-h-screen relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #F3EEFF 0%, #E8DFFF 50%, #F8F5FF 100%)', fontFamily: "'Outfit', sans-serif" }}
      >
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div
              className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4"
              style={{ borderColor: '#E8DFFF', borderTopColor: "#D97746" }}
            />
            <p className="text-lg text-gray-500">Loading assignments...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex w-full flex-col min-h-screen relative overflow-hidden pb-24"
      style={{ background: 'linear-gradient(180deg, #F3EEFF 0%, #E8DFFF 50%, #F8F5FF 100%)', fontFamily: "'Outfit', sans-serif" }}
    >
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1
            className="text-4xl font-bold mb-2 flex items-center gap-3"
            style={{ color: '#3E2468', fontFamily: "'Fredoka', sans-serif" }}
          >
            <FileCheck size={40} style={{ color: "#D97746" }} />
            Student Work
          </h1>
          <p className="text-gray-500">
            Review and give points for student work
          </p>
        </motion.div>

        {/* Class Filter */}
        {classes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="bg-white shadow-md rounded-2xl border-2 p-4" style={{ borderColor: '#E8DFFF' }}>
              <div className="flex items-center gap-3">
                <Filter size={20} className="text-gray-400" />
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="flex-1 bg-white border-2 rounded-lg px-4 py-2 outline-none focus:border-[#D97746] transition-colors"
                  style={{ borderColor: '#E8DFFF', color: '#3E2468' }}
                >
                  <option value="">All Classes</option>
                  {classes.map((cls: any) => (
                    <option key={cls.class_id} value={cls.class_id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Assignments List or Submission Detail */}
        {!selectedAssignment ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {assignments.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <AlertCircle size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No assignments created yet</p>
              </div>
            ) : (
              assignments.map((assignment) => (
                <motion.div
                  key={assignment.assignment_id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white shadow-md rounded-2xl border-2 p-6 cursor-pointer hover:shadow-lg transition-all"
                  style={{ borderColor: '#E8DFFF' }}
                  onClick={() => loadSubmissions(assignment)}
                >
                  <h3
                    className="text-xl font-bold mb-2"
                    style={{ color: '#3E2468', fontFamily: "'Fredoka', sans-serif" }}
                  >
                    {assignment.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                    {assignment.description || "No description"}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-xs flex items-center gap-1">
                      <Clock size={14} />
                      Due {formatDate(assignment.due_date)}
                    </span>
                    <ChevronDown size={20} className="text-[#D97746] rotate-[-90deg]" />
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        ) : (
          <div>
            {/* Back Button */}
            <button
              onClick={() => {
                setSelectedAssignment(null);
                setStudents([]);
              }}
              className="mb-6 px-4 py-2 bg-white hover:bg-purple-50 rounded-lg shadow-sm border-2 transition-colors flex items-center gap-2"
              style={{ color: '#3E2468', borderColor: '#E8DFFF' }}
            >
              ← Back to Assignments
            </button>

            {/* Assignment Header */}
            <div className="bg-white shadow-md rounded-2xl border-2 p-6 mb-6" style={{ borderColor: '#E8DFFF' }}>
              <h2
                className="text-2xl font-bold mb-2"
                style={{ color: '#3E2468', fontFamily: "'Fredoka', sans-serif" }}
              >
                {selectedAssignment.title}
              </h2>
              <p className="text-gray-500 mb-4">{selectedAssignment.description}</p>
              <div className="flex items-center gap-6 text-sm">
                <span className="text-gray-400 flex items-center gap-2">
                  <Clock size={16} />
                  Due: {formatDate(selectedAssignment.due_date)}
                </span>
                <span className="text-gray-400">
                  {students.filter((s) => s.status === "submitted").length} / {students.length} submitted
                </span>
              </div>
            </div>

            {/* Submissions Table */}
            {detailLoading ? (
              <div className="text-center py-12">
                <div
                  className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4"
                  style={{ borderColor: '#E8DFFF', borderTopColor: "#D97746" }}
                />
                <p className="text-gray-500">Loading submissions...</p>
              </div>
            ) : (
              <div className="bg-white shadow-md rounded-2xl border-2 overflow-hidden" style={{ borderColor: '#E8DFFF' }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead style={{ backgroundColor: '#F8F5FF' }}>
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold" style={{ color: '#3E2468' }}>Student</th>
                        <th className="px-6 py-4 text-left font-semibold" style={{ color: '#3E2468' }}>Status</th>
                        <th className="px-6 py-4 text-left font-semibold" style={{ color: '#3E2468' }}>Turned In</th>
                        <th className="px-6 py-4 text-left font-semibold" style={{ color: '#3E2468' }}>File</th>
                        <th className="px-6 py-4 text-left font-semibold" style={{ color: '#3E2468' }}>Points</th>
                        <th className="px-6 py-4 text-center font-semibold" style={{ color: '#3E2468' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student, idx) => (
                        <tr
                          key={student.student_id}
                          style={{ backgroundColor: idx % 2 === 0 ? '#FAFAFF' : 'white' }}
                        >
                          <td className="px-6 py-4" style={{ color: '#3E2468' }}>
                            {student.first_name} {student.last_name}
                          </td>
                          <td className="px-6 py-4">{getStatusBadge(student)}</td>
                          <td className="px-6 py-4 text-gray-500 text-sm">
                            {student.submission
                              ? `${formatDate(student.submission.submitted_at)} at ${formatTime(
                                student.submission.submitted_at
                              )}`
                              : "\u2014"}
                          </td>
                          <td className="px-6 py-4">
                            {student.submission ? (
                              <a
                                href={student.submission.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#D97746] hover:text-[#E6B84D] flex items-center gap-1 text-sm"
                              >
                                <ExternalLink size={14} />
                                {student.submission.file_name}
                              </a>
                            ) : (
                              <span className="text-gray-300 text-sm">\u2014</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {student.feedback?.score !== null &&
                              student.feedback?.score !== undefined ? (
                              <span className="px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 w-fit"
                                style={{ backgroundColor: "rgba(217, 119, 70, 0.12)", color: "#D97746" }}
                              >
                                <Star size={14} fill="#D97746" />
                                {student.feedback.score}/100
                              </span>
                            ) : (
                              <span className="text-gray-300 text-sm">Not graded</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {student.submission && (
                              <button
                                onClick={() => handleGiveGradeback(student)}
                                className="px-4 py-2 bg-[#D97746] hover:bg-[#E6B84D] rounded-lg text-white text-sm font-semibold transition-colors flex items-center gap-2 mx-auto"
                              >
                                <MessageSquare size={14} />
                                {student.feedback ? "Edit Comments" : "Add Comments"}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {selectedStudent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl border-2 p-6 max-w-lg w-full shadow-xl"
            style={{ borderColor: '#E8DFFF' }}
          >
            <h3
              className="text-2xl font-bold mb-4"
              style={{ color: '#3E2468', fontFamily: "'Fredoka', sans-serif" }}
            >
              Feedback for {selectedStudent.first_name} {selectedStudent.last_name}
            </h3>

            {/* Score Input */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2" style={{ color: '#3E2468' }}>
                Score (0-100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={score || ""}
                onChange={(e) => setScore(Number(e.target.value))}
                className="w-full border-2 rounded-lg px-4 py-2 outline-none focus:border-[#D97746]"
                style={{ borderColor: '#E8DFFF', color: '#3E2468' }}
                placeholder="Enter score..."
              />
            </div>

            {/* Comment Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2" style={{ color: '#3E2468' }}>
                Comments
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={4}
                className="w-full border-2 rounded-lg px-4 py-2 outline-none focus:border-[#D97746] resize-none"
                style={{ borderColor: '#E8DFFF', color: '#3E2468' }}
                placeholder="Write your feedback here..."
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedStudent(null);
                  setFeedbackText("");
                  setScore(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                style={{ color: '#3E2468' }}
                disabled={submittingFeedback}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFeedback}
                disabled={submittingFeedback}
                className="flex-1 px-4 py-2 bg-[#D97746] hover:bg-[#E6B84D] rounded-lg text-white font-semibold transition-colors disabled:opacity-50"
              >
                {submittingFeedback ? "Submitting..." : "Submit Feedback"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
