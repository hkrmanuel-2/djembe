import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import DAWLite from './assets/pages/DAW-Lite/DAWLite';
import Dashboard from './assets/pages/Dashboard';
import Landing_page from './assets/pages/Landing_page';
import Settings from './assets/pages/Settings';
import Login from './assets/pages/Auth/Login';
import Signup from './assets/pages/Auth/Signup';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuthStore } from './store/useAuthStore';
import { Button } from './components/ui/button';
import World1 from './components/Worlds/World1';
import World2 from './components/Worlds/World2';
import Assignments from './assets/pages/Assignments';
import StudentProgress from './assets/pages/StudentProgress';
import TeacherDashboard from './assets/pages/TeacherDashboard';
import { LoadingProvider, useLoading } from './contexts/LoadingContext';
import CubeLoaderDark from './components/ui/cube-loader-dark';
import { NavBarDark } from './components/ui/tubelight-navbar-dark';
import { Home as HomeIcon, Music, FileText, Globe, LogOut, User, Settings as SettingsIcon, Trophy, Users, TrendingUp, FolderOpen } from 'lucide-react';
import TeacherAssignments from './assets/pages/teacher/TeacherAssignments';
import StudentDifficulties from './assets/pages/teacher/StudentDifficulties';
import StudentProjects from './assets/pages/teacher/StudentProjects';
import { useSessionTracker } from './hooks/useSessionTracker';

function LoadingOverlay() {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      <CubeLoaderDark
        message="Loading"
        subMessage="Taking you somewhere awesome!"
      />
    </div>
  );
}

function AppContent() {
  const { initAuth, isAuthenticated, signOut, userProfile, userType } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Track active session time for students
  useSessionTracker();

  // Routes where navbar should be hidden (immersive experiences)
  const hideNavbarRoutes = ['/daw', '/world1', '/world2'];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Navigation items for authenticated users - different for students vs teachers
  const navItems = isAuthenticated ? (
    userType === 'teacher' ? [
      // Teacher navigation - no Home, DAW, or Worlds
      { name: 'Students', url: '/students', icon: Users },
      { name: 'Assignments', url: '/teacher/assignments', icon: FileText },
      { name: 'Analytics', url: '/teacher/analytics', icon: TrendingUp },
      { name: 'Projects', url: '/teacher/projects', icon: FolderOpen },
      { name: 'Settings', url: '/settings', icon: SettingsIcon },
    ] : [
      // Student navigation
      { name: 'Home', url: '/home', icon: HomeIcon },
      { name: 'DAW', url: '/daw', icon: Music },
      { name: 'Assignments', url: '/assignments', icon: FileText },
      { name: 'Progress', url: '/progress', icon: Trophy },
      { name: 'Worlds', url: '/world1', icon: Globe },
      { name: 'Settings', url: '/settings', icon: SettingsIcon },
    ]
  ) : [];

  return (
    <div className="App">
      <LoadingOverlay />

      {/* Dark Tubelight Navigation - Hidden on immersive pages */}
      {isAuthenticated && !shouldHideNavbar && <NavBarDark items={navItems} />}

      {/* User Profile & Sign Out - Hidden on immersive pages */}
      {isAuthenticated && userProfile && !shouldHideNavbar && (
        <div
          className="fixed top-6 right-6 z-50 flex items-center gap-2 backdrop-blur-md px-4 py-2 rounded-full border"
          style={{
            backgroundColor: 'rgba(26, 43, 74, 0.6)',
            borderColor: 'rgba(255, 255, 255, 0.15)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
          }}
        >
          <div className="flex items-center gap-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            <User size={16} strokeWidth={2} />
            <span className="text-sm font-medium" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {userProfile.first_name}
            </span>
          </div>
          <div className="w-px h-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
          <button
            onClick={handleSignOut}
            className="transition-colors hover:opacity-80"
            style={{ color: '#E6B84D' }}
            title="Sign Out"
          >
            <LogOut size={16} strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Routes */}
      <Routes>
        {/* Landing page - public route */}
        <Route path="/" element={
          isAuthenticated ? <Navigate to={userType === 'teacher' ? '/students' : '/home'} replace /> : <Landing_page />
        } />
        <Route path="/login" element={
          isAuthenticated ? <Navigate to={userType === 'teacher' ? '/students' : '/home'} replace /> : <Login />
        } />
        <Route path="/signup" element={
          isAuthenticated ? <Navigate to={userType === 'teacher' ? '/students' : '/home'} replace /> : <Signup />
        } />
        <Route path="/home" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/daw" element={
          <ProtectedRoute>
            <DAWLite />
          </ProtectedRoute>
        } />

        {/* Assignments Route */}
        <Route path="/assignments" element={
          <ProtectedRoute>
            <Assignments />
          </ProtectedRoute>
        } />

        {/* Student Progress Route */}
        <Route path="/progress" element={
          <ProtectedRoute>
            <StudentProgress />
          </ProtectedRoute>
        } />

        {/* Teacher Dashboard Route */}
        <Route path="/students" element={
          <ProtectedRoute>
            <TeacherDashboard />
          </ProtectedRoute>
        } />

        {/* Teacher Assignments Route */}
        <Route path="/teacher/assignments" element={
          <ProtectedRoute>
            <TeacherAssignments />
          </ProtectedRoute>
        } />

        {/* Teacher Analytics Route */}
        <Route path="/teacher/analytics" element={
          <ProtectedRoute>
            <StudentDifficulties />
          </ProtectedRoute>
        } />

        {/* Teacher Projects Route */}
        <Route path="/teacher/projects" element={
          <ProtectedRoute>
            <StudentProjects />
          </ProtectedRoute>
        } />

        {/* Settings Route */}
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />

        {/* Worlds Routes */}
        <Route path="/world1" element={
          <ProtectedRoute>
            <World1 />
          </ProtectedRoute>
        } />
        <Route path="/world2" element={
          <ProtectedRoute>
            <World2 />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <LoadingProvider>
        <AppContent />
      </LoadingProvider>
    </Router>
  );
}

export default App;
