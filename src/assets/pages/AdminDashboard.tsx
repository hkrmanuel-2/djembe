import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  GraduationCap,
  Settings,
  UserPlus,
  BookOpen,
  BarChart3,
  Shield,
  ArrowLeft,
  LucideIcon
} from 'lucide-react';
import {
  getPendingApprovals,
  approveUser,
  rejectUser,
  getSchoolStatistics,
  getSchoolTeachers,
  getSchoolStudents,
  getSchoolClasses,
  getTeacherClasses,
  assignTeacherToClass,
  removeTeacherFromClass,
  createClass,
  getAccessControls,
  upsertAccessControl
} from '@/lib/adminApi';
import { Search } from 'lucide-react';

export default function AdminDashboard() {
  const { userProfile, userType } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Overview state
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalStudents: 0,
    totalClasses: 0,
    pendingApprovals: 0
  });

  // Approvals state
  const [pendingUsers, setPendingUsers] = useState([]);

  // Teachers state
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teacherClasses, setTeacherClasses] = useState([]);

  // Students state
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentSearch, setStudentSearch] = useState('');

  // Access control state
  const [accessControls, setAccessControls] = useState([]);
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState('');

  // Redirect if not admin
  useEffect(() => {
    if (userType !== 'admin') {
      navigate('/');
    }
  }, [userType, navigate]);

  // Load initial data
  useEffect(() => {
    if (userProfile?.school_id) {
      loadData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile, activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      if (activeTab === 'overview') {
        await loadStatistics();
      } else if (activeTab === 'approvals') {
        await loadPendingApprovals();
      } else if (activeTab === 'teachers') {
        await loadTeachersAndClasses();
      } else if (activeTab === 'students') {
        await loadStudentsAndClasses();
      } else if (activeTab === 'access') {
        await loadAccessControls();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    const result = await getSchoolStatistics(userProfile.school_id);
    if (result.data) {
      setStats(result.data);
    }
  };

  const loadPendingApprovals = async () => {
    const result = await getPendingApprovals(userProfile.school_id);
    if (result.data) {
      setPendingUsers(result.data);
    }
  };

  const loadTeachersAndClasses = async () => {
    const [teachersResult, classesResult] = await Promise.all([
      getSchoolTeachers(userProfile.school_id),
      getSchoolClasses(userProfile.school_id)
    ]);

    if (teachersResult.data) setTeachers(teachersResult.data);
    if (classesResult.data) setClasses(classesResult.data);
  };

  const loadStudentsAndClasses = async () => {
    const [studentsResult, classesResult] = await Promise.all([
      getSchoolStudents(userProfile.school_id),
      getSchoolClasses(userProfile.school_id)
    ]);
    if (studentsResult.data) setStudents(studentsResult.data);
    if (classesResult.data) setClasses(classesResult.data);
  };

  const loadAccessControls = async () => {
    const result = await getAccessControls(userProfile.school_id);
    if (result.data) {
      setAccessControls(result.data);
    }
  };

  const handleDeactivateUser = async (userTypeToDeactivate: string, userId: string) => {
    if (!confirm(`Are you sure you want to deactivate this ${userTypeToDeactivate}?`)) return;
    const result = await rejectUser(userTypeToDeactivate, userId, userProfile.admin_id);
    if (result.error) {
      setError(result.error.message);
    } else {
      if (activeTab === 'teachers') {
        loadTeachersAndClasses();
        setSelectedTeacher(null);
      } else if (activeTab === 'students') {
        loadStudentsAndClasses();
        setSelectedStudent(null);
      }
      loadStatistics();
    }
  };

  const handleApprove = async (userType, userId) => {
    const result = await approveUser(userType, userId, userProfile.admin_id);
    if (result.error) {
      setError(result.error.message);
    } else {
      loadPendingApprovals();
      loadStatistics();
    }
  };

  const handleReject = async (userType, userId) => {
    const result = await rejectUser(userType, userId, userProfile.admin_id);
    if (result.error) {
      setError(result.error.message);
    } else {
      loadPendingApprovals();
    }
  };

  const handleSelectTeacher = async (teacher) => {
    setSelectedTeacher(teacher);
    const result = await getTeacherClasses(teacher.teacher_id);
    if (result.data) {
      setTeacherClasses(result.data);
    }
  };

  const handleAssignClass = async (classId) => {
    if (!selectedTeacher) return;

    const result = await assignTeacherToClass(
      selectedTeacher.teacher_id,
      classId,
      userProfile.admin_id
    );

    if (result.error) {
      setError(result.error.message);
    } else {
      handleSelectTeacher(selectedTeacher);
    }
  };

  const handleRemoveClass = async (classId) => {
    if (!selectedTeacher) return;

    const result = await removeTeacherFromClass(
      selectedTeacher.teacher_id,
      classId
    );

    if (result.error) {
      setError(result.error.message);
    } else {
      handleSelectTeacher(selectedTeacher);
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();

    const result = await createClass({
      class_name: newClassName,
      grade_level: newClassGrade,
      school_id: userProfile.school_id
    });

    if (result.error) {
      setError(result.error.message);
    } else {
      setNewClassName('');
      setNewClassGrade('');
      loadTeachersAndClasses();
    }
  };

  const handleUpdateAccessControl = async (featureName, settings) => {
    const result = await upsertAccessControl(
      userProfile.school_id,
      featureName,
      settings,
      userProfile.admin_id
    );

    if (result.error) {
      setError(result.error.message);
    } else {
      loadAccessControls();
    }
  };

  if (!userProfile || userType !== 'admin') {
    return null;
  }

  return (
    <div className="flex w-full flex-col min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #3E2468 0%, #5B3D8F 50%, #7B5BA8 100%)', fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(230, 184, 77, 0.3); }
          50% { box-shadow: 0 0 40px rgba(230, 184, 77, 0.6); }
        }
      `}</style>

      {/* Fun Floating Doodles */}
      <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden hidden sm:block">
        <div className="absolute top-24 right-16 text-3xl opacity-20" style={{ animation: 'float 4s ease-in-out infinite' }}>🎓</div>
        <div className="absolute bottom-40 left-16 text-4xl opacity-25" style={{ animation: 'float 3.5s ease-in-out infinite 1s' }}>✨</div>
        <div className="absolute top-1/2 left-12 text-2xl opacity-15" style={{ animation: 'float 5s ease-in-out infinite 2s' }}>📚</div>
        <div className="absolute bottom-28 right-24 text-3xl opacity-20" style={{ animation: 'float 4.5s ease-in-out infinite 0.5s' }}>👥</div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="sticky top-0 z-40"
          style={{
            background: 'linear-gradient(135deg, rgba(62, 36, 104, 0.9) 0%, rgba(91, 61, 143, 0.9) 100%)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2" style={{ color: 'white', fontFamily: "'Fredoka', sans-serif" }}>
                  <Shield className="text-[#E6B84D]" />
                  Admin Dashboard
                </h1>
                <p className="text-white/70 text-sm mt-1">
                  {userProfile.first_name} {userProfile.last_name}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/home')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all"
                style={{
                  background: 'linear-gradient(135deg, #D97746 0%, #E6B84D 100%)',
                  color: 'white'
                }}
              >
                <ArrowLeft size={18} />
                <span className="hidden sm:inline">Back to Home</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-6 mt-6 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex gap-2 p-2 rounded-2xl"
            style={{
              background: 'linear-gradient(145deg, rgba(91,61,143,0.6) 0%, rgba(62,36,104,0.8) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'approvals', label: 'Pending Approvals', icon: Clock },
              { id: 'teachers', label: 'Manage Teachers', icon: GraduationCap },
              { id: 'students', label: 'Manage Students', icon: Users },
              { id: 'access', label: 'Access Control', icon: Settings }
            ].map((tab, index) => (
              <motion.button
                key={tab.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all font-semibold ${activeTab === tab.id
                  ? 'shadow-lg'
                  : 'hover:bg-white/10'
                  }`}
                style={activeTab === tab.id ? {
                  background: 'linear-gradient(135deg, #D97746 0%, #E6B84D 100%)',
                  color: 'white',
                  animation: 'pulse-glow 2s ease-in-out infinite'
                } : {
                  color: 'rgba(255, 255, 255, 0.7)'
                }}
              >
                <tab.icon size={18} />
                <span className="hidden sm:inline">{tab.label}</span>
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-7xl mx-auto px-6 mt-4 w-full"
            >
              <div className="border px-4 py-3 rounded-xl text-sm font-medium" style={{ backgroundColor: 'rgba(232, 98, 122, 0.1)', borderColor: 'rgba(232, 98, 122, 0.3)', color: '#E8627A' }}>
                {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-6 w-full flex-1">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-12"
              >
                <div className="text-white text-lg">Loading...</div>
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                      icon={GraduationCap}
                      label="Teachers"
                      value={stats.totalTeachers}
                      color="blue"
                      delay={0}
                      onClick={() => setActiveTab('teachers')}
                    />
                    <StatCard
                      icon={Users}
                      label="Students"
                      value={stats.totalStudents}
                      color="green"
                      delay={0.1}
                      onClick={() => setActiveTab('students')}
                    />
                    <StatCard
                      icon={BookOpen}
                      label="Classes"
                      value={stats.totalClasses}
                      color="purple"
                      delay={0.2}
                    />
                    <StatCard
                      icon={Clock}
                      label="Pending Approvals"
                      value={stats.pendingApprovals}
                      color="yellow"
                      alert={stats.pendingApprovals > 0}
                      delay={0.3}
                      onClick={() => setActiveTab('approvals')}
                    />
                  </div>
                )}

                {/* Approvals Tab */}
                {activeTab === 'approvals' && (
                  <div className="space-y-4">
                    {pendingUsers.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-2xl p-8 text-center"
                        style={{
                          background: 'linear-gradient(145deg, rgba(91,61,143,0.4) 0%, rgba(62,36,104,0.6) 100%)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                      >
                        <p className="text-white/60 text-lg">No pending approvals</p>
                      </motion.div>
                    ) : (
                      pendingUsers.map((user, index) => (
                        <motion.div
                          key={user.user_id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          whileHover={{ scale: 1.01 }}
                          className="rounded-2xl p-6 flex items-center justify-between shadow-lg"
                          style={{
                            background: 'linear-gradient(145deg, rgba(91,61,143,0.5) 0%, rgba(62,36,104,0.7) 100%)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                          }}
                        >
                          <div>
                            <h3 className="text-white font-bold text-lg" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                              {user.first_name} {user.last_name}
                            </h3>
                            <p className="text-white/60 text-sm mt-1">{user.email}</p>
                            <span className="inline-block mt-2 px-3 py-1 text-xs rounded-full font-semibold" style={{ backgroundColor: 'rgba(230, 184, 77, 0.2)', color: '#E6B84D' }}>
                              {user.user_type.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleApprove(user.user_type, user.user_id)}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-colors"
                              style={{ backgroundColor: 'rgba(74, 186, 110, 0.2)', color: '#4ABA6E' }}
                            >
                              <CheckCircle size={18} />
                              Approve
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleReject(user.user_type, user.user_id)}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-colors"
                              style={{ backgroundColor: 'rgba(232, 98, 122, 0.2)', color: '#E8627A' }}
                            >
                              <XCircle size={18} />
                              Reject
                            </motion.button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                )}

                {/* Teachers Tab */}
                {activeTab === 'teachers' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Teachers List */}
                    <div className="space-y-4">
                      <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Fredoka', sans-serif" }}>Teachers</h2>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {teachers.map((teacher, index) => (
                          <motion.button
                            key={teacher.teacher_id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSelectTeacher(teacher)}
                            className="w-full text-left p-4 rounded-xl transition-all"
                            style={selectedTeacher?.teacher_id === teacher.teacher_id ? {
                              background: 'linear-gradient(135deg, rgba(230, 184, 77, 0.2) 0%, rgba(217, 119, 70, 0.2) 100%)',
                              border: '2px solid rgba(230, 184, 77, 0.5)',
                              backdropFilter: 'blur(20px)'
                            } : {
                              background: 'linear-gradient(145deg, rgba(91,61,143,0.4) 0%, rgba(62,36,104,0.6) 100%)',
                              backdropFilter: 'blur(20px)',
                              border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-white font-semibold">
                                  {teacher.first_name} {teacher.last_name}
                                </p>
                                <p className="text-white/60 text-sm">{teacher.email}</p>
                              </div>
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => { e.stopPropagation(); handleDeactivateUser('teacher', teacher.teacher_id); }}
                                className="p-2 rounded-lg hover:bg-red-500/20 transition-colors cursor-pointer"
                                title="Deactivate teacher"
                              >
                                <XCircle size={16} className="text-red-400" />
                              </motion.div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Class Assignment */}
                    <div className="space-y-4">
                      {selectedTeacher ? (
                        <>
                          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                            Classes for {selectedTeacher.first_name}
                          </h2>

                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-2xl p-4 space-y-2"
                            style={{
                              background: 'linear-gradient(145deg, rgba(91,61,143,0.5) 0%, rgba(62,36,104,0.7) 100%)',
                              backdropFilter: 'blur(20px)',
                              border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                          >
                            <h3 className="text-white font-semibold mb-2">Assigned Classes</h3>
                            {teacherClasses.length === 0 ? (
                              <p className="text-white/60 text-sm">No classes assigned</p>
                            ) : (
                              teacherClasses.map((assignment) => (
                                <motion.div
                                  key={assignment.assignment_id}
                                  initial={{ opacity: 0, x: 10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  whileHover={{ scale: 1.02 }}
                                  className="flex items-center justify-between p-3 rounded-lg"
                                  style={{
                                    background: 'rgba(62, 36, 104, 0.6)',
                                    border: '1px solid rgba(255, 255, 255, 0.05)'
                                  }}
                                >
                                  <span className="text-white">
                                    {assignment.classes.class_name}
                                  </span>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleRemoveClass(assignment.class_id)}
                                    className="text-red-400 hover:text-red-300"
                                  >
                                    <XCircle size={18} />
                                  </motion.button>
                                </motion.div>
                              ))
                            )}
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="rounded-2xl p-4 space-y-2"
                            style={{
                              background: 'linear-gradient(145deg, rgba(91,61,143,0.5) 0%, rgba(62,36,104,0.7) 100%)',
                              backdropFilter: 'blur(20px)',
                              border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                          >
                            <h3 className="text-white font-semibold mb-2">Available Classes</h3>
                            {classes
                              .filter((cls) => !teacherClasses.some((tc) => tc.class_id === cls.class_id))
                              .map((cls) => (
                                <motion.button
                                  key={cls.class_id}
                                  whileHover={{ scale: 1.02, x: 5 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => handleAssignClass(cls.class_id)}
                                  className="w-full text-left p-3 rounded-lg flex items-center justify-between group transition-all"
                                  style={{
                                    background: 'rgba(62, 36, 104, 0.6)',
                                    border: '1px solid rgba(255, 255, 255, 0.05)'
                                  }}
                                >
                                  <span className="text-white">{cls.class_name}</span>
                                  <UserPlus size={18} className="text-white/40 group-hover:text-white/80 transition-colors" />
                                </motion.button>
                              ))}
                          </motion.div>

                          <motion.form
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            onSubmit={handleCreateClass}
                            className="rounded-2xl p-4 space-y-3"
                            style={{
                              background: 'linear-gradient(145deg, rgba(91,61,143,0.5) 0%, rgba(62,36,104,0.7) 100%)',
                              backdropFilter: 'blur(20px)',
                              border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                          >
                            <h3 className="text-white font-semibold">Create New Class</h3>
                            <input
                              type="text"
                              placeholder="Class Name"
                              value={newClassName}
                              onChange={(e) => setNewClassName(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl text-white transition-all focus:outline-none placeholder:text-gray-300"
                              style={{
                                background: 'rgba(62, 36, 104, 0.6)',
                                border: '2px solid rgba(255, 255, 255, 0.1)',
                                borderColor: 'rgba(255, 255, 255, 0.1)'
                              }}
                              onFocus={(e) => e.target.style.borderColor = 'rgba(230, 184, 77, 0.5)'}
                              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                              required
                            />
                            <input
                              type="text"
                              placeholder="Grade Level"
                              value={newClassGrade}
                              onChange={(e) => setNewClassGrade(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl text-white transition-all focus:outline-none placeholder:text-gray-300"
                              style={{
                                background: 'rgba(62, 36, 104, 0.6)',
                                border: '2px solid rgba(255, 255, 255, 0.1)'
                              }}
                              onFocus={(e) => e.target.style.borderColor = 'rgba(230, 184, 77, 0.5)'}
                              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                            />
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              type="submit"
                              className="w-full px-4 py-3 rounded-xl font-semibold text-white transition-all"
                              style={{
                                background: 'linear-gradient(135deg, #D97746 0%, #E6B84D 100%)'
                              }}
                            >
                              Create Class
                            </motion.button>
                          </motion.form>
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-full text-white/60">
                          Select a teacher to manage their classes
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Students Tab */}
                {activeTab === 'students' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Students List */}
                    <div className="space-y-4">
                      <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Fredoka', sans-serif" }}>Students</h2>
                      <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                        <input
                          type="text"
                          placeholder="Search students..."
                          value={studentSearch}
                          onChange={(e) => setStudentSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl text-white transition-all focus:outline-none placeholder:text-white/40"
                          style={{
                            background: 'rgba(62, 36, 104, 0.6)',
                            border: '2px solid rgba(255, 255, 255, 0.1)',
                          }}
                          onFocus={(e) => e.target.style.borderColor = 'rgba(230, 184, 77, 0.5)'}
                          onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                        />
                      </div>
                      <div className="space-y-2 max-h-[28rem] overflow-y-auto">
                        {students
                          .filter((s: any) => {
                            if (!studentSearch) return true;
                            const q = studentSearch.toLowerCase();
                            return (
                              s.first_name?.toLowerCase().includes(q) ||
                              s.last_name?.toLowerCase().includes(q) ||
                              s.email?.toLowerCase().includes(q)
                            );
                          })
                          .map((student: any, index: number) => {
                            const studentClass = classes.find((c: any) => c.class_id === student.class_id);
                            return (
                              <motion.button
                                key={student.student_id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedStudent(student)}
                                className="w-full text-left p-4 rounded-xl transition-all"
                                style={(selectedStudent as any)?.student_id === student.student_id ? {
                                  background: 'linear-gradient(135deg, rgba(230, 184, 77, 0.2) 0%, rgba(217, 119, 70, 0.2) 100%)',
                                  border: '2px solid rgba(230, 184, 77, 0.5)',
                                  backdropFilter: 'blur(20px)'
                                } : {
                                  background: 'linear-gradient(145deg, rgba(91,61,143,0.4) 0%, rgba(62,36,104,0.6) 100%)',
                                  backdropFilter: 'blur(20px)',
                                  border: '1px solid rgba(255, 255, 255, 0.1)'
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-white font-semibold">
                                      {student.first_name} {student.last_name}
                                    </p>
                                    <p className="text-white/60 text-sm">{student.email}</p>
                                    {studentClass && (
                                      <p className="text-white/40 text-xs mt-1">{(studentClass as any).class_name}</p>
                                    )}
                                  </div>
                                  <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => { e.stopPropagation(); handleDeactivateUser('student', student.student_id); }}
                                    className="p-2 rounded-lg hover:bg-red-500/20 transition-colors cursor-pointer"
                                    title="Deactivate student"
                                  >
                                    <XCircle size={16} className="text-red-400" />
                                  </motion.div>
                                </div>
                              </motion.button>
                            );
                          })}
                        {students.length === 0 && (
                          <p className="text-white/60 text-center py-8">No students found</p>
                        )}
                      </div>
                    </div>

                    {/* Student Details */}
                    <div className="space-y-4">
                      {selectedStudent ? (
                        <>
                          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                            {(selectedStudent as any).first_name} {(selectedStudent as any).last_name}
                          </h2>

                          {/* Student Info Card */}
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-2xl p-5 space-y-3"
                            style={{
                              background: 'linear-gradient(145deg, rgba(91,61,143,0.5) 0%, rgba(62,36,104,0.7) 100%)',
                              backdropFilter: 'blur(20px)',
                              border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                          >
                            <h3 className="text-white font-semibold mb-3">Student Info</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-white/60">Email</span>
                                <span className="text-white">{(selectedStudent as any).email}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/60">Current Class</span>
                                <span className="text-white">
                                  {classes.find((c: any) => c.class_id === (selectedStudent as any).class_id)
                                    ? (classes.find((c: any) => c.class_id === (selectedStudent as any).class_id) as any).class_name
                                    : 'No class assigned'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/60">Status</span>
                                <span className="text-green-400">{(selectedStudent as any).approval_status}</span>
                              </div>
                            </div>
                          </motion.div>

                          {/* Change Class */}
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="rounded-2xl p-5 space-y-3"
                            style={{
                              background: 'linear-gradient(145deg, rgba(91,61,143,0.5) 0%, rgba(62,36,104,0.7) 100%)',
                              backdropFilter: 'blur(20px)',
                              border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                          >
                            <h3 className="text-white font-semibold mb-2">Assign to Class</h3>
                            <div className="space-y-2">
                              {classes.map((cls: any) => {
                                const isCurrentClass = cls.class_id === (selectedStudent as any).class_id;
                                return (
                                  <motion.button
                                    key={cls.class_id}
                                    whileHover={{ scale: 1.02, x: 5 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={isCurrentClass}
                                    onClick={async () => {
                                      // Update student's class_id directly
                                      const { supabase } = await import('@/lib/supabase');
                                      await supabase
                                        .from('students')
                                        .update({ class_id: cls.class_id })
                                        .eq('student_id', (selectedStudent as any).student_id);
                                      // Refresh
                                      const result = await getSchoolStudents(userProfile.school_id);
                                      if (result.data) {
                                        setStudents(result.data);
                                        const updated = result.data.find((s: any) => s.student_id === (selectedStudent as any).student_id);
                                        if (updated) setSelectedStudent(updated);
                                      }
                                    }}
                                    className="w-full text-left p-3 rounded-lg flex items-center justify-between group transition-all"
                                    style={{
                                      background: isCurrentClass ? 'rgba(74, 186, 110, 0.15)' : 'rgba(62, 36, 104, 0.6)',
                                      border: isCurrentClass ? '1px solid rgba(74, 186, 110, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
                                      opacity: isCurrentClass ? 0.7 : 1
                                    }}
                                  >
                                    <span className="text-white">{cls.class_name}</span>
                                    {isCurrentClass ? (
                                      <CheckCircle size={16} className="text-green-400" />
                                    ) : (
                                      <UserPlus size={16} className="text-white/40 group-hover:text-white/80 transition-colors" />
                                    )}
                                  </motion.button>
                                );
                              })}
                            </div>
                          </motion.div>

                          {/* Deactivate */}
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleDeactivateUser('student', (selectedStudent as any).student_id)}
                              className="w-full px-4 py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2"
                              style={{
                                background: 'rgba(232, 98, 122, 0.15)',
                                border: '2px solid rgba(232, 98, 122, 0.3)',
                                color: '#E8627A'
                              }}
                            >
                              <XCircle size={18} />
                              Deactivate Student
                            </motion.button>
                          </motion.div>
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-full text-white/60">
                          Select a student to view details
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Access Control Tab */}
                {activeTab === 'access' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="rounded-2xl p-6 space-y-4" style={{
                      background: 'linear-gradient(145deg, rgba(91,61,143,0.5) 0%, rgba(62,36,104,0.7) 100%)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <h2 className="text-xl font-bold text-white mb-4" style={{ fontFamily: "'Fredoka', sans-serif" }}>Access Control Settings</h2>

                      <AccessControlToggle
                        label="Allow Student Signup"
                        description="Students can self-register for accounts"
                        value={accessControls.find((ac) => ac.feature_name === 'student_signup')?.allow_student_signup ?? true}
                        onChange={(value) => handleUpdateAccessControl('student_signup', { allow_student_signup: value, is_enabled: true })}
                        delay={0}
                      />

                      <AccessControlToggle
                        label="Allow Teacher Signup"
                        description="Teachers can self-register for accounts"
                        value={accessControls.find((ac) => ac.feature_name === 'teacher_signup')?.allow_teacher_signup ?? true}
                        onChange={(value) => handleUpdateAccessControl('teacher_signup', { allow_teacher_signup: value, is_enabled: true })}
                        delay={0.1}
                      />

                      <AccessControlToggle
                        label="Require Admin Approval"
                        description="All new signups must be approved by an administrator"
                        value={accessControls.find((ac) => ac.feature_name === 'approval_required')?.require_admin_approval ?? false}
                        onChange={(value) => handleUpdateAccessControl('approval_required', { require_admin_approval: value, is_enabled: true })}
                        delay={0.2}
                      />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Helper Components
interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  color: 'blue' | 'green' | 'purple' | 'yellow';
  alert?: boolean;
  delay: number;
  onClick?: () => void;
}

function StatCard({ icon: Icon, label, value, color, alert, delay, onClick }: StatCardProps) {
  const colors = {
    blue: { from: 'rgba(66, 153, 225, 0.2)', to: 'rgba(49, 130, 206, 0.2)', border: 'rgba(66, 153, 225, 0.3)' },
    green: { from: 'rgba(74, 186, 110, 0.2)', to: 'rgba(56, 161, 105, 0.2)', border: 'rgba(74, 186, 110, 0.3)' },
    purple: { from: 'rgba(155, 125, 200, 0.2)', to: 'rgba(128, 90, 213, 0.2)', border: 'rgba(155, 125, 200, 0.3)' },
    yellow: { from: 'rgba(230, 184, 77, 0.2)', to: 'rgba(217, 119, 70, 0.2)', border: 'rgba(230, 184, 77, 0.3)' }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ scale: 1.05, y: -5 }}
      onClick={onClick}
      className={`rounded-2xl p-6 shadow-lg ${alert ? 'animate-pulse' : ''} ${onClick ? 'cursor-pointer' : ''}`}
      style={{
        background: `linear-gradient(135deg, ${colors[color].from} 0%, ${colors[color].to} 100%)`,
        border: `2px solid ${colors[color].border}`,
        backdropFilter: 'blur(20px)'
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon size={28} className="text-white/90" />
        {alert && <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>}
      </div>
      <div className="text-4xl font-bold text-white mb-1" style={{ fontFamily: "'Fredoka', sans-serif" }}>{value}</div>
      <div className="text-white/70 text-sm font-medium">{label}</div>
    </motion.div>
  );
}

interface AccessControlToggleProps {
  label: string;
  description: string;
  value: boolean;
  onChange: (checked: boolean) => void;
  delay: number;
}

function AccessControlToggle({ label, description, value, onChange, delay }: AccessControlToggleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
      className="flex items-center justify-between p-4 rounded-xl"
      style={{
        background: 'rgba(62, 36, 104, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}
    >
      <div>
        <h3 className="text-white font-semibold">{label}</h3>
        <p className="text-white/60 text-sm">{description}</p>
      </div>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => onChange(!value)}
        className={`relative w-14 h-7 rounded-full transition-colors shadow-inner ${value ? 'bg-green-500' : 'bg-white/20'
          }`}
      >
        <motion.div
          animate={{ x: value ? 28 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg"
        />
      </motion.button>
    </motion.div>
  );
}
