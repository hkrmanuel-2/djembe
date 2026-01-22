import { useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useProgressStore } from "../store/useProgressStore";
import { supabase } from "../lib/supabase";

// Configuration
const IDLE_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutes of inactivity = idle
const SAVE_INTERVAL_MS = 60 * 1000; // Save every 1 minute
const XP_INTERVAL_MINUTES = 10; // Award XP every 10 minutes
const XP_PER_INTERVAL = 5; // 5 XP per 10 minutes
const DAILY_TIME_CAP_MINUTES = 60; // Max 60 min/day count for XP (30 XP/day max from time)

/**
 * Session Tracker Hook
 * Tracks active time on the platform (excluding idle time)
 * Awards XP sensibly: 5 XP per 10 minutes, capped at 60 min/day
 */
export function useSessionTracker() {
  const { userProfile, userType, isAuthenticated } = useAuthStore();
  const { progress, awardXP } = useProgressStore();

  // Refs to persist across renders
  const sessionStartRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const activeTimeRef = useRef(0); // Active time in current session (ms)
  const savedTimeRef = useRef(0); // Time already saved to DB this session
  const lastXPAwardTimeRef = useRef(0); // Track when we last awarded time XP
  const isIdleRef = useRef(false);
  const saveIntervalRef = useRef(null);

  const studentId = userProfile?.student_id;
  const isStudent = userType === "student" && isAuthenticated && studentId;

  // Get today's date string
  const getToday = () => new Date().toISOString().split("T")[0];

  // Handle user activity (mouse, keyboard, touch, scroll)
  const handleActivity = useCallback(() => {
    const now = Date.now();
    const wasIdle = isIdleRef.current;

    if (wasIdle) {
      // User became active again after being idle
      isIdleRef.current = false;
    }

    lastActivityRef.current = now;
  }, []);

  // Check if user has gone idle
  const checkIdle = useCallback(() => {
    const now = Date.now();
    const timeSinceActivity = now - lastActivityRef.current;

    if (timeSinceActivity > IDLE_THRESHOLD_MS && !isIdleRef.current) {
      isIdleRef.current = true;
    }

    // Only count time if not idle
    if (!isIdleRef.current && sessionStartRef.current) {
      // Add 1 second of active time
      activeTimeRef.current += 1000;
    }
  }, []);

  // Save active time to database
  const saveActiveTime = useCallback(async () => {
    if (!isStudent) return;

    const activeTimeMs = activeTimeRef.current;
    const newTimeMs = activeTimeMs - savedTimeRef.current;

    if (newTimeMs < 30000) return; // Only save if at least 30 seconds new time

    const newTimeMinutes = Math.floor(newTimeMs / 60000);
    if (newTimeMinutes <= 0) return;

    const today = getToday();

    try {
      // Get current daily time
      const { data: dailyActivity } = await supabase
        .from("daily_activity")
        .select("daw_time_minutes")
        .eq("student_id", studentId)
        .eq("activity_date", today)
        .single();

      const currentDailyMinutes = dailyActivity?.daw_time_minutes || 0;
      const newDailyMinutes = currentDailyMinutes + newTimeMinutes;

      // Update daily activity
      await supabase
        .from("daily_activity")
        .upsert(
          {
            student_id: studentId,
            activity_date: today,
            daw_time_minutes: newDailyMinutes,
          },
          { onConflict: "student_id,activity_date" }
        );

      // Update total time in progress
      const currentTotalMinutes = progress?.total_time_minutes || 0;
      await supabase
        .from("student_progress")
        .update({
          total_time_minutes: currentTotalMinutes + newTimeMinutes,
          last_activity_date: today,
          updated_at: new Date().toISOString(),
        })
        .eq("student_id", studentId);

      savedTimeRef.current = activeTimeMs;

      // Check if we should award XP (every 10 minutes, capped at 60 min/day)
      const totalActiveMinutes = Math.floor(activeTimeMs / 60000);
      const lastXPMinutes = Math.floor(lastXPAwardTimeRef.current / 60000);
      const minutesSinceLastXP = totalActiveMinutes - lastXPMinutes;

      if (minutesSinceLastXP >= XP_INTERVAL_MINUTES) {
        // Check daily cap
        if (currentDailyMinutes < DAILY_TIME_CAP_MINUTES) {
          // Calculate how many intervals we can award (respecting cap)
          const intervalsEarned = Math.floor(minutesSinceLastXP / XP_INTERVAL_MINUTES);
          const minutesToAward = intervalsEarned * XP_INTERVAL_MINUTES;
          const cappedMinutes = Math.min(
            minutesToAward,
            DAILY_TIME_CAP_MINUTES - currentDailyMinutes
          );
          const xpIntervals = Math.floor(cappedMinutes / XP_INTERVAL_MINUTES);

          if (xpIntervals > 0) {
            const xpToAward = xpIntervals * XP_PER_INTERVAL;
            await awardXP(studentId, "active_time", xpToAward, null, {
              description: `${xpIntervals * XP_INTERVAL_MINUTES} minutes of active learning`,
              minutes: xpIntervals * XP_INTERVAL_MINUTES,
            });
          }

          lastXPAwardTimeRef.current = totalActiveMinutes * 60000;
        }
      }
    } catch (error) {
      console.error("Error saving active time:", error);
    }
  }, [isStudent, studentId, progress?.total_time_minutes, awardXP]);

  // Initialize session tracking
  useEffect(() => {
    if (!isStudent) return;

    // Start session
    sessionStartRef.current = Date.now();
    lastActivityRef.current = Date.now();
    activeTimeRef.current = 0;
    savedTimeRef.current = 0;
    lastXPAwardTimeRef.current = 0;
    isIdleRef.current = false;

    // Activity event listeners
    const events = ["mousedown", "mousemove", "keydown", "touchstart", "scroll", "click"];
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Check idle status every second
    const idleCheckInterval = setInterval(checkIdle, 1000);

    // Save to database periodically
    saveIntervalRef.current = setInterval(saveActiveTime, SAVE_INTERVAL_MS);

    // Save when window loses focus or closes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        saveActiveTime();
        isIdleRef.current = true;
      } else {
        lastActivityRef.current = Date.now();
        isIdleRef.current = false;
      }
    };

    const handleBeforeUnload = () => {
      saveActiveTime();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      // Cleanup
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(idleCheckInterval);
      clearInterval(saveIntervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);

      // Final save on unmount
      saveActiveTime();
    };
  }, [isStudent, handleActivity, checkIdle, saveActiveTime]);

  // Return current session stats for UI if needed
  return {
    sessionActiveMinutes: Math.floor(activeTimeRef.current / 60000),
    isIdle: isIdleRef.current,
  };
}
