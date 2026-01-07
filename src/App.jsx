import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import DAWLite from './assets/pages/DAW-Lite/DAWLite';
import Home from './assets/pages/Home';
import Login from './assets/pages/Auth/Login';
import Signup from './assets/pages/Auth/Signup';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuthStore } from './store/useAuthStore';
import { Button } from './components/ui/button';
import World1 from './components/Worlds/World1';
import World2 from './components/Worlds/World2'; // new World2 component

function App() {
  const { initAuth, isAuthenticated, signOut, userProfile, userType } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Router>
      <div className="App">
        {/* Navigation */}
        <nav className="bg-gray-800 text-white p-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <Link to="/" className="px-4 hover:text-blue-300">Home</Link>
              {isAuthenticated && (
                <>
                  <Link to="/daw" className="px-4 hover:text-blue-300">DAW-LITE</Link>
                  {userType === 'teacher' && (
                    <Link to="/admin" className="px-4 hover:text-blue-300">Admin</Link>
                  )}
                  <Link to="/world1" className="px-4 hover:text-blue-300">World 1</Link>
                  <Link to="/world2" className="px-4 hover:text-blue-300">World 2</Link>
                </>
              )}
            </div>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <span className="text-sm">
                    {userProfile?.first_name} {userProfile?.last_name} ({userType})
                  </span>
                  <Button
                    variant="outline"
                    onClick={handleSignOut}
                    className="text-white border-white hover:bg-gray-700"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-4 hover:text-blue-300">Login</Link>
                  <Link to="/signup" className="px-4 hover:text-blue-300">Sign Up</Link>
                </>
              )}
            </div>
          </div>
        </nav>

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
    </Router>
  );
}

export default App;
