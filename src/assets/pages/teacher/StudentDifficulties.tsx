import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { getStudentDifficulties, getTeacherClasses } from "@/lib/teacherApi";
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
  low: { bg: "rgba(66, 201, 201, 0.15)", text: "#42C9C9", border: "rgba(66, 201, 201, 0.3)" },
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
        style={{
          background: 'linear-gradient(180deg, #F3EEFF 0%, #E8DFFF 50%, #F8F5FF 100%)',
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div
              className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4"
              style={{ borderColor: '#E8DFFF', borderTopColor: '#D97746' }}
            />
            <p className="text-lg text-gray-500">Analyzing student progress...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex w-full flex-col min-h-screen relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #F3EEFF 0%, #E8DFFF 50%, #F8F5FF 100%)',
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <div className="relative z-10 min-h-screen px-6 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 mb-4"
              style={{
                backgroundColor: "#FFF9F0",
                borderColor: "#F5D6A0",
              }}
            >
              <AlertTriangle size={16} style={{ color: "#F59E0B" }} />
              <span className="text-sm font-medium" style={{ color: '#3E2468' }}>Student Analytics</span>
            </div>
            <h1 className="text-4xl font-bold" style={{ color: '#3E2468', fontFamily: "'Fredoka', sans-serif" }}>
              Students <span style={{ color: "#D97746" }}>Needing Attention</span>
            </h1>
            <p className="text-gray-500 mt-2">
              Identify students who may be struggling and need extra support
            </p>
          </motion.div>

          {/* Class Filter */}
          {classes.length > 0 && (
            <motion.div variants={itemVariants} className="mb-6">
              <div className="flex items-center gap-3">
                <Filter size={18} className="text-gray-500" />
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-4 py-2 rounded-xl border-2 focus:outline-none transition-all cursor-pointer min-w-[200px]"
                  style={{
                    backgroundColor: "white",
                    borderColor: selectedClass ? "#42C9C9" : "#E8DFFF",
                    color: "#3E2468",
                  }}
                >
                  <option value="">
                    All Classes
                  </option>
                  {classes.map((cls) => (
                    <option
                      key={cls.class_id}
                      value={cls.class_id}
                    >
                      {cls.name}
                    </option>
                  ))}
                </select>
                {selectedClass && (
                  <button
                    onClick={() => setSelectedClass("")}
                    className="text-gray-500 hover:text-gray-700 text-sm underline"
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
              color="#42C9C9"
              active={filter === "low"}
              onClick={() => setFilter("low")}
            />
          </motion.div>

          {/* Student List */}
          {filteredDifficulties.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="text-center py-16 bg-white shadow-md rounded-2xl border-2"
              style={{ borderColor: '#E8DFFF' }}
            >
              <CheckCircle2 size={48} className="mx-auto mb-4" style={{ color: "#10B981" }} />
              <p className="text-lg" style={{ color: '#3E2468', fontFamily: "'Fredoka', sans-serif" }}>All students are on track!</p>
              <p className="text-gray-500 mt-1">No issues detected at this time</p>
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
      className={`rounded-xl p-4 border-2 text-center transition-all hover:scale-[1.02] bg-white shadow-md ${
        active ? "ring-2" : ""
      }`}
      style={{
        borderColor: active ? color : "#E8DFFF",
        ringColor: color,
      }}
    >
      <p className="text-3xl font-bold" style={{ color: active ? color : "#3E2468" }}>
        {value}
      </p>
      <p className="text-gray-500 text-sm">{label}</p>
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
      className="bg-white shadow-md rounded-2xl overflow-hidden transition-all"
      style={{
        borderLeft: `4px solid ${colors.text}`,
      }}
    >
      {/* Header Row */}
      <div
        className="p-5 flex items-center justify-between cursor-pointer hover:bg-purple-50/50 transition-colors"
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
              <h3 className="text-lg font-semibold" style={{ color: '#3E2468', fontFamily: "'Fredoka', sans-serif" }}>
                {difficulty.student.first_name} {difficulty.student.last_name}
              </h3>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-medium uppercase"
                style={{ backgroundColor: colors.bg, color: colors.text }}
              >
                {difficulty.severity}
              </span>
            </div>
            <p className="text-gray-500 text-sm">{difficulty.student.email}</p>
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
              <span className="text-gray-500 text-sm">+{difficulty.issues.length - 3}</span>
            )}
          </div>
          {expanded ? (
            <ChevronUp size={20} className="text-gray-400" />
          ) : (
            <ChevronDown size={20} className="text-gray-400" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-5 pb-5 border-t" style={{ borderColor: '#E8DFFF' }}>
          {/* Issues List */}
          <div className="mt-4 space-y-2">
            <p className="text-gray-500 text-sm font-medium mb-3">Issues Detected:</p>
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
            <div className="text-center p-3 rounded-xl bg-purple-50">
              <p className="text-xl font-bold" style={{ color: '#3E2468' }}>{difficulty.progress.total_xp}</p>
              <p className="text-gray-500 text-xs">Total XP</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-purple-50">
              <p className="text-xl font-bold" style={{ color: '#3E2468' }}>Lv.{difficulty.progress.current_level}</p>
              <p className="text-gray-500 text-xs">Level</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-purple-50">
              <p className="text-xl font-bold" style={{ color: '#3E2468' }}>
                {difficulty.progress.assignments_completed}
              </p>
              <p className="text-gray-500 text-xs">Assignments</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-purple-50">
              <p className="text-xl font-bold" style={{ color: '#3E2468' }}>
                {difficulty.progress.projects_created}
              </p>
              <p className="text-gray-500 text-xs">Projects</p>
            </div>
          </div>

          {/* Last Activity */}
          <div className="mt-4 flex items-center gap-2 text-gray-500 text-sm">
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
