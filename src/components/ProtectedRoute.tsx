import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("admin" | "teacher" | "student")[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, initAuth, userType } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      initAuth();
    }
  }, [isAuthenticated, isLoading, initAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4 border-purple-200 border-t-orange-500" />
          <div className="text-lg font-semibold text-gray-700">Getting Ready</div>
          <div className="text-sm text-gray-500 mt-1">Setting up your adventure...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role-based access control
  if (allowedRoles && userType && !allowedRoles.includes(userType as "admin" | "teacher" | "student")) {
    // Redirect to the user's appropriate home page
    const homeRoute =
      userType === "admin" ? "/admin" :
      userType === "teacher" ? "/students" :
      "/home";
    return <Navigate to={homeRoute} replace />;
  }

  return <>{children}</>;
}