import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { getStudentProjects, getStudentProjectById, getTeacherClasses } from "@/lib/teacherApi";
import {
  Music,
  User,
  Calendar,
  Layers,
  Clock,
  ArrowLeft,
  Play,
  Pause,
  MessageSquare,
  X,
  Filter,
} from "lucide-react";
import FeedbackModal from "@/components/teacher/FeedbackModal";

type ClassType = {
  class_id: string;
  name: string;
};

type Project = {
  project_id: string;
  title: string;
  bpm: number;
  bars: number;
  loop_count: number;
  created_at: string;
  updated_at: string;
  student: {
    student_id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
};

type ProjectDetail = {
  project_id: string;
  title: string;
  bpm: number;
  bars: number;
  placed_loops: any[];
  created_at: string;
  updated_at: string;
  students: {
    student_id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  feedback: any[];
};

export default function StudentProjects() {
  const { userProfile } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");

  // Load classes on mount
  useEffect(() => {
    if (userProfile?.teacher_id) {
      loadClasses();
    }
  }, [userProfile?.teacher_id]);

  // Load projects when school or class changes
  useEffect(() => {
    if (userProfile?.school_id) {
      loadProjects();
    }
  }, [userProfile?.school_id, selectedClass]);

  const loadClasses = async () => {
    if (!userProfile?.teacher_id) return;
    const result = await getTeacherClasses(userProfile.teacher_id);
    if (result.data) {
      setClasses(result.data);
    }
  };

  const loadProjects = async () => {
    if (!userProfile?.school_id) return;
    setIsLoading(true);
    try {
      const classFilter = selectedClass || null;
      const result = await getStudentProjects(userProfile.school_id, classFilter);
      if (result.data) {
        setProjects(result.data);
      }
    } catch (error) {
      console.error("Error loading projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectClick = async (project: Project) => {
    setDetailLoading(true);
    try {
      const result = await getStudentProjectById(project.project_id);
      if (result.data) {
        setSelectedProject(result.data);
      }
    } catch (error) {
      console.error("Error loading project detail:", error);
    } finally {
      setDetailLoading(false);
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

  const filteredProjects = projects.filter((project) => {
    const query = searchQuery.toLowerCase();
    return (
      project.title.toLowerCase().includes(query) ||
      project.student.first_name.toLowerCase().includes(query) ||
      project.student.last_name.toLowerCase().includes(query)
    );
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
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
            <p className="text-lg text-gray-500">Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  // Project Detail View
  if (selectedProject) {
    return (
      <div
        className="flex w-full flex-col min-h-screen relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #F3EEFF 0%, #E8DFFF 50%, #F8F5FF 100%)',
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        <div className="relative z-10 min-h-screen px-6 py-8">
          <div className="max-w-5xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => setSelectedProject(null)}
              className="flex items-center gap-2 hover:opacity-70 mb-6 transition-colors"
              style={{ color: '#3E2468' }}
            >
              <ArrowLeft size={20} />
              <span>Back to Projects</span>
            </button>

            {detailLoading ? (
              <div className="text-center py-20">
                <div
                  className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4"
                  style={{ borderColor: '#E8DFFF', borderTopColor: '#D97746' }}
                />
                <p className="text-gray-500">Loading project...</p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Project Header */}
                <div
                  className="bg-white shadow-md rounded-2xl border-2 p-6"
                  style={{ borderColor: '#E8DFFF' }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h1
                        className="text-3xl font-bold mb-2"
                        style={{ color: '#3E2468', fontFamily: "'Fredoka', sans-serif" }}
                      >
                        {selectedProject.title}
                      </h1>
                      <div className="flex items-center gap-2 text-gray-500">
                        <User size={16} />
                        <span>
                          {selectedProject.students.first_name}{" "}
                          {selectedProject.students.last_name}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span>{selectedProject.students.email}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowFeedback(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-white transition-all hover:scale-105"
                      style={{
                        background: "linear-gradient(135deg, #E6B84D 0%, #D97746 100%)",
                      }}
                    >
                      <MessageSquare size={18} />
                      Give Feedback
                    </button>
                  </div>

                  {/* Project Stats */}
                  <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                    <div className="text-center">
                      <p className="text-2xl font-bold" style={{ color: "#D97746" }}>
                        {selectedProject.bpm}
                      </p>
                      <p className="text-gray-400 text-sm">BPM</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold" style={{ color: "#42C9C9" }}>
                        {selectedProject.bars}
                      </p>
                      <p className="text-gray-400 text-sm">Bars</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold" style={{ color: "#E6B84D" }}>
                        {selectedProject.placed_loops?.length || 0}
                      </p>
                      <p className="text-gray-400 text-sm">Loops</p>
                    </div>
                    <div className="text-center">
                      <p
                        className="text-sm font-medium"
                        style={{ color: '#3E2468' }}
                      >
                        {formatDate(selectedProject.updated_at)}
                      </p>
                      <p className="text-gray-400 text-sm">Last Updated</p>
                    </div>
                  </div>
                </div>

                {/* Project Timeline Preview */}
                <div
                  className="bg-white shadow-md rounded-2xl border-2 p-6"
                  style={{ borderColor: '#E8DFFF' }}
                >
                  <h2
                    className="text-xl font-bold mb-4"
                    style={{ color: '#3E2468', fontFamily: "'Fredoka', sans-serif" }}
                  >
                    Project Timeline
                  </h2>

                  {/* Simple loop visualization */}
                  <div className="space-y-2">
                    {[0, 1, 2, 3, 4].map((row) => {
                      const rowLoops = selectedProject.placed_loops?.filter(
                        (loop: any) => loop.row === row
                      ) || [];
                      return (
                        <div
                          key={row}
                          className="h-12 rounded-lg relative bg-purple-50"
                        >
                          {rowLoops.map((loop: any, idx: number) => (
                            <div
                              key={idx}
                              className="absolute h-10 top-1 rounded-md flex items-center px-2 text-xs font-medium truncate"
                              style={{
                                left: `${(loop.col / selectedProject.bars) * 100}%`,
                                width: `${((loop.span || 1) / selectedProject.bars) * 100}%`,
                                backgroundColor: loop.color || "rgba(217, 119, 70, 0.5)",
                                color: "white",
                              }}
                              title={loop.type}
                            >
                              {loop.icon} {loop.type}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-gray-400 text-sm mt-4 text-center">
                    This is a simplified view. Open in Music Studio for full playback.
                  </p>
                </div>

                {/* Existing Feedback */}
                {selectedProject.feedback && selectedProject.feedback.length > 0 && (
                  <div
                    className="bg-white shadow-md rounded-2xl border-2 p-6"
                    style={{ borderColor: '#E8DFFF' }}
                  >
                    <h2
                      className="text-xl font-bold mb-4"
                      style={{ color: '#3E2468', fontFamily: "'Fredoka', sans-serif" }}
                    >
                      Previous Feedback
                    </h2>
                    <div className="space-y-4">
                      {selectedProject.feedback.map((fb: any) => (
                        <div
                          key={fb.id}
                          className="p-4 rounded-xl"
                          style={{ backgroundColor: "rgba(230, 184, 77, 0.1)" }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-500 text-sm">
                              {formatDate(fb.created_at)}
                            </span>
                            {fb.grade && (
                              <span
                                className="px-3 py-1 rounded-full text-sm font-semibold"
                                style={{
                                  backgroundColor: "rgba(230, 184, 77, 0.2)",
                                  color: "#E6B84D",
                                }}
                              >
                                {fb.grade}
                              </span>
                            )}
                          </div>
                          <p style={{ color: '#3E2468' }}>{fb.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Feedback Modal */}
        <AnimatePresence>
          {showFeedback && selectedProject && (
            <FeedbackModal
              student={{
                student_id: selectedProject.students.student_id,
                first_name: selectedProject.students.first_name,
                last_name: selectedProject.students.last_name,
              }}
              referenceType="project"
              referenceId={selectedProject.project_id}
              existingFeedback={null}
              onClose={() => setShowFeedback(false)}
              onSuccess={async () => {
                setShowFeedback(false);
                // Reload project to get new feedback
                const result = await getStudentProjectById(selectedProject.project_id);
                if (result.data) {
                  setSelectedProject(result.data);
                }
              }}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Main Projects Grid View
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
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-4"
              style={{
                backgroundColor: 'rgba(123, 91, 168, 0.1)',
                borderColor: '#E8DFFF',
              }}
            >
              <Music size={16} style={{ color: "#42C9C9" }} />
              <span className="text-sm font-medium" style={{ color: '#3E2468' }}>Student Compositions</span>
            </div>
            <h1
              className="text-4xl font-bold"
              style={{ color: '#3E2468', fontFamily: "'Fredoka', sans-serif" }}
            >
              Review <span style={{ color: "#D97746" }}>Projects</span>
            </h1>
            <p className="text-gray-500 mt-2">
              Browse and review student music compositions
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
                  className="px-4 py-2 rounded-xl border-2 focus:outline-none focus:border-[#7B5BA8] transition-all cursor-pointer min-w-[200px] bg-white"
                  style={{
                    borderColor: selectedClass ? "#42C9C9" : "#E8DFFF",
                    color: '#3E2468',
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
                    className="text-gray-500 hover:opacity-70 text-sm underline"
                  >
                    Clear
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Search */}
          <motion.div variants={itemVariants} className="mb-8">
            <input
              type="text"
              placeholder="Search by project title or student name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md px-4 py-3 rounded-xl bg-white border-2 placeholder-gray-400 focus:outline-none focus:border-[#7B5BA8] transition-colors"
              style={{
                borderColor: '#E8DFFF',
                color: '#3E2468',
              }}
            />
          </motion.div>

          {/* Projects Grid */}
          {filteredProjects.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="text-center py-16 bg-white shadow-md rounded-2xl border-2"
              style={{ borderColor: '#E8DFFF' }}
            >
              <Music size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg">
                {searchQuery ? "No projects found" : "No student projects yet"}
              </p>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.project_id}
                  variants={itemVariants}
                  onClick={() => handleProjectClick(project)}
                  className="bg-white shadow-md rounded-2xl border-2 overflow-hidden cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all"
                  style={{ borderColor: '#E8DFFF' }}
                >
                  {/* Project Visual */}
                  <div
                    className="h-32 relative"
                    style={{
                      background: "linear-gradient(135deg, rgba(66, 201, 201, 0.3) 0%, rgba(217, 119, 70, 0.3) 100%)",
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: "rgba(255,255,255,0.5)" }}
                      >
                        <Music size={32} style={{ color: "#E6B84D" }} />
                      </div>
                    </div>
                    {/* Loop count badge */}
                    <div
                      className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: "rgba(0,0,0,0.4)", color: "white" }}
                    >
                      <Layers size={12} className="inline mr-1" />
                      {project.loop_count} loops
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="p-4">
                    <h3
                      className="text-lg font-semibold truncate"
                      style={{ color: '#3E2468' }}
                    >
                      {project.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-gray-500 text-sm">
                      <User size={14} />
                      <span>
                        {project.student.first_name} {project.student.last_name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-3 text-sm">
                        <span style={{ color: "#D97746" }}>{project.bpm} BPM</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-500">{project.bars} bars</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 text-xs">
                        <Calendar size={12} />
                        {formatDate(project.updated_at)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
