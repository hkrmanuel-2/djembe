import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";
import CubeLoader from "@/components/ui/cube-loader";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, initAuth } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      initAuth();
    }
  }, [isAuthenticated, isLoading, initAuth]);

  if (isLoading) {
    return (
      <CubeLoader 
        message="Getting Ready"
        subMessage="Setting up your adventure..."
        className="min-h-screen"
      />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}