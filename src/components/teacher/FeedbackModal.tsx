import { useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { createFeedback, updateFeedback } from "@/lib/teacherApi";
import { X, MessageSquare, Star } from "lucide-react";

type FeedbackModalProps = {
  student: {
    student_id: string;
    first_name: string;
    last_name: string;
  };
  submissionId: string;
  existingFeedback?: {
    feedback_id: string;
    comment: string;
    score: number | null;
  } | null;
  onClose: () => void;
  onSuccess: () => void;
};

export default function FeedbackModal({
  student,
  submissionId,
  existingFeedback,
  onClose,
  onSuccess,
}: FeedbackModalProps) {
  const { userProfile } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    comment: existingFeedback?.comment || "",
    score: existingFeedback?.score?.toString() || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.teacher_id) return;

    if (!formData.comment.trim()) {
      alert("Please enter a comment");
      return;
    }

    const scoreValue = formData.score ? parseInt(formData.score, 10) : null;
    if (formData.score && (isNaN(scoreValue!) || scoreValue! < 0 || scoreValue! > 100)) {
      alert("Please enter a valid score between 0 and 100");
      return;
    }

    setIsSubmitting(true);
    try {
      if (existingFeedback) {
        await updateFeedback(existingFeedback.feedback_id, {
          comment: formData.comment,
          score: scoreValue,
        });
      } else {
        await createFeedback(userProfile.teacher_id, {
          submission_id: submissionId,
          comment: formData.comment,
          score: scoreValue,
        });
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving feedback:", error);
      alert("Failed to save feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickScores = [100, 90, 80, 70, 60, 50];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg rounded-2xl backdrop-blur-md border p-6"
        style={{
          backgroundColor: "rgba(26, 43, 74, 0.95)",
          borderColor: "rgba(255, 255, 255, 0.15)",
          fontFamily: "'Outfit', sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "rgba(230, 184, 77, 0.2)" }}
            >
              <MessageSquare size={20} style={{ color: "#E6B84D" }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {existingFeedback ? "Edit Feedback" : "Give Feedback"}
              </h2>
              <p className="text-white/50 text-sm">
                For {student.first_name} {student.last_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={20} className="text-white/70" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Comment */}
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              Comment <span className="text-red-400">*</span>
            </label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              placeholder="Write your feedback for the student..."
              rows={5}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-[#E6B84D] transition-colors resize-none"
            />
          </div>

          {/* Score */}
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              <Star size={14} className="inline mr-1" style={{ color: "#E6B84D" }} />
              Score (Optional, 0-100)
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {quickScores.map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      score: formData.score === score.toString() ? "" : score.toString(),
                    })
                  }
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    formData.score === score.toString()
                      ? "bg-[#E6B84D]/30 text-[#E6B84D] border border-[#E6B84D]/50"
                      : "bg-white/10 text-white/70 border border-white/15 hover:bg-white/15"
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={formData.score}
              onChange={(e) => setFormData({ ...formData, score: e.target.value })}
              placeholder="Enter score (0-100)"
              min={0}
              max={100}
              className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-[#E6B84D] transition-colors text-sm"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl font-medium text-white/70 bg-white/10 hover:bg-white/15 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
              style={{
                background: "linear-gradient(135deg, #E6B84D 0%, #D97746 100%)",
              }}
            >
              {isSubmitting ? "Saving..." : existingFeedback ? "Update" : "Submit"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
