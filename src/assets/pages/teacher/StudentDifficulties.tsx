import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { getStudentDifficulties, getTeacherClasses } from "@/lib/teacherApi";
import CloudShader from "@/components/ui/cloud-shader";
import {
  AlertTriangle,
  Clock,
  TrendingDown,
  FileX,
  Flame,
  Timer,
  ChevronDown,
  ChevronUp,
  User,
  CheckCircle2,
  Filter,
} from "lucide-react";

type ClassType = {
  class_id: string;
  name: string;
};

type DifficultyIssue = {
  type: "inactive" | "low_xp" | "missed_assignments" | "broken_streak" | "low_engagement";
  severity: "high" | "medium" | "low";
  message: string;
  value: number | null;
};

type StudentDifficulty = {
  student: {
    student_id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  progress: {
    total_xp: number;
    current_level: number;
    current_streak: number;
    last_activity_date: string | null;
    assignments_completed: number;
    projects_created: number;
  };
  issues: DifficultyIssue[];
  severity: "high" | "medium" | "low";
};

const issueIcons: Record<string, React.ElementType> = {
  inactive: Clock,
  low_xp: TrendingDown,
  missed_assignments: FileX,
  broken_streak: Flame,
  low_engagement: Timer,
};

const severityColors: Record<string, { bg: string; text: string; border: string }> = {
  high: { bg: "rgba(239, 68, 68, 0.15)", text: "#EF4444", border: "rgba(239, 68, 68, 0.3)" },
  medium: { bg: "rgba(245, 158, 11, 0.15)", text: "#F59E0B", border: "rgba(245, 158, 11, 0.3)" },
  low: { bg: "rgba(74, 155, 155, 0.15)", text: "#4A9B9B", border: "rgba(74, 155, 155, 0.3)" },
};

export default function StudentDifficulties() {
  const { userProfile } = useAuthStore();
  const [difficulties, setDifficulties] = useState<StudentDifficulty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");

  // Load classes on mount
  useEffect(() => {
    if (userProfile?.teacher_id) {
      loadClasses();
    }
  }, [userProfile?.teacher_id]);

  // Load difficulties when school or class changes
  useEffect(() => {
    if (userProfile?.school_id) {
      loadDifficulties();
    }
  }, [userProfile?.school_id, selectedClass]);

  const loadClasses = async () => {
    if (!userProfile?.teacher_id) return;
    const result = await getTeacherClasses(userProfile.teacher_id);
    if (result.data) {
      setClasses(result.data);
    }
  };

  const loadDifficulties = async () => {
    if (!userProfile?.school_id) return;
    setIsLoading(true);
    try {
      const classFilter = selectedClass || null;
      const result = await getStudentDifficulties(userProfile.school_id, classFilter);
      if (result.data) {
        setDifficulties(result.data);
      }
    } catch (error) {
      console.error("Error loading difficulties:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDifficulties =
    filter === "all" ? difficulties : difficulties.filter((d) => d.severity === filter);

  const countBySeverity = {
    high: difficulties.filter((d) => d.severity === "high").length,
    medium: difficulties.filter((d) => d.severity === "medium").length,
    low: difficulties.filter((d) => d.severity === "low").length,
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
            <p className="text-lg text-white/70">Analyzing student progress...</p>
          </div>
        </div>
      </div>
    );
  }

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
          <motion.div variants={itemVariants} className="mb-8">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border mb-4"
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                borderColor: "rgba(255,255,255,0.2)",
              }}
            >
              <AlertTriangle size={16} style={{ color: "#F59E0B" }} />
              <span className="text-sm font-medium text-white/90">Student Analytics</span>
            </div>
            <h1 className="text-4xl font-bold text-white">
              Students <span style={{ color: "#D97746" }}>Needing Attention</span>
            </h1>
            <p className="text-white/60 mt-2">
              Identify students who may be struggling and need extra support
            </p>
          </motion.div>

          {/* Class Filter */}
          {classes.length > 0 && (
            <motion.div variants={itemVariants} className="mb-6">
              <div className="flex items-center gap-3">
                <Filter size={18} className="text-white/60" />
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-4 py-2 rounded-xl backdrop-blur-md border focus:outline-none transition-all cursor-pointer min-w-[200px]"
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

          {/* Summary Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-4 gap-4 mb-8">
            <SummaryCard
              label="Total Flagged"
              value={difficulties.length}
              color="#E6B84D"
              active={filter === "all"}
              onClick={() => setFilter("all")}
            />
            <SummaryCard
              label="High Priority"
              value={countBySeverity.high}
              color="#EF4444"
              active={filter === "high"}
              onClick={() => setFilter("high")}
            />
            <SummaryCard
              label="Medium Priority"
              value={countBySeverity.medium}
              color="#F59E0B"
              active={filter === "medium"}
              onClick={() => setFilter("medium")}
            />
            <SummaryCard
              label="Low Priority"
              value={countBySeverity.low}
              color="#4A9B9B"
              active={filter === "low"}
              onClick={() => setFilter("low")}
            />
          </motion.div>

          {/* Student List */}
          {filteredDifficulties.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="text-center py-16 rounded-2xl backdrop-blur-md border"
              style={{
                backgroundColor: "rgba(255,255,255,0.08)",
                borderColor: "rgba(255,255,255,0.15)",
              }}
            >
              <CheckCircle2 size={48} className="mx-auto mb-4" style={{ color: "#10B981" }} />
              <p className="text-white/80 text-lg">All students are on track!</p>
              <p className="text-white/50 mt-1">No issues detected at this time</p>
            </motion.div>
          ) : (
            <motion.div variants={itemVariants} className="space-y-4">
              {filteredDifficulties.map((difficulty) => (
                <DifficultyCard
                  key={difficulty.student.student_id}
                  difficulty={difficulty}
                  expanded={expandedStudent === difficulty.student.student_id}
                  onToggle={() =>
                    setExpandedStudent(
                      expandedStudent === difficulty.student.student_id
                        ? null
                        : difficulty.student.student_id
                    )
                  }
                />
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  color,
  active,
  onClick,
}: {
  label: string;
  value: number;
  color: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl p-4 backdrop-blur-md border text-center transition-all hover:scale-[1.02] ${
        active ? "ring-2" : ""
      }`}
      style={{
        backgroundColor: active ? `${color}20` : "rgba(255,255,255,0.08)",
        borderColor: active ? color : "rgba(255,255,255,0.15)",
        ringColor: color,
      }}
    >
      <p className="text-3xl font-bold" style={{ color: active ? color : "white" }}>
        {value}
      </p>
      <p className="text-white/60 text-sm">{label}</p>
    </button>
  );
}

function DifficultyCard({
  difficulty,
  expanded,
  onToggle,
}: {
  difficulty: StudentDifficulty;
  expanded: boolean;
  onToggle: () => void;
}) {
  const colors = severityColors[difficulty.severity];

  return (
    <div
      className="rounded-2xl backdrop-blur-md border overflow-hidden transition-all"
      style={{
        backgroundColor: "rgba(255,255,255,0.08)",
        borderColor: colors.border,
      }}
    >
      {/* Header Row */}
      <div
        className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold"
            style={{ backgroundColor: colors.bg, color: colors.text }}
          >
            {difficulty.student.first_name?.[0]}
            {difficulty.student.last_name?.[0]}
          </div>

          {/* Name & Email */}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-white">
                {difficulty.student.first_name} {difficulty.student.last_name}
              </h3>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-medium uppercase"
                style={{ backgroundColor: colors.bg, color: colors.text }}
              >
                {difficulty.severity}
              </span>
            </div>
            <p className="text-white/50 text-sm">{difficulty.student.email}</p>
          </div>
        </div>

        {/* Issues Preview */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {difficulty.issues.slice(0, 3).map((issue, idx) => {
              const Icon = issueIcons[issue.type] || AlertTriangle;
              const issueColor = severityColors[issue.severity];
              return (
                <div
                  key={idx}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: issueColor.bg }}
                  title={issue.message}
                >
                  <Icon size={16} style={{ color: issueColor.text }} />
                </div>
              );
            })}
            {difficulty.issues.length > 3 && (
              <span className="text-white/50 text-sm">+{difficulty.issues.length - 3}</span>
            )}
          </div>
          {expanded ? (
            <ChevronUp size={20} className="text-white/50" />
          ) : (
            <ChevronDown size={20} className="text-white/50" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-white/10">
          {/* Issues List */}
          <div className="mt-4 space-y-2">
            <p className="text-white/70 text-sm font-medium mb-3">Issues Detected:</p>
            {difficulty.issues.map((issue, idx) => {
              const Icon = issueIcons[issue.type] || AlertTriangle;
              const issueColor = severityColors[issue.severity];
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ backgroundColor: issueColor.bg }}
                >
                  <Icon size={18} style={{ color: issueColor.text }} />
                  <span style={{ color: issueColor.text }}>{issue.message}</span>
                </div>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div className="mt-4 grid grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-xl bg-white/5">
              <p className="text-xl font-bold text-white">{difficulty.progress.total_xp}</p>
              <p className="text-white/50 text-xs">Total XP</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/5">
              <p className="text-xl font-bold text-white">Lv.{difficulty.progress.current_level}</p>
              <p className="text-white/50 text-xs">Level</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/5">
              <p className="text-xl font-bold text-white">
                {difficulty.progress.assignments_completed}
              </p>
              <p className="text-white/50 text-xs">Assignments</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/5">
              <p className="text-xl font-bold text-white">
                {difficulty.progress.projects_created}
              </p>
              <p className="text-white/50 text-xs">Projects</p>
            </div>
          </div>

          {/* Last Activity */}
          <div className="mt-4 flex items-center gap-2 text-white/50 text-sm">
            <Clock size={14} />
            <span>
              Last active:{" "}
              {difficulty.progress.last_activity_date
                ? new Date(difficulty.progress.last_activity_date).toLocaleDateString()
                : "Never"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
