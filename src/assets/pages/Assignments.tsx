import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { useProgressStore } from "@/store/useProgressStore";
import { supabase } from "@/lib/supabase";
import { notifyTeacherSubmission } from "@/lib/notificationApi";
import { Upload, File, CheckCircle2, Circle, X, Calendar, Sparkles } from "lucide-react";

export default function AssignmentsNew() {
  const { userProfile } = useAuthStore();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.school_id) {
      loadAssignments();
    }
  }, [userProfile?.school_id]);

  useEffect(() => {
    if (userProfile?.student_id) {
      loadSubmissions();
    }
  }, [userProfile?.student_id]);

  const loadAssignments = async () => {
    if (!userProfile?.school_id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("assignments")
        .select("*")
        .eq("school_id", userProfile.school_id)
        .order("due_date", { ascending: true });

      if (error) throw error;
      console.log("[ASSIGNMENTS] Loaded assignments:", data?.map(a => ({
        id: a.id,
        assignment_id: a.assignment_id,
        title: a.title,
        hasId: !!a.id,
        hasAssignmentId: !!a.assignment_id,
        keys: Object.keys(a)
      })));
      setAssignments(data || []);
    } catch (error) {
      console.error("Error loading assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async () => {
    if (!userProfile?.student_id) return;

    try {
      // Load submissions with feedback
      const { data: submissionsData, error: submissionsError } = await supabase
        .from("submissions")
        .select("*")
        .eq("student_id", userProfile.student_id);

      if (submissionsError) throw submissionsError;

      // Load feedback for all submissions
      const submissionIds = submissionsData?.map(s => s.id) || [];
      let feedbackData = [];

      if (submissionIds.length > 0) {
        const { data: feedback, error: feedbackError } = await supabase
          .from("feedback")
          .select("*")
          .in("submission_id", submissionIds);

        if (!feedbackError && feedback) {
          feedbackData = feedback;
        }
      }

      // Combine submissions with their feedback
      const submissionsWithFeedback = submissionsData?.map(submission => ({
        ...submission,
        feedback: feedbackData.find(fb => fb.submission_id === submission.id) || null
      })) || [];

      setSubmissions(submissionsWithFeedback);
    } catch (error) {
      console.error("Error loading submissions:", error);
    }
  };

  const getSubmissionStatus = (assignmentId) => {
    if (!assignmentId) return "pending";
    const submission = submissions.find((s) => s.assignment_id === assignmentId);
    return submission ? "submitted" : "pending";
  };

  const getSubmissionWithFeedback = (assignmentId) => {
    if (!assignmentId) return null;
    return submissions.find((s) => s.assignment_id === assignmentId) || null;
  };

  // Helper to get assignment ID (handles both 'id' and 'assignment_id' field names)
  const getAssignmentId = (assignment) => {
    return assignment?.id || assignment?.assignment_id || null;
  };

  const handleFileSelect = async (event) => {
    console.log("[ASSIGNMENT SUBMISSION] Starting file selection handler");
    const file = event.target.files[0];
    console.log("[ASSIGNMENT SUBMISSION] File selected:", {
      name: file?.name,
      size: file?.size,
      type: file?.type,
      exists: !!file
    });
    const assignmentId = getAssignmentId(selectedAssignment);
    console.log("[ASSIGNMENT SUBMISSION] Selected assignment:", {
      id: selectedAssignment?.id,
      assignment_id: selectedAssignment?.assignment_id,
      resolvedId: assignmentId,
      title: selectedAssignment?.title,
      exists: !!selectedAssignment,
      allKeys: selectedAssignment ? Object.keys(selectedAssignment) : [],
      fullObject: selectedAssignment
    });

    // Validate assignment has an ID
    if (selectedAssignment && !assignmentId) {
      console.error("[ASSIGNMENT SUBMISSION] CRITICAL: Assignment missing id field!", selectedAssignment);
      alert("Error: Assignment is missing an ID. Please refresh the page and try again.");
      setUploading(false);
      return;
    }
    console.log("[ASSIGNMENT SUBMISSION] User profile:", {
      student_id: userProfile?.student_id,
      exists: !!userProfile
    });

    if (!file || !selectedAssignment) {
      console.warn("[ASSIGNMENT SUBMISSION] Missing file or assignment, aborting");
      return;
    }

    try {
      console.log("[ASSIGNMENT SUBMISSION] Setting uploading state to true");
      setUploading(true);

      // Validate file before upload
      console.log("[ASSIGNMENT SUBMISSION] Starting file validation");
      const { validateFile } = await import("@/lib/storageApi");
      console.log("[ASSIGNMENT SUBMISSION] validateFile imported successfully");
      const validation = validateFile(file);
      console.log("[ASSIGNMENT SUBMISSION] Validation result:", validation);
      if (!validation.valid) {
        console.error("[ASSIGNMENT SUBMISSION] File validation failed:", validation.errors);
        alert(`Invalid file:\n${validation.errors.join("\n")}`);
        setUploading(false);
        return;
      }
      console.log("[ASSIGNMENT SUBMISSION] File validation passed");

      // Upload to Supabase Storage
      console.log("[ASSIGNMENT SUBMISSION] Starting Supabase Storage upload");
      const { uploadAssignmentSubmission } = await import("@/lib/storageApi");
      console.log("[ASSIGNMENT SUBMISSION] uploadAssignmentSubmission imported successfully");
      console.log("[ASSIGNMENT SUBMISSION] Upload parameters:", {
        student_id: userProfile?.student_id,
        assignment_id: assignmentId,
        file_name: file.name,
        file_size: file.size
      });

      const uploadResult = await uploadAssignmentSubmission(
        file,
        userProfile?.student_id,
        assignmentId,
        null // Supabase Storage doesn't support progress callbacks easily
      );

      console.log("[ASSIGNMENT SUBMISSION] Upload result:", {
        success: uploadResult.success,
        hasData: !!uploadResult.data,
        secure_url: uploadResult.data?.secure_url,
        error: uploadResult.error
      });

      if (!uploadResult.success) {
        console.error("[ASSIGNMENT SUBMISSION] Upload failed:", uploadResult.error);
        throw new Error(uploadResult.error || "Upload failed");
      }
      console.log("[ASSIGNMENT SUBMISSION] Upload successful, secure_url:", uploadResult.data.secure_url);

      // Save submission to database with Supabase Storage URL
      console.log("[ASSIGNMENT SUBMISSION] Preparing database insert");
      const submissionData = {
        assignment_id: assignmentId,
        student_id: userProfile?.student_id,
        file_url: uploadResult.data.secure_url || uploadResult.data.public_url,
        file_name: file.name,
        submitted_at: new Date().toISOString(),
      };
      console.log("[ASSIGNMENT SUBMISSION] Submission data to insert:", submissionData);

      const { error: insertError, data: insertData } = await supabase
        .from("submissions")
        .upsert(submissionData);

      console.log("[ASSIGNMENT SUBMISSION] Database insert result:", {
        error: insertError,
        hasData: !!insertData,
        data: insertData
      });

      if (insertError) {
        console.error("[ASSIGNMENT SUBMISSION] Database insert error:", insertError);
        throw insertError;
      }
      console.log("[ASSIGNMENT SUBMISSION] Database insert successful");

      // Track assignment submission for progress
      console.log("[ASSIGNMENT SUBMISSION] Calculating on-time status");
      const isOnTime = new Date() <= new Date(selectedAssignment.due_date);
      console.log("[ASSIGNMENT SUBMISSION] Is on time:", isOnTime, {
        currentDate: new Date().toISOString(),
        dueDate: selectedAssignment.due_date
      });

      if (userProfile?.student_id) {
        console.log("[ASSIGNMENT SUBMISSION] Tracking progress");
        try {
          useProgressStore.getState().trackAssignmentSubmit(
            userProfile.student_id,
            assignmentId,
            selectedAssignment.title,
            isOnTime
          );
          console.log("[ASSIGNMENT SUBMISSION] Progress tracking successful");
        } catch (progressError) {
          console.error("[ASSIGNMENT SUBMISSION] Progress tracking error:", progressError);
        }
      } else {
        console.warn("[ASSIGNMENT SUBMISSION] Skipping progress tracking - no student_id");
      }

      // Notify the teacher about the submission
      if (selectedAssignment.teacher_id && userProfile) {
        console.log("[ASSIGNMENT SUBMISSION] Sending teacher notification");
        const notificationData = {
          teacherId: selectedAssignment.teacher_id,
          studentId: userProfile.student_id,
          studentName: `${userProfile.first_name} ${userProfile.last_name || ""}`.trim(),
          assignmentId: assignmentId,
          assignmentTitle: selectedAssignment.title,
          isLate: !isOnTime,
        };
        console.log("[ASSIGNMENT SUBMISSION] Notification data:", notificationData);
        notifyTeacherSubmission(notificationData)
          .then(() => {
            console.log("[ASSIGNMENT SUBMISSION] Teacher notification sent successfully");
          })
          .catch((err) => {
            console.error("[ASSIGNMENT SUBMISSION] Failed to send submission notification:", err);
          });
      } else {
        console.warn("[ASSIGNMENT SUBMISSION] Skipping notification - missing teacher_id or userProfile");
      }

      console.log("[ASSIGNMENT SUBMISSION] Reloading submissions");
      await loadSubmissions();
      console.log("[ASSIGNMENT SUBMISSION] Closing modal and showing success");
      setSelectedAssignment(null);
      alert("Assignment submitted successfully!");
      console.log("[ASSIGNMENT SUBMISSION] Submission completed successfully");
    } catch (error) {
      console.error("[ASSIGNMENT SUBMISSION] Error in submission process:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
        error: error
      });
      alert(`Failed to submit assignment: ${error.message || "Please try again."}`);
    } finally {
      console.log("[ASSIGNMENT SUBMISSION] Setting uploading state to false");
      setUploading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div
        className="flex w-full flex-col h-screen relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #F3EEFF 0%, #E8DFFF 50%, #F8F5FF 100%)',
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        <div className="relative z-10 flex items-center justify-center h-screen">
          <div className="text-center">
            <div
              className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4"
              style={{ borderColor: '#E8DFFF', borderTopColor: '#D97746' }}
            ></div>
            <p className="text-lg text-gray-500">Loading assignments...</p>
          </div>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" as const },
    },
  } as const;

  return (
    <div
      className="flex w-full flex-col min-h-screen relative overflow-x-hidden"
      style={{
        background: 'linear-gradient(180deg, #F3EEFF 0%, #E8DFFF 50%, #F8F5FF 100%)',
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
      `}</style>

      {/* Gradient blobs */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        <div
          className="absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(123, 91, 168, 0.12) 0%, transparent 70%)", animation: "float 8s ease-in-out infinite" }}
        />
        <div
          className="absolute top-[20%] -right-16 w-[350px] h-[350px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(217, 119, 70, 0.1) 0%, transparent 70%)", animation: "floatSlow 10s ease-in-out infinite 2s" }}
        />
        <div
          className="absolute -bottom-10 left-[30%] w-[450px] h-[450px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(66, 201, 201, 0.08) 0%, transparent 70%)", animation: "float 9s ease-in-out infinite 1s" }}
        />
      </div>

      {/* Floating SVG Musical Elements */}
      <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden hidden sm:block">
        {/* Eighth note - top left */}
        <div className="absolute top-24 left-4 md:left-12" style={{ animation: "float 4s ease-in-out infinite", opacity: 0.2 }}>
          <svg width="44" height="52" viewBox="0 0 24 30" fill="#E8627A">
            <path d="M9 3v20a5 5 0 1 1-2-4V3h2z" />
            <path d="M9 3c0 0 4-1 7 2s4 6 4 6" stroke="#E8627A" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </div>

        {/* Double beamed notes - lower left */}
        <div className="absolute top-[60%] left-6 md:left-10" style={{ animation: "floatSlow 5s ease-in-out infinite 1s", opacity: 0.15 }}>
          <svg width="48" height="48" viewBox="0 0 32 32" fill="#E8627A">
            <rect x="6" y="2" width="2.5" height="22" rx="1" />
            <rect x="22" y="6" width="2.5" height="18" rx="1" />
            <ellipse cx="5" cy="25" rx="4.5" ry="3.5" />
            <ellipse cx="21" cy="25" rx="4.5" ry="3.5" />
            <rect x="8" y="2" width="16.5" height="2.5" rx="1" />
            <rect x="8" y="7" width="16.5" height="2.5" rx="1" />
          </svg>
        </div>

        {/* Star - top right */}
        <div className="absolute top-20 right-8 md:right-16" style={{ animation: "floatSlow 4.5s ease-in-out infinite 0.5s", opacity: 0.2 }}>
          <svg width="38" height="38" viewBox="0 0 24 24" fill="#F2C94C">
            <path d="M12 2l2.09 6.26L20.18 9l-5.09 3.74L16.18 19 12 15.27 7.82 19l1.09-6.26L3.82 9l6.09-.74z" />
          </svg>
        </div>

        {/* Quarter note - mid right */}
        <div className="absolute top-[48%] right-4 md:right-10" style={{ animation: "float 5s ease-in-out infinite 2s", opacity: 0.15 }}>
          <svg width="26" height="42" viewBox="0 0 16 32" fill="#E8627A">
            <rect x="10" y="0" width="2.5" height="24" rx="1" />
            <ellipse cx="7" cy="26" rx="5.5" ry="4" />
          </svg>
        </div>

        {/* 4-point sparkle */}
        <div className="absolute top-36 left-[25%]" style={{ animation: "floatSlow 6s ease-in-out infinite 1.5s", opacity: 0.12 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#D97746">
            <path d="M12 0l1.8 8.2L22 12l-8.2 1.8L12 22l-1.8-8.2L2 12l8.2-1.8z" />
          </svg>
        </div>

        {/* Small note - bottom right */}
        <div className="absolute bottom-28 right-[22%]" style={{ animation: "float 4s ease-in-out infinite 3s", opacity: 0.12 }}>
          <svg width="32" height="38" viewBox="0 0 24 30" fill="#42C9C9">
            <path d="M9 3v20a5 5 0 1 1-2-4V3h2z" />
            <path d="M9 3c0 0 4-1 7 2s4 6 4 6" stroke="#42C9C9" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Decorative gray swirl lines */}
      <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden hidden md:block">
        <svg className="absolute left-[8%] top-[45%] w-[200px] opacity-[0.08]" viewBox="0 0 200 120" fill="none">
          <path d="M10 60 C50 10, 100 10, 140 60 S190 110, 190 60" stroke="#7B5BA8" strokeWidth="3" strokeLinecap="round" />
          <path d="M10 80 C50 30, 100 30, 140 80 S190 130, 190 80" stroke="#7B5BA8" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <svg className="absolute right-[6%] top-[50%] w-[180px] opacity-[0.08]" viewBox="0 0 200 120" fill="none">
          <path d="M190 60 C150 10, 100 10, 60 60 S10 110, 10 60" stroke="#E8627A" strokeWidth="3" strokeLinecap="round" />
          <path d="M190 80 C150 30, 100 30, 60 80 S10 130, 10 80" stroke="#E8627A" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>

      {/* Green checkmark - bottom left */}
      <div className="absolute bottom-8 left-8 z-[6] hidden md:block">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: '#E8F5E9', boxShadow: '0 4px 16px rgba(76, 175, 80, 0.15)' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#4CAF50" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col px-4 sm:px-6 pt-6 pb-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto w-full"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-6 sm:mb-8">
            <div
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border-2 mb-3"
              style={{ backgroundColor: 'white', borderColor: '#E8DFFF' }}
            >
              <Sparkles size={14} className="sm:w-4 sm:h-4" style={{ color: '#E6B84D' }} />
              <span className="text-xs sm:text-sm font-medium" style={{ color: '#3E2468' }}>Student Portal</span>
            </div>

            <h1
              className="text-3xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight mb-2"
              style={{ color: '#3E2468', fontFamily: "'Fredoka', sans-serif" }}
            >
              My <span style={{ color: '#D97746' }}>Assignments</span>
            </h1>

            {userProfile && (
              <p className="text-base sm:text-lg font-light text-gray-500">
                Hey {userProfile.first_name}, here's your work
              </p>
            )}
          </motion.div>

          {/* Assignments area with mascots */}
          <motion.div variants={itemVariants} className="relative max-w-3xl mx-auto">
            {/* Pencil - large, overlapping left edge of card */}
            <img
              src="/ui assets/pencil.png"
              alt="Pencil"
              className="hidden md:block absolute z-20"
              style={{
                width: '320px',
                left: '-140px',
                top: '-40px',
                filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.15))",
                animation: "floatSlow 4s ease-in-out infinite",
              }}
            />

            {/* Student mascot - large, overlapping top-right of card */}
            <img
              src="/ui assets/student_mascot.png"
              alt="Student mascot"
              className="hidden md:block absolute z-20"
              style={{
                width: '260px',
                right: '-80px',
                top: '-90px',
                filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.15))",
              }}
            />

            {/* Assignments container card */}
            <div
              className="relative bg-white p-5 sm:p-8 overflow-y-auto"
              style={{
                borderWidth: '3px',
                borderStyle: 'solid',
                borderColor: '#D97746',
                borderRadius: '24px',
                boxShadow: '0 8px 40px rgba(217, 119, 70, 0.1)',
                maxHeight: 'calc(100vh - 300px)',
                minHeight: 'fit-content',
              }}
            >
              {assignments.length === 0 ? (
                <div className="text-center py-12">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: '#F3EEFF' }}
                  >
                    <CheckCircle2 size={32} style={{ color: '#4A9B9B' }} />
                  </div>
                  <h2
                    className="text-xl font-bold mb-2"
                    style={{ color: '#3E2468', fontFamily: "'Fredoka', sans-serif" }}
                  >
                    All caught up!
                  </h2>
                  <p className="text-gray-500 text-sm">
                    No assignments right now. Check back later.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignments.map((assignment) => {
                    const assignmentId = getAssignmentId(assignment);
                    const status = getSubmissionStatus(assignmentId);
                    const isSubmitted = status === "submitted";

                    return (
                      <div
                        key={assignmentId || assignment.title}
                        className={`flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 p-4 sm:p-5 rounded-2xl transition-all duration-200 cursor-pointer hover:shadow-sm ${getAssignmentId(selectedAssignment) === assignmentId ? "ring-2 ring-[#7B5BA8]/20" : ""
                          }`}
                        style={{
                          backgroundColor: isSubmitted ? '#F0FAFA' : '#F8F5FF',
                          border: '1.5px solid',
                          borderColor: isSubmitted ? '#B8E6E6' : '#E8DFFF',
                        }}
                        onClick={() => {
                          const clickedAssignmentId = getAssignmentId(assignment);
                          console.log("[ASSIGNMENTS] Assignment clicked:", {
                            id: assignment.id,
                            assignment_id: assignment.assignment_id,
                            resolvedId: clickedAssignmentId,
                            title: assignment.title,
                            fullObject: assignment
                          });
                          if (!isSubmitted) {
                            if (!clickedAssignmentId) {
                              console.error("[ASSIGNMENTS] Assignment missing id field!", assignment);
                              alert("Error: Assignment is missing an ID. Please refresh the page.");
                              return;
                            }
                            setSelectedAssignment(assignment);
                          }
                        }}
                      >
                        {/* Assignment icon - larger like mockup */}
                        <div
                          className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center"
                          style={{
                            background: isSubmitted
                              ? 'linear-gradient(135deg, #42C9C9, #5AD5D5)'
                              : 'linear-gradient(135deg, #7B5BA8, #9B7DC8)',
                            boxShadow: isSubmitted
                              ? '0 4px 16px rgba(66, 201, 201, 0.3)'
                              : '0 4px 16px rgba(123, 91, 168, 0.3)',
                          }}
                        >
                          {isSubmitted ? (
                            <CheckCircle2 className="w-8 h-8 text-white" />
                          ) : (
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                              <path d="M9 18V5l12-2v13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              <circle cx="6" cy="18" r="3" fill="white" />
                              <circle cx="18" cy="16" r="3" fill="white" />
                            </svg>
                          )}
                        </div>

                        {/* Assignment details */}
                        <div className="flex-1 min-w-0">
                          <h3
                            className="text-lg sm:text-xl font-bold"
                            style={{ color: '#3E2468', fontFamily: "'Fredoka', sans-serif" }}
                          >
                            {assignment.title}
                          </h3>
                          <p className="text-sm text-gray-500 truncate mt-0.5">
                            {assignment.description}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-400">
                            <Calendar size={13} />
                            <span>Due {formatDate(assignment.due_date)}</span>
                          </div>
                        </div>

                        {/* Action */}
                        <div className="flex-shrink-0 self-center">
                          {isSubmitted ? (
                            <div className="flex flex-col items-end gap-2">
                              <span
                                className="px-4 py-2 rounded-full font-semibold text-xs"
                                style={{ backgroundColor: '#D4F5F5', color: '#2D7A7A' }}
                              >
                                Submitted
                              </span>
                              {(() => {
                                const submission = getSubmissionWithFeedback(assignmentId);
                                if (submission?.feedback) {
                                  return (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedAssignment({ ...assignment, showFeedback: true });
                                      }}
                                      className="px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5"
                                      style={{
                                        backgroundColor: 'rgba(230, 184, 77, 0.15)',
                                        color: '#E6B84D'
                                      }}
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                      View Feedback
                                      {submission.feedback.score !== null && (
                                        <span className="font-bold">({submission.feedback.score}/100)</span>
                                      )}
                                    </button>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAssignment(assignment);
                              }}
                              className="flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-bold text-sm transition-all hover:scale-105 active:scale-95"
                              style={{
                                background: 'linear-gradient(135deg, #D97746 0%, #E6B84D 100%)',
                                color: 'white',
                                boxShadow: '0 4px 16px rgba(217, 119, 70, 0.3)',
                                fontFamily: "'Fredoka', sans-serif",
                              }}
                            >
                              <Upload size={16} />
                              <span>Submit</span>
                              <span className="text-base">🎵</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Upload Modal or Feedback Modal */}
      <AnimatePresence>
        {selectedAssignment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(62, 36, 104, 0.5)', backdropFilter: 'blur(8px)' }}
            onClick={() => !uploading && setSelectedAssignment(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="relative bg-white border-2 rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full overflow-hidden mx-4 sm:mx-0"
              style={{ borderColor: '#E8DFFF' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Show Feedback Modal if showFeedback is true */}
              {selectedAssignment.showFeedback ? (
                <>
                  {/* Feedback Header */}
                  <div className="p-4 sm:p-6 border-b" style={{ borderColor: '#E8DFFF' }}>
                    <div className="flex items-center justify-between">
                      <h2
                        className="text-xl sm:text-2xl font-bold"
                        style={{ color: '#3E2468', fontFamily: "'Fredoka', sans-serif" }}
                      >
                        Teacher Feedback
                      </h2>
                      <button
                        onClick={() => setSelectedAssignment(null)}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100"
                        style={{ backgroundColor: '#F8F5FF' }}
                      >
                        <X size={20} className="text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Feedback Content */}
                  <div className="p-4 sm:p-6 space-y-4">
                    <div>
                      <h3
                        className="text-base sm:text-lg font-semibold mb-2"
                        style={{ color: '#3E2468', fontFamily: "'Fredoka', sans-serif" }}
                      >
                        {selectedAssignment.title}
                      </h3>
                    </div>

                    {(() => {
                      const assignmentId = getAssignmentId(selectedAssignment);
                      const submission = getSubmissionWithFeedback(assignmentId);
                      const feedback = submission?.feedback;

                      if (!feedback) {
                        return (
                          <div className="text-center py-8 text-gray-500">
                            No feedback available yet.
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-4">
                          {feedback.score !== null && (
                            <div
                              className="p-4 rounded-xl text-center"
                              style={{ backgroundColor: 'rgba(230, 184, 77, 0.1)' }}
                            >
                              <div className="text-sm text-gray-600 mb-1">Your Score</div>
                              <div
                                className="text-4xl font-bold"
                                style={{ color: '#E6B84D', fontFamily: "'Fredoka', sans-serif" }}
                              >
                                {feedback.score}/100
                              </div>
                            </div>
                          )}

                          <div
                            className="p-4 rounded-xl"
                            style={{ backgroundColor: 'rgba(230, 184, 77, 0.1)' }}
                          >
                            <div className="text-sm font-semibold mb-2" style={{ color: '#3E2468' }}>
                              Teacher's Comments:
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap">{feedback.comment || "No comments provided."}</p>
                          </div>

                          {feedback.created_at && (
                            <div className="text-xs text-gray-400 text-center">
                              Received {formatDate(feedback.created_at)}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </>
              ) : (
                <>
                  {/* Upload Header */}
                  <div className="p-4 sm:p-6 border-b" style={{ borderColor: '#E8DFFF' }}>
                    <div className="flex items-center justify-between">
                      <h2
                        className="text-xl sm:text-2xl font-bold"
                        style={{ color: '#3E2468', fontFamily: "'Fredoka', sans-serif" }}
                      >
                        Submit Assignment
                      </h2>
                      <button
                        onClick={() => !uploading && setSelectedAssignment(null)}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100"
                        style={{ backgroundColor: '#F8F5FF' }}
                        disabled={uploading}
                      >
                        <X size={20} className="text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Upload Content */}
                  <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    <div>
                      <h3
                        className="text-base sm:text-lg font-semibold mb-1 sm:mb-2"
                        style={{ color: '#3E2468', fontFamily: "'Fredoka', sans-serif" }}
                      >
                        {selectedAssignment.title}
                      </h3>
                      <p className="text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed text-gray-500">
                        {selectedAssignment.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                        <Calendar size={14} className="sm:w-4 sm:h-4" />
                        <span>Due {formatDate(selectedAssignment.due_date)}</span>
                      </div>
                    </div>

                    {/* Upload Area */}
                    <div className="relative">
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={handleFileSelect}
                        disabled={uploading}
                      />
                      <label
                        htmlFor="file-upload"
                        className="block border-2 border-dashed rounded-lg sm:rounded-xl p-6 sm:p-10 text-center transition-all cursor-pointer hover:bg-purple-50"
                        style={{ borderColor: '#7B5BA8' }}
                      >
                        <File className="w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 mx-auto text-gray-400" />
                        <p
                          className="text-sm sm:text-base font-medium mb-1 sm:mb-2"
                          style={{ color: '#3E2468' }}
                        >
                          Click to upload your file
                        </p>
                        <p className="text-xs sm:text-sm text-gray-400">
                          PDF, Word, Image, or Audio files
                        </p>
                      </label>
                    </div>

                    {/* Uploading State */}
                    {uploading && (
                      <div className="text-center py-4">
                        <div
                          className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-3"
                          style={{ borderColor: '#E8DFFF', borderTopColor: '#D97746' }}
                        ></div>
                        <p className="text-gray-500">Uploading your work...</p>
                      </div>
                    )}

                    {/* Cancel Button */}
                    {!uploading && (
                      <button
                        onClick={() => setSelectedAssignment(null)}
                        className="w-full py-3 rounded-xl border-2 font-medium transition-colors hover:bg-gray-50"
                        style={{
                          backgroundColor: 'white',
                          borderColor: '#E8DFFF',
                          color: '#3E2468',
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
