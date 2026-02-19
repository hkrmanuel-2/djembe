import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, initAuth } = useAuthStore();

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

  return <>{children}</>;
}