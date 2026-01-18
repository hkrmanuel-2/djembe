import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import DAWLite from './assets/pages/DAW-Lite/DAWLite';
import Home from './assets/pages/Home';
import Login from './assets/pages/Auth/Login';
import Signup from './assets/pages/Auth/Signup';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuthStore } from './store/useAuthStore';
import { Button } from './components/ui/button';
import World1 from './components/Worlds/World1';
import World2 from './components/Worlds/World2';
import Assignments from './assets/pages/Assignments';
import { LoadingProvider, useLoading } from './contexts/LoadingContext';
import CubeLoaderDark from './components/ui/cube-loader-dark';
import { NavBarDark } from './components/ui/tubelight-navbar-dark';
import { Home as HomeIcon, Music, FileText, Globe, LogOut, User } from 'lucide-react';

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

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  // Navigation items for authenticated users
  const navItems = isAuthenticated ? [
    { name: 'Home', url: '/', icon: HomeIcon },
    { name: 'DAW', url: '/daw', icon: Music },
    ...(userType === 'student' ? [{ name: 'Assignments', url: '/assignments', icon: FileText }] : []),
    { name: 'Worlds', url: '/world1', icon: Globe },
  ] : [];

  return (
    <div className="App">
      <LoadingOverlay />

      {/* Dark Tubelight Navigation */}
      {isAuthenticated && <NavBarDark items={navItems} />}

      {/* User Profile & Sign Out */}
      {isAuthenticated && userProfile && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
          <div className="flex items-center gap-2 text-white/80">
            <User size={16} strokeWidth={2} />
            <span className="text-sm font-medium">
              {userProfile.first_name}
            </span>
          </div>
          <div className="w-px h-4 bg-white/20" />
          <button
            onClick={handleSignOut}
            className="text-white/60 hover:text-white transition-colors"
            title="Sign Out"
          >
            <LogOut size={16} strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Routes */}
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" replace /> : <Login />
        } />
        <Route path="/signup" element={
          isAuthenticated ? <Navigate to="/" replace /> : <Signup />
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
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
