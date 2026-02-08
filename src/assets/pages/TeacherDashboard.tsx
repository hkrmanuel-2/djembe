import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import {
  getStudentsWithProgress,
  getClassStatistics,
  getStudentDetailedProgress,
} from "@/lib/progressApi";
import { getTeacherClasses } from "@/lib/teacherApi";
import {
  Users,
  Trophy,
  Music,
  FileCheck,
  TrendingUp,
  ChevronRight,
  ArrowLeft,
  Flame,
  Star,
  Clock,
  AlertTriangle,
  FileText,
  FolderOpen,
  Filter,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type ClassType = {
  class_id: string;
  name: string;
  school_id: string;
  teacher_id: string;
};

type Student = {
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  progress: {
    total_xp: number;
    current_level: number;
    assignments_completed: number;
    projects_created: number;
    projects_exported: number;
    total_time_minutes: number;
    current_streak: number;
    last_activity_date: string;
  } | null;
};

// Format minutes into readable time string
function formatTimeSpent(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
}

type ClassStats = {
  totalStudents: number;
  totalXP: number;
  avgXP: number;
  avgLevel: number;
  totalAssignments: number;
  totalProjects: number;
  activeStreaks: number;
};

export default function TeacherDashboard() {
  const { userProfile } = useAuthStore();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<ClassStats | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentDetail, setStudentDetail] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");

  // Load classes on mount
  useEffect(() => {
    if (userProfile?.teacher_id) {
      loadClasses();
    }
  }, [userProfile?.teacher_id]);

  // Load dashboard data when school, class selection, or teacher's classes change
  useEffect(() => {
    if (userProfile?.school_id && classes !== undefined) {
      loadDashboardData();
    }
  }, [userProfile?.school_id, selectedClass, classes]);

  const loadClasses = async () => {
    if (!userProfile?.teacher_id) return;
    const result = await getTeacherClasses(userProfile.teacher_id);
    if (result.data) {
      setClasses(result.data);
    }
  };

  const loadDashboardData = async () => {
    if (!userProfile?.school_id) return;

    setIsLoading(true);
    try {
      // If a specific class is selected, use that
      // Otherwise, use all of the teacher's assigned class IDs
      let classFilter: string | string[] | null = null;
      if (selectedClass) {
        classFilter = selectedClass;
      } else if (classes.length > 0) {
        // Filter by all teacher's assigned classes
        classFilter = classes.map((c) => c.class_id);
      }

      const [studentsResult, statsResult] = await Promise.all([
        getStudentsWithProgress(userProfile.school_id, classFilter),
        getClassStatistics(userProfile.school_id, classFilter),
      ]);

      if (studentsResult.data) setStudents(studentsResult.data);
      if (statsResult.data) setStats(statsResult.data);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentClick = async (student: Student) => {
    setSelectedStudent(student);
    setDetailLoading(true);

    try {
      const result = await getStudentDetailedProgress(student.student_id);
      if (result.data) {
        setStudentDetail(result.data);
      }
    } catch (error) {
      console.error("Error loading student detail:", error);
    } finally {
      setDetailLoading(false);
    }
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
        style={{ background: 'linear-gradient(180deg, #F3EEFF 0%, #E8DFFF 50%, #F8F5FF 100%)' }}
      >
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div
              className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4"
              style={{ borderColor: '#E8DFFF', borderTopColor: "#D97746" }}
            />
            <p className="text-lg text-gray-500">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Student Detail View
  if (selectedStudent) {
    return (
      <div
        className="flex w-full flex-col min-h-screen relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #F3EEFF 0%, #E8DFFF 50%, #F8F5FF 100%)', fontFamily: "'Outfit', sans-serif" }}
      >
        <div className="relative z-10 min-h-screen px-6 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => {
                setSelectedStudent(null);
                setStudentDetail(null);
              }}
              className="flex items-center gap-2 text-gray-500 hover:text-[#3E2468] mb-6 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Students</span>
            </button>

            {detailLoading ? (
              <div className="text-center py-20">
                <div
                  className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4"
                  style={{ borderColor: '#E8DFFF', borderTopColor: "#D97746" }}
                />
                <p className="text-gray-500">Loading student details...</p>
              </div>
            ) : (
              <motion.div variants={containerVariants} initial="hidden" animate="visible">
                {/* Student Header */}
                <motion.div variants={itemVariants} className="text-center mb-10">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold"
                    style={{ backgroundColor: "rgba(217, 119, 70, 0.15)", color: "#D97746" }}
                  >
                    {selectedStudent.first_name?.[0]}
                    {selectedStudent.last_name?.[0]}
                  </div>
                  <h1
                    className="text-4xl font-bold mb-2"
                    style={{ color: '#3E2468', fontFamily: "'Fredoka', sans-serif" }}
                  >
                    {selectedStudent.first_name} {selectedStudent.last_name}
                  </h1>
                  <p className="text-gray-400">{selectedStudent.email}</p>
                </motion.div>

                {/* Progress Summary */}
                {studentDetail?.progress && (
                  <motion.div variants={itemVariants} className="mb-8">
                    <div
                      className="rounded-2xl p-6 bg-white shadow-md border-2"
                      style={{ borderColor: '#E8DFFF' }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-gray-400 text-sm">Current Level</p>
                          <p className="text-4xl font-bold" style={{ color: "#D97746" }}>
                            {studentDetail.progress.current_level}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-400 text-sm">Total XP</p>
                          <p className="text-2xl font-bold" style={{ color: '#3E2468' }}>
                            {studentDetail.progress.total_xp?.toLocaleString() || 0}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-5 gap-4 mt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold" style={{ color: '#3E2468' }}>
                            {studentDetail.progress.projects_created || 0}
                          </p>
                          <p className="text-gray-400 text-xs">Projects</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold" style={{ color: '#3E2468' }}>
                            {studentDetail.progress.assignments_completed || 0}
                          </p>
                          <p className="text-gray-400 text-xs">Assignments</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold" style={{ color: '#3E2468' }}>
                            {studentDetail.progress.projects_exported || 0}
                          </p>
                          <p className="text-gray-400 text-xs">Exports</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold" style={{ color: '#3E2468' }}>
                            {formatTimeSpent(studentDetail.progress.total_time_minutes || 0)}
                          </p>
                          <p className="text-gray-400 text-xs">Time Spent</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold" style={{ color: '#3E2468' }}>
                            {studentDetail.progress.current_streak || 0}
                          </p>
                          <p className="text-gray-400 text-xs">Day Streak</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Badges Earned */}
                {studentDetail?.badges && studentDetail.badges.length > 0 && (
                  <motion.div variants={itemVariants} className="mb-8">
                    <h2
                      className="text-xl font-bold mb-4 flex items-center gap-2"
                      style={{ color: '#3E2468', fontFamily: "'Fredoka', sans-serif" }}
                    >
                      <Star style={{ color: "#E6B84D" }} size={20} />
                      Badges Earned ({studentDetail.badges.length})
                    </h2>
                    <div className="flex flex-wrap gap-3">
                      {studentDetail.badges.map((badge: any) => (
                        <div
                          key={badge.id}
                          className="flex items-center gap-2 px-4 py-2 rounded-full border-2"
                          style={{
                            backgroundColor: "rgba(230, 184, 77, 0.1)",
                            borderColor: "rgba(230, 184, 77, 0.3)",
                          }}
                        >
                          <span>{badge.badge_definitions?.icon}</span>
                          <span className="text-sm font-medium" style={{ color: '#3E2468' }}>
                            {badge.badge_definitions?.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Recent Activity */}
                {studentDetail?.activities && studentDetail.activities.length > 0 && (
                  <motion.div variants={itemVariants}>
                    <h2
                      className="text-xl font-bold mb-4"
                      style={{ color: '#3E2468', fontFamily: "'Fredoka', sans-serif" }}
                    >
                      Recent Activity
                    </h2>
                    <div
                      className="rounded-2xl bg-white shadow-md border-2 overflow-hidden"
                      style={{ borderColor: '#E8DFFF' }}
                    >
                      {studentDetail.activities.slice(0, 10).map((activity: any, index: number) => (
                        <div
                          key={activity.id}
                          className={`px-6 py-4 flex items-center justify-between ${
                            index !== Math.min(9, studentDetail.activities.length - 1)
                              ? "border-b"
                              : ""
                          }`}
                          style={{ borderColor: '#E8DFFF' }}
                        >
                          <div>
                            <p className="font-medium" style={{ color: '#3E2468' }}>{activity.description}</p>
                            <p className="text-gray-400 text-sm">
                              {new Date(activity.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          <span
                            className="px-3 py-1 rounded-full text-sm font-semibold"
                            style={{ backgroundColor: "rgba(230, 184, 77, 0.15)", color: "#E6B84D" }}
                          >
                            +{activity.xp_awarded} XP
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main Dashboard View
  return (
    <div
      className="flex w-full flex-col min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #F3EEFF 0%, #E8DFFF 50%, #F8F5FF 100%)', fontFamily: "'Outfit', sans-serif" }}
    >
      <div className="relative z-10 min-h-screen px-6 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-10">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 mb-4"
              style={{ backgroundColor: "rgba(232, 223, 255, 0.5)", borderColor: '#E8DFFF' }}
            >
              <Users size={16} style={{ color: "#E6B84D" }} />
              <span className="text-sm font-medium" style={{ color: '#3E2468' }}>Teacher Dashboard</span>
            </div>

            <h1
              className="text-5xl font-bold mb-2"
              style={{ color: '#3E2468', fontFamily: "'Fredoka', sans-serif" }}
            >
              Student <span style={{ color: "#D97746" }}>Progress</span>
            </h1>
            <p className="text-xl text-gray-400">
              Track your students' learning journey
            </p>
          </motion.div>

          {/* Class Filter */}
          {classes.length > 0 && (
            <motion.div variants={itemVariants} className="mb-6">
              <div className="flex items-center justify-center gap-3">
                <Filter size={18} className="text-gray-400" />
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-4 py-2 rounded-xl border-2 focus:outline-none transition-all cursor-pointer min-w-[200px]"
                  style={{
                    backgroundColor: "white",
                    borderColor: selectedClass ? "#4A9B9B" : '#E8DFFF',
                    color: '#3E2468',
                  }}
                >
                  <option value="">
                    {classes.length > 1 ? "All My Classes" : "My Class"}
                  </option>
                  {classes.length > 1 && classes.map((cls) => (
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
                    className="text-gray-400 hover:text-[#3E2468] text-sm underline"
                  >
                    Clear
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Stats Overview */}
          {stats && (
            <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <StatCard
                icon={<Users size={24} />}
                label="Students"
                value={stats.totalStudents}
                color="#4A9B9B"
              />
              <StatCard
                icon={<TrendingUp size={24} />}
                label="Avg Level"
                value={stats.avgLevel.toFixed(1)}
                color="#D97746"
              />
              <StatCard
                icon={<FileCheck size={24} />}
                label="Assignments"
                value={stats.totalAssignments}
                color="#E6B84D"
              />
              <StatCard
                icon={<Music size={24} />}
                label="Projects"
                value={stats.totalProjects}
                color="#4A9B9B"
              />
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <QuickActionCard
              icon={<FileText size={24} />}
              title="Assignments"
              description="Create and manage assignments"
              color="#D97746"
              onClick={() => navigate("/teacher/assignments")}
            />
            <QuickActionCard
              icon={<AlertTriangle size={24} />}
              title="Analytics"
              description="View students needing attention"
              color="#F59E0B"
              onClick={() => navigate("/teacher/analytics")}
            />
            <QuickActionCard
              icon={<FolderOpen size={24} />}
              title="Projects"
              description="Review student compositions"
              color="#4A9B9B"
              onClick={() => navigate("/teacher/projects")}
            />
          </motion.div>

          {/* Students List */}
          <motion.div variants={itemVariants}>
            <h2
              className="text-2xl font-bold mb-6"
              style={{ color: '#3E2468', fontFamily: "'Fredoka', sans-serif" }}
            >
              {selectedClass
                ? classes.find((c) => c.class_id === selectedClass)?.name || "Students"
                : classes.length > 0
                ? "My Students"
                : "Students"}
            </h2>

            {classes.length === 0 ? (
              <div
                className="text-center py-12 rounded-2xl bg-white shadow-md border-2"
                style={{ borderColor: '#E8DFFF' }}
              >
                <Users size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-2">No classes assigned to you</p>
                <p className="text-gray-400 text-sm">Contact your school administrator to be assigned to a class</p>
              </div>
            ) : students.length === 0 ? (
              <div
                className="text-center py-12 rounded-2xl bg-white shadow-md border-2"
                style={{ borderColor: '#E8DFFF' }}
              >
                <Users size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No students found in your class</p>
              </div>
            ) : (
              <div
                className="rounded-2xl bg-white shadow-md border-2 overflow-hidden"
                style={{ borderColor: '#E8DFFF' }}
              >
                {/* Table Header */}
                <div
                  className="grid grid-cols-12 gap-4 px-6 py-4 border-b text-sm font-semibold text-gray-400"
                  style={{ borderColor: '#E8DFFF', backgroundColor: '#F8F5FF' }}
                >
                  <div className="col-span-4">Student</div>
                  <div className="col-span-2 text-center">Level</div>
                  <div className="col-span-2 text-center">XP</div>
                  <div className="col-span-2 text-center">Projects</div>
                  <div className="col-span-2 text-center">Streak</div>
                </div>

                {/* Student Rows */}
                {students.map((student, index) => (
                  <div
                    key={student.student_id}
                    onClick={() => handleStudentClick(student)}
                    className={`grid grid-cols-12 gap-4 px-6 py-4 cursor-pointer hover:bg-purple-50 transition-colors ${
                      index !== students.length - 1 ? "border-b" : ""
                    }`}
                    style={{ borderColor: '#E8DFFF' }}
                  >
                    <div className="col-span-4 flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
                        style={{ backgroundColor: "rgba(217, 119, 70, 0.15)", color: "#D97746" }}
                      >
                        {student.first_name?.[0]}
                        {student.last_name?.[0]}
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: '#3E2468' }}>
                          {student.first_name} {student.last_name}
                        </p>
                        <p className="text-gray-400 text-xs">{student.email}</p>
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center justify-center">
                      <span
                        className="px-3 py-1 rounded-full text-sm font-semibold"
                        style={{ backgroundColor: "rgba(217, 119, 70, 0.12)", color: "#D97746" }}
                      >
                        {student.progress?.current_level || 1}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center justify-center" style={{ color: '#3E2468' }}>
                      {student.progress?.total_xp?.toLocaleString() || 0}
                    </div>
                    <div className="col-span-2 flex items-center justify-center" style={{ color: '#3E2468' }}>
                      {student.progress?.projects_created || 0}
                    </div>
                    <div className="col-span-2 flex items-center justify-center gap-2">
                      {(student.progress?.current_streak || 0) > 0 && (
                        <Flame size={16} style={{ color: "#D97746" }} />
                      )}
                      <span style={{ color: '#3E2468' }}>{student.progress?.current_streak || 0}</span>
                      <ChevronRight size={16} className="text-gray-300" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div
      className="rounded-xl p-5 bg-white shadow-md border-2 text-center"
      style={{ borderColor: '#E8DFFF' }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {icon}
      </div>
      <p className="text-2xl font-bold" style={{ color: '#3E2468' }}>{value}</p>
      <p className="text-gray-400 text-sm">{label}</p>
    </div>
  );
}

function QuickActionCard({
  icon,
  title,
  description,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl p-5 bg-white shadow-md border-2 text-left transition-all hover:scale-[1.02] hover:shadow-lg"
      style={{ borderColor: '#E8DFFF' }}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {icon}
        </div>
        <div>
          <p className="text-lg font-semibold" style={{ color: '#3E2468' }}>{title}</p>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>
        <ChevronRight size={20} className="ml-auto text-gray-300" />
      </div>
    </button>
  );
}
