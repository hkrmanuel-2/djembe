import { useAuthStore } from "@/store/useAuthStore";

const ONBOARDING_KEY = "djembe_onboarding_completed";

/**
 * Custom hook for managing onboarding state
 * Uses localStorage for device-specific tracking
 */
export function useOnboarding() {
  const { userType } = useAuthStore();

  const hasSeenOnboarding = (): boolean => {
    if (!userType) return true; // Don't show if no user type
    const key = `${ONBOARDING_KEY}_${userType}`;
    return localStorage.getItem(key) === "true";
  };

  const markComplete = (): void => {
    if (!userType) return;
    const key = `${ONBOARDING_KEY}_${userType}`;
    localStorage.setItem(key, "true");
  };

  const reset = (): void => {
    if (!userType) return;
    const key = `${ONBOARDING_KEY}_${userType}`;
    localStorage.removeItem(key);
  };

  return {
    hasSeenOnboarding,
    markComplete,
    reset,
  };
}
