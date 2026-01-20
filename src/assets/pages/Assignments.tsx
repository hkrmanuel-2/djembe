import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/lib/supabase";
import CloudShader from "@/components/ui/cloud-shader";
import { Upload, File, CheckCircle2, Circle, X, Calendar, Sparkles } from "lucide-react";

export default function AssignmentsNew() {
  const { userProfile, user } = useAuthStore();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignments();
    loadSubmissions();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("assignments")
        .select("*")
        .order("due_date", { ascending: true });

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error("Error loading assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("student_id", user.id);

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error("Error loading submissions:", error);
    }
  };

  const getSubmissionStatus = (assignmentId) => {
    const submission = submissions.find((s) => s.assignment_id === assignmentId);
    return submission ? "submitted" : "pending";
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file || !selectedAssignment) return;

    try {
      setUploading(true);

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${selectedAssignment.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("assignments")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("assignments")
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from("assignment_submissions")
        .upsert({
          assignment_id: selectedAssignment.id,
          student_id: user.id,
          file_url: urlData.publicUrl,
          file_name: file.name,
          submitted_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;

      await loadSubmissions();
      setSelectedAssignment(null);
    } catch (error) {
      console.error("Error submitting assignment:", error);
      alert("Failed to submit assignment. Please try again.");
    } finally {
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
      <div className="flex w-full flex-col min-h-screen relative overflow-hidden" style={{ backgroundColor: '#1A2B4A', fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif" }}>
        <div className="absolute inset-0 z-0">
          <CloudShader speed={0.3} octaves={5} scale={2.5} className="w-full h-full opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#1A2B4A]/90 via-[#1A2B4A]/70 to-[#4A9B9B]/30" />
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-white/20 rounded-full animate-spin mx-auto mb-4" style={{ borderTopColor: '#D97746' }}></div>
            <p className="text-lg" style={{ color: 'rgba(255,255,255,0.7)' }}>Loading assignments...</p>
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
    <div className="flex w-full flex-col min-h-screen relative overflow-hidden" style={{ backgroundColor: '#1A2B4A', fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>

      {/* CloudShader Background with warm tint */}
      <div className="absolute inset-0 z-0">
        <CloudShader
          speed={0.3}
          octaves={5}
          scale={2.5}
          className="w-full h-full opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A2B4A]/90 via-[#1A2B4A]/70 to-[#4A9B9B]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A2B4A]/80 via-transparent to-[#D97746]/10" />
      </div>

      {/* Fun Floating Doodles */}
      <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
        <div className="absolute top-28 right-12 text-3xl opacity-15" style={{ animation: 'float 4s ease-in-out infinite' }}>📝</div>
        <div className="absolute bottom-32 left-20 text-4xl opacity-20" style={{ animation: 'float 3.5s ease-in-out infinite 1s' }}>✅</div>
        <div className="absolute top-1/2 right-24 text-2xl opacity-10" style={{ animation: 'float 5s ease-in-out infinite 2s' }}>⭐</div>
        <div className="absolute bottom-48 right-1/3 text-3xl opacity-15" style={{ animation: 'float 4.5s ease-in-out infinite 0.5s' }}>✨</div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 min-h-screen px-6 py-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}>
              <Sparkles size={16} style={{ color: '#E6B84D' }} />
              <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>Student Portal</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight text-white mb-4">
              My <span style={{ color: '#D97746' }}>Assignments</span>
            </h1>

            {userProfile && (
              <p className="text-xl font-light" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Hey {userProfile.first_name}, here's your work
              </p>
            )}
          </motion.div>

          {/* Assignments List */}
          {assignments.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="text-center py-20"
            >
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <CheckCircle2 size={40} style={{ color: '#4A9B9B' }} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">All caught up!</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)' }}>
                No assignments right now. Check back later for new work.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment, index) => {
                const status = getSubmissionStatus(assignment.id);
                const isSubmitted = status === "submitted";

                return (
                  <motion.div
                    key={assignment.id}
                    variants={itemVariants}
                    custom={index}
                    className="group"
                  >
                    <div
                      className={`relative overflow-hidden rounded-2xl backdrop-blur-md p-6 transition-all duration-300 cursor-pointer border ${
                        selectedAssignment?.id === assignment.id
                          ? "ring-2 ring-white/30"
                          : ""
                      }`}
                      style={{
                        backgroundColor: isSubmitted ? 'rgba(74, 155, 155, 0.15)' : 'rgba(255,255,255,0.08)',
                        borderColor: isSubmitted ? 'rgba(74, 155, 155, 0.3)' : 'rgba(255,255,255,0.15)',
                      }}
                      onClick={() => !isSubmitted && setSelectedAssignment(assignment)}
                    >
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex items-start gap-4 flex-1">
                          {/* Status Icon */}
                          <div className="mt-1 flex-shrink-0">
                            {isSubmitted ? (
                              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(74, 155, 155, 0.3)' }}>
                                <CheckCircle2 className="w-5 h-5" style={{ color: '#4A9B9B' }} />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-full flex items-center justify-center border" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.15)' }}>
                                <Circle className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.4)' }} />
                              </div>
                            )}
                          </div>

                          {/* Assignment Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-white mb-2">
                              {assignment.title}
                            </h3>
                            <p className="mb-3 leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                              {assignment.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                              <div className="flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                <Calendar size={16} />
                                <span>Due {formatDate(assignment.due_date)}</span>
                              </div>
                              {isSubmitted && (
                                <span className="px-3 py-1 rounded-full font-medium text-xs" style={{ backgroundColor: 'rgba(74, 155, 155, 0.3)', color: '#4A9B9B' }}>
                                  Submitted
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Submit Button */}
                        {!isSubmitted && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAssignment(assignment);
                            }}
                            className="flex-shrink-0 px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 group-hover:scale-105"
                            style={{
                              background: 'linear-gradient(135deg, #D97746 0%, #E6B84D 100%)',
                              color: 'white',
                            }}
                          >
                            <Upload size={18} />
                            <span>Submit</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {selectedAssignment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(26, 43, 74, 0.9)', backdropFilter: 'blur(8px)' }}
            onClick={() => !uploading && setSelectedAssignment(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="relative backdrop-blur-md border rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Submit Assignment</h2>
                  <button
                    onClick={() => !uploading && setSelectedAssignment(null)}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                    disabled={uploading}
                  >
                    <X size={20} style={{ color: 'rgba(255,255,255,0.6)' }} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {selectedAssignment.title}
                  </h3>
                  <p className="text-sm mb-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {selectedAssignment.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    <Calendar size={16} />
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
                    className="block border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer hover:bg-white/5"
                    style={{ borderColor: 'rgba(255,255,255,0.2)' }}
                  >
                    <File className="w-12 h-12 mb-4 mx-auto" style={{ color: 'rgba(255,255,255,0.4)' }} />
                    <p className="text-white font-medium mb-2">
                      Click to upload your file
                    </p>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      PDF, Word, Image, or Audio files
                    </p>
                  </label>
                </div>

                {/* Uploading State */}
                {uploading && (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 border-4 border-white/20 rounded-full animate-spin mx-auto mb-3" style={{ borderTopColor: '#D97746' }}></div>
                    <p style={{ color: 'rgba(255,255,255,0.7)' }}>Uploading your work...</p>
                  </div>
                )}

                {/* Cancel Button */}
                {!uploading && (
                  <button
                    onClick={() => setSelectedAssignment(null)}
                    className="w-full py-3 rounded-xl border font-medium transition-colors hover:bg-white/10"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderColor: 'rgba(255,255,255,0.15)',
                      color: 'white',
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
