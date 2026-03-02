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
import { LoadingProvider } from './contexts/LoadingContext';
import { Sidebar } from './components/ui/Sidebar';
import { Home as HomeIcon, Music, FileText, Globe, Settings as SettingsIcon, Trophy, Users, TrendingUp, FolderOpen, FileCheck, GraduationCap } from 'lucide-react';
import TeacherAssignments from './assets/pages/teacher/TeacherAssignments';
import TeacherSubmissions from './assets/pages/TeacherSubmissions';
import Tutorials from './assets/pages/Tutorials';
import StudentDifficulties from './assets/pages/teacher/StudentDifficulties';
import StudentProjects from './assets/pages/teacher/StudentProjects';
import WorldsSettings from './assets/pages/teacher/WorldsSettings';
import AdminDashboard from './assets/pages/AdminDashboard';
import { useSessionTracker } from './hooks/useSessionTracker';
import OnboardingTour from './components/onboarding/OnboardingTour';
import { useOnboarding } from './hooks/useOnboarding';
import { ErrorBoundary } from './components/ErrorBoundary';


function AppContent() {
  const { initAuth, isAuthenticated, signOut, userProfile, userType } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { hasSeenOnboarding, markComplete } = useOnboarding();
  const [showOnboarding, setShowOnboarding] = React.useState(false);

  // Track active session time for students
  useSessionTracker();

  // Routes where navbar should be hidden (immersive experiences)
  const hideNavbarRoutes = ['/daw', '/world1', '/world2'];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Check if user should see onboarding
  useEffect(() => {
    if (isAuthenticated && userType && !hasSeenOnboarding()) {
      // Delay to ensure page is fully loaded
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, userType, hasSeenOnboarding]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Navigation items for authenticated users - different for students vs teachers
  const navItems = isAuthenticated ? (
    userType === 'teacher' ? [
      // Teacher navigation
      { name: 'Students', url: '/students', icon: Users },
      { name: 'Assignments', url: '/teacher/assignments', icon: FileText },
      { name: 'Submissions', url: '/teacher/submissions', icon: FileCheck },
      { name: 'Analytics', url: '/teacher/analytics', icon: TrendingUp },
      { name: 'Projects', url: '/teacher/projects', icon: FolderOpen },
      { name: 'Tutorials', url: '/tutorials', icon: GraduationCap },
      { name: 'Worlds', url: '/teacher/worlds', icon: Globe },
      { name: 'Settings', url: '/settings', icon: SettingsIcon },
    ] : [
      // Student navigation
      { name: 'Dashboard', url: '/home', icon: HomeIcon },
      { name: 'Music Studio', url: '/daw', icon: Music },
      { name: 'Challenges', url: '/assignments', icon: FileText },
      { name: 'My Journey', url: '/progress', icon: Trophy },
      { name: 'Tutorials', url: '/tutorials', icon: GraduationCap },
      { name: 'Worlds', url: '/world1', icon: Globe },
      { name: 'Settings', url: '/settings', icon: SettingsIcon },
    ]
  ) : [];

  const handleOnboardingComplete = () => {
    markComplete();
    setShowOnboarding(false);
  };

  return (
    <div className="App">
      {/* Onboarding Tour */}
      {showOnboarding && userType && (
        <OnboardingTour
          userType={userType}
          onComplete={handleOnboardingComplete}
        />
      )}

      <div className="flex min-h-screen">
        {/* Sidebar Navigation - Hidden on immersive pages */}
        {isAuthenticated && !shouldHideNavbar && (
          <Sidebar
            items={navItems}
            userProfile={userProfile}
            onSignOut={handleSignOut}
          />
        )}

        {/* Main Content */}
        <main
          className={`flex-1 min-w-0 ${isAuthenticated && !shouldHideNavbar ? 'ml-[60px] md:ml-[220px]' : ''}`}
        >
          <Routes>
            {/* Landing page - public route */}
            <Route path="/" element={
              isAuthenticated ? (
                <Navigate to={
                  userType === 'admin' ? '/admin' :
                    userType === 'teacher' ? '/students' :
                      '/home'
                } replace />
              ) : <Landing_page />
            } />
            <Route path="/login" element={
              isAuthenticated ? (
                <Navigate to={
                  userType === 'admin' ? '/admin' :
                    userType === 'teacher' ? '/students' :
                      '/home'
                } replace />
              ) : <Login />
            } />
            <Route path="/signup" element={
              isAuthenticated ? (
                <Navigate to={
                  userType === 'admin' ? '/admin' :
                    userType === 'teacher' ? '/students' :
                      '/home'
                } replace />
              ) : <Signup />
            } />
            {/* Student Routes */}
            <Route path="/home" element={
              <ProtectedRoute allowedRoles={['student']}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/daw" element={
              <ProtectedRoute allowedRoles={['student']}>
                <DAWLite />
              </ProtectedRoute>
            } />
            <Route path="/assignments" element={
              <ProtectedRoute allowedRoles={['student']}>
                <Assignments />
              </ProtectedRoute>
            } />
            <Route path="/progress" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentProgress />
              </ProtectedRoute>
            } />
            <Route path="/world1" element={
              <ProtectedRoute allowedRoles={['student']}>
                <World1 />
              </ProtectedRoute>
            } />
            <Route path="/world2" element={
              <ProtectedRoute allowedRoles={['student']}>
                <World2 />
              </ProtectedRoute>
            } />

            {/* Teacher Routes */}
            <Route path="/students" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherDashboard />
              </ProtectedRoute>
            } />
            <Route path="/teacher/assignments" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherAssignments />
              </ProtectedRoute>
            } />
            <Route path="/teacher/submissions" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherSubmissions />
              </ProtectedRoute>
            } />
            <Route path="/teacher/analytics" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <StudentDifficulties />
              </ProtectedRoute>
            } />
            <Route path="/teacher/projects" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <StudentProjects />
              </ProtectedRoute>
            } />
            <Route path="/teacher/worlds" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <WorldsSettings />
              </ProtectedRoute>
            } />

            {/* Admin Route */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* Shared Routes (student + teacher) */}
            <Route path="/tutorials" element={
              <ProtectedRoute allowedRoles={['student', 'teacher']}>
                <Tutorials />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute allowedRoles={['student', 'teacher']}>
                <Settings />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <LoadingProvider>
          <AppContent />
        </LoadingProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
