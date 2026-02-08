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
import { useSessionTracker } from './hooks/useSessionTracker';
import OnboardingTour from './components/onboarding/OnboardingTour';
import { useOnboarding } from './hooks/useOnboarding';


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
      { name: 'Home', url: '/home', icon: HomeIcon },
      { name: 'DAW', url: '/daw', icon: Music },
      { name: 'Assignments', url: '/assignments', icon: FileText },
      { name: 'Progress', url: '/progress', icon: Trophy },
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

        {/* Teacher Submissions Route */}
        <Route path="/teacher/submissions" element={
          <ProtectedRoute>
            <TeacherSubmissions />
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

        {/* Teacher Worlds Settings Route */}
        <Route path="/teacher/worlds" element={
          <ProtectedRoute>
            <WorldsSettings />
          </ProtectedRoute>
        } />

        {/* Tutorials Route - for both students and teachers */}
        <Route path="/tutorials" element={
          <ProtectedRoute>
            <Tutorials />
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
        </main>
      </div>
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
