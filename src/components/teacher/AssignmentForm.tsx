import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { createAssignment, updateAssignment, getTeacherClasses } from "@/lib/teacherApi";
import { X, FileText, Music, Upload, Calendar, Users } from "lucide-react";

type Assignment = {
  id: string;
  title: string;
  description: string;
  due_date: string;
  assignment_type: "upload" | "project";
  class_id?: string;
};

type Class = {
  class_id?: string;
  id?: string;
  name: string;
};

type AssignmentFormProps = {
  assignment?: Assignment | null;
  onClose: () => void;
  onSuccess: () => void;
};

export default function AssignmentForm({ assignment, onClose, onSuccess }: AssignmentFormProps) {
  const { userProfile } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [formData, setFormData] = useState({
    title: assignment?.title || "",
    description: assignment?.description || "",
    due_date: assignment?.due_date
      ? new Date(assignment.due_date).toISOString().split("T")[0]
      : "",
    assignment_type: assignment?.assignment_type || "upload",
    class_id: assignment?.class_id || "",
  });

  // Load teacher's assigned classes
  useEffect(() => {
    const loadClasses = async () => {
      if (!userProfile?.teacher_id) return;
      setLoadingClasses(true);
      const { data } = await getTeacherClasses(userProfile.teacher_id);
      setClasses(data || []);
      // Auto-select first class if creating new assignment
      if (!assignment && data?.length > 0 && !formData.class_id) {
        const firstClassId = data[0].class_id || data[0].id;
        setFormData(prev => ({ ...prev, class_id: firstClassId }));
      }
      setLoadingClasses(false);
    };
    loadClasses();
  }, [userProfile?.teacher_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.teacher_id || !userProfile?.school_id) return;

    setIsSubmitting(true);
    try {
      if (assignment) {
        // Update existing
        await updateAssignment(assignment.id, {
          ...formData,
          due_date: new Date(formData.due_date).toISOString(),
        });
      } else {
        // Create new
        await createAssignment(userProfile.teacher_id, userProfile.school_id, {
          ...formData,
          due_date: new Date(formData.due_date).toISOString(),
        });
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving assignment:", error);
      alert("Failed to save assignment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
              style={{ backgroundColor: "rgba(217, 119, 70, 0.2)" }}
            >
              <FileText size={20} style={{ color: "#D97746" }} />
            </div>
            <h2 className="text-xl font-bold text-white">
              {assignment ? "Edit Assignment" : "New Assignment"}
            </h2>
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
          {/* Title */}
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter assignment title"
              required
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-[#D97746] transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the assignment requirements..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-[#D97746] transition-colors resize-none"
            />
          </div>

          {/* Class Selection */}
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              <Users size={14} className="inline mr-1" />
              Class
            </label>
            {loadingClasses ? (
              <div className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white/50">
                Loading classes...
              </div>
            ) : classes.length === 0 ? (
              <div className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white/50 text-sm">
                No classes found. Please create a class first.
              </div>
            ) : (
              <select
                value={formData.class_id}
                onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white focus:outline-none focus:border-[#D97746] transition-colors"
                style={{ colorScheme: "dark" }}
              >
                <option value="" disabled>Select a class</option>
                {classes.map((cls) => {
                  const classId = cls.class_id || cls.id;
                  return (
                    <option key={classId} value={classId}>
                      {cls.name}
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              <Calendar size={14} className="inline mr-1" />
              Due Date
            </label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              required
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white focus:outline-none focus:border-[#D97746] transition-colors"
              style={{ colorScheme: "dark" }}
            />
          </div>

          {/* Assignment Type */}
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              Assignment Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, assignment_type: "upload" })}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                  formData.assignment_type === "upload"
                    ? "border-[#D97746] bg-[#D97746]/20"
                    : "border-white/15 bg-white/5 hover:bg-white/10"
                }`}
              >
                <Upload
                  size={24}
                  style={{
                    color: formData.assignment_type === "upload" ? "#D97746" : "rgba(255,255,255,0.5)",
                  }}
                />
                <div className="text-left">
                  <p
                    className="font-medium"
                    style={{
                      color:
                        formData.assignment_type === "upload" ? "#D97746" : "rgba(255,255,255,0.9)",
                    }}
                  >
                    File Upload
                  </p>
                  <p className="text-xs text-white/50">PDF, audio, images</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, assignment_type: "project" })}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                  formData.assignment_type === "project"
                    ? "border-[#4A9B9B] bg-[#4A9B9B]/20"
                    : "border-white/15 bg-white/5 hover:bg-white/10"
                }`}
              >
                <Music
                  size={24}
                  style={{
                    color: formData.assignment_type === "project" ? "#4A9B9B" : "rgba(255,255,255,0.5)",
                  }}
                />
                <div className="text-left">
                  <p
                    className="font-medium"
                    style={{
                      color:
                        formData.assignment_type === "project" ? "#4A9B9B" : "rgba(255,255,255,0.9)",
                    }}
                  >
                    Music Project
                  </p>
                  <p className="text-xs text-white/50">Music composition</p>
                </div>
              </button>
            </div>
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
                background: "linear-gradient(135deg, #D97746 0%, #E6B84D 100%)",
              }}
            >
              {isSubmitting ? "Saving..." : assignment ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
