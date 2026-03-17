import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "../lib/supabase";

// XP values for different activities
const XP_VALUES = {
  // Assignment Activities
  ASSIGNMENT_SUBMIT: 50,
  ASSIGNMENT_ON_TIME_BONUS: 20,

  // Creative Activities (DAW)
  PROJECT_CREATE: 10,
  PROJECT_SAVE: 5,
  PROJECT_EXPORT: 30,
  LOOP_PLACE: 2,

  // Engagement
  DAILY_LOGIN: 10,

  // Badges
  BADGE_UNLOCK_BONUS: 25,
};

// Daily caps to prevent XP farming
const DAILY_CAPS = {
  LOOP_PLACE: 25, // Max 25 loops per day = 50 XP
  PROJECT_SAVE: 5, // Max 5 saves per day = 25 XP
  ACTIVE_TIME: 60, // Max 60 minutes per day = 30 XP
};

// Level names for display
const LEVEL_NAMES = [
  { minLevel: 1, name: "Rhythm Rookie", icon: "🎵" },
  { minLevel: 5, name: "Beat Builder", icon: "🥁" },
  { minLevel: 10, name: "Melody Maker", icon: "🎶" },
  { minLevel: 15, name: "Sound Explorer", icon: "🔊" },
  { minLevel: 20, name: "Track Crafter", icon: "🎧" },
  { minLevel: 30, name: "Mix Master", icon: "🎛️" },
  { minLevel: 40, name: "Studio Star", icon: "⭐" },
  { minLevel: 50, name: "Music Legend", icon: "🏆" },
];

export const useProgressStore = create(
  persist(
    (set, get) => ({
      // State
      progress: null,
      badges: [],
      allBadges: [],
      recentActivities: [],
      newlyUnlockedBadges: [],
      isLoading: false,
      error: null,

      // Calculate XP required for a given level
      calculateXPForLevel: (level) => {
        // Formula: 100 * level * (1 + level * 0.1)
        return Math.floor(100 * level * (1 + level * 0.1));
      },

      // Calculate current level from total XP
      calculateLevel: (totalXP) => {
        let level = 1;
        while (get().calculateXPForLevel(level + 1) <= totalXP) {
          level++;
          if (level >= 100) break; // Cap at level 100
        }
        return level;
      },

      // Get level name and icon
      getLevelInfo: (level) => {
        let info = LEVEL_NAMES[0];
        for (const levelInfo of LEVEL_NAMES) {
          if (level >= levelInfo.minLevel) {
            info = levelInfo;
          }
        }
        return info;
      },

      // Get XP progress within current level
      getXPProgress: () => {
        const { progress } = get();
        if (!progress) return { current: 0, needed: 100, percentage: 0 };

        const totalXP = progress.total_xp || 0;
        const currentLevel = progress.current_level || 1;
        const xpForCurrentLevel = get().calculateXPForLevel(currentLevel);
        const xpForNextLevel = get().calculateXPForLevel(currentLevel + 1);
        const xpInLevel = totalXP - xpForCurrentLevel;
        const xpNeeded = xpForNextLevel - xpForCurrentLevel;

        return {
          current: xpInLevel,
          needed: xpNeeded,
          percentage: Math.min(100, Math.floor((xpInLevel / xpNeeded) * 100)),
        };
      },

      // Load student progress
      loadProgress: async (studentId) => {
        if (!studentId) return;

        set({ isLoading: true, error: null });

        try {
          // Fetch or create progress record
          let { data: progress, error: progressError } = await supabase
            .from("student_progress")
            .select("*")
            .eq("student_id", studentId)
            .single();

          if (progressError && progressError.code === "PGRST116") {
            // No progress record exists, create one
            const { data: newProgress, error: createError } = await supabase
              .from("student_progress")
              .insert([{ student_id: studentId }])
              .select()
              .single();

            if (createError) throw createError;
            progress = newProgress;
          } else if (progressError) {
            throw progressError;
          }

          // Fetch earned badges
          const { data: badges, error: badgesError } = await supabase
            .from("student_badges")
            .select(`
              *,
              badge_definitions (*)
            `)
            .eq("student_id", studentId)
            .order("unlocked_at", { ascending: false });

          if (badgesError) throw badgesError;

          // Fetch all badge definitions
          const { data: allBadges, error: allBadgesError } = await supabase
            .from("badge_definitions")
            .select("*")
            .eq("is_active", true)
            .order("display_order", { ascending: true });

          if (allBadgesError) throw allBadgesError;

          // Fetch recent activities
          const { data: activities, error: activitiesError } = await supabase
            .from("xp_activities")
            .select("*")
            .eq("student_id", studentId)
            .order("created_at", { ascending: false })
            .limit(20);

          if (activitiesError) throw activitiesError;

          set({
            progress,
            badges: badges || [],
            allBadges: allBadges || [],
            recentActivities: activities || [],
            isLoading: false,
            error: null,
          });

        } catch (error) {
          console.error("Load progress error:", error);
          set({ error: error.message, isLoading: false });
        }
      },

      // Award XP for an activity
      awardXP: async (studentId, activityType, xpAmount, referenceId = null, metadata = {}) => {
        if (!studentId || xpAmount <= 0) return { success: false };

        try {
          // Insert activity log
          const { error: activityError } = await supabase
            .from("xp_activities")
            .insert([{
              student_id: studentId,
              activity_type: activityType,
              activity_reference_id: referenceId,
              xp_awarded: xpAmount,
              description: metadata.description || activityType,
              metadata,
            }]);

          if (activityError) throw activityError;

          // Get current progress
          const { progress } = get();
          const currentXP = progress?.total_xp || 0;
          const newTotalXP = currentXP + xpAmount;
          const newLevel = get().calculateLevel(newTotalXP);
          const xpToNext = get().calculateXPForLevel(newLevel + 1);
          const leveledUp = newLevel > (progress?.current_level || 1);

          // Build update data
          const updateData = {
            total_xp: newTotalXP,
            current_level: newLevel,
            xp_to_next_level: xpToNext,
            last_activity_date: new Date().toISOString().split("T")[0],
            updated_at: new Date().toISOString(),
          };

          // Update activity-specific counters
          switch (activityType) {
            case "assignment_submit":
              updateData.assignments_completed = (progress?.assignments_completed || 0) + 1;
              break;
            case "project_create":
              updateData.projects_created = (progress?.projects_created || 0) + 1;
              break;
            case "project_export":
              updateData.projects_exported = (progress?.projects_exported || 0) + 1;
              break;
            case "loop_place":
              updateData.loops_placed_total = (progress?.loops_placed_total || 0) + 1;
              break;
            case "active_time":
              // Time is tracked separately via useSessionTracker
              // Just let the XP flow through
              break;
          }

          // Update progress in database
          const { data: updatedProgress, error: updateError } = await supabase
            .from("student_progress")
            .update(updateData)
            .eq("student_id", studentId)
            .select()
            .single();

          if (updateError) throw updateError;

          set({ progress: updatedProgress });

          // Check for badge unlocks
          await get().checkBadgeUnlocks(studentId, updatedProgress);

          return { success: true, xpAwarded: xpAmount, leveledUp, newLevel };

        } catch (error) {
          console.error("Award XP error:", error);
          return { success: false, error: error.message };
        }
      },

      // Check and award badges
      checkBadgeUnlocks: async (studentId, progress) => {
        if (!studentId || !progress) return;

        try {
          const { allBadges, badges } = get();
          const earnedBadgeIds = new Set(badges.map(b => b.badge_id));
          const newlyUnlocked = [];

          for (const badge of allBadges) {
            if (earnedBadgeIds.has(badge.id)) continue;

            const criteria = badge.unlock_criteria;
            let unlocked = false;

            switch (criteria.type) {
              case "count": {
                const currentCount = progress[criteria.field] || 0;
                unlocked = currentCount >= criteria.threshold;
                break;
              }
              case "level":
                unlocked = progress.current_level >= criteria.level;
                break;
              case "streak":
                unlocked = progress.current_streak >= criteria.days;
                break;
              case "time": {
                const totalMinutes = progress.total_time_minutes || 0;
                unlocked = totalMinutes >= criteria.minutes;
                break;
              }
            }

            if (unlocked) {
              // Award badge
              const { error: insertError } = await supabase
                .from("student_badges")
                .insert([{
                  student_id: studentId,
                  badge_id: badge.id,
                  unlock_context: { progress_at_unlock: progress },
                }]);

              if (!insertError) {
                newlyUnlocked.push(badge);

                // Award bonus XP for badge (don't recurse badge checking)
                if (badge.xp_reward > 0) {
                  await supabase
                    .from("xp_activities")
                    .insert([{
                      student_id: studentId,
                      activity_type: "badge_unlock",
                      xp_awarded: badge.xp_reward,
                      description: `Unlocked badge: ${badge.name}`,
                      metadata: { badge_key: badge.badge_key, badge_name: badge.name },
                    }]);

                  // Update XP total
                  await supabase
                    .from("student_progress")
                    .update({
                      total_xp: progress.total_xp + badge.xp_reward,
                      updated_at: new Date().toISOString(),
                    })
                    .eq("student_id", studentId);
                }
              }
            }
          }

          if (newlyUnlocked.length > 0) {
            set({ newlyUnlockedBadges: newlyUnlocked });
            // Reload to get updated data
            await get().loadProgress(studentId);
          }

        } catch (error) {
          console.error("Check badge unlocks error:", error);
        }
      },

      // Clear badge notifications
      clearNewBadges: () => set({ newlyUnlockedBadges: [] }),

      // Record daily login and handle streak
      recordDailyLogin: async (studentId) => {
        if (!studentId) return;

        try {
          const today = new Date().toISOString().split("T")[0];

          // Check if already logged today
          const { data: existing } = await supabase
            .from("daily_activity")
            .select("*")
            .eq("student_id", studentId)
            .eq("activity_date", today)
            .single();

          if (existing?.login_recorded) return; // Already recorded

          // Get yesterday's activity to check streak
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];

          const { data: yesterdayActivity } = await supabase
            .from("daily_activity")
            .select("*")
            .eq("student_id", studentId)
            .eq("activity_date", yesterdayStr)
            .single();

          // Calculate new streak
          const { progress } = get();
          let newStreak = 1;
          if (yesterdayActivity?.login_recorded) {
            newStreak = (progress?.current_streak || 0) + 1;
          }

          const longestStreak = Math.max(newStreak, progress?.longest_streak || 0);

          // Upsert daily activity
          await supabase
            .from("daily_activity")
            .upsert({
              student_id: studentId,
              activity_date: today,
              login_recorded: true,
            }, { onConflict: "student_id,activity_date" });

          // Update streak in progress
          await supabase
            .from("student_progress")
            .update({
              current_streak: newStreak,
              longest_streak: longestStreak,
              last_activity_date: today,
            })
            .eq("student_id", studentId);

          // Award daily login XP
          await get().awardXP(studentId, "daily_login", XP_VALUES.DAILY_LOGIN, null, {
            description: "Daily login bonus",
            date: today,
            streak: newStreak,
          });

        } catch (error) {
          console.error("Record daily login error:", error);
        }
      },

      // Track loop placement (with daily cap)
      trackLoopPlace: async (studentId) => {
        if (!studentId) return;

        try {
          const today = new Date().toISOString().split("T")[0];

          // Get today's loop count
          const { data: dailyActivity } = await supabase
            .from("daily_activity")
            .select("loops_placed")
            .eq("student_id", studentId)
            .eq("activity_date", today)
            .single();

          const dailyLoops = dailyActivity?.loops_placed || 0;

          if (dailyLoops < DAILY_CAPS.LOOP_PLACE) {
            // Update daily counter
            await supabase
              .from("daily_activity")
              .upsert({
                student_id: studentId,
                activity_date: today,
                loops_placed: dailyLoops + 1,
              }, { onConflict: "student_id,activity_date" });

            // Award XP
            await get().awardXP(studentId, "loop_place", XP_VALUES.LOOP_PLACE, null, {
              description: "Placed a loop",
            });
          }
        } catch (error) {
          console.error("Track loop place error:", error);
        }
      },

      // Track project creation
      trackProjectCreate: async (studentId, projectId, projectName) => {
        await get().awardXP(studentId, "project_create", XP_VALUES.PROJECT_CREATE, projectId, {
          description: `Created project: ${projectName}`,
          project_name: projectName,
        });
      },

      // Track project export
      trackProjectExport: async (studentId, projectId, projectName) => {
        await get().awardXP(studentId, "project_export", XP_VALUES.PROJECT_EXPORT, projectId, {
          description: `Exported project: ${projectName}`,
          project_name: projectName,
        });
      },

      // Track assignment submission
      trackAssignmentSubmit: async (studentId, assignmentId, assignmentTitle, isOnTime) => {
        let xp = XP_VALUES.ASSIGNMENT_SUBMIT;
        const metadata = {
          description: `Submitted: ${assignmentTitle}`,
          assignment_title: assignmentTitle,
          on_time: isOnTime,
        };

        if (isOnTime) {
          xp += XP_VALUES.ASSIGNMENT_ON_TIME_BONUS;
          metadata.description += " (on time bonus!)";
        }

        await get().awardXP(studentId, "assignment_submit", xp, assignmentId, metadata);
      },

      // Get XP values (for UI display)
      getXPValues: () => XP_VALUES,

      // Reset store
      reset: () => set({
        progress: null,
        badges: [],
        allBadges: [],
        recentActivities: [],
        newlyUnlockedBadges: [],
        isLoading: false,
        error: null,
      }),
    }),
    {
      name: "progress-storage",
      partialize: (state) => ({
        // Only persist minimal data
        progress: state.progress,
      }),
    }
  )
);
