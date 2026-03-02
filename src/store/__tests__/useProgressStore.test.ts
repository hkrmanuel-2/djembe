import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock supabase BEFORE importing the store
vi.mock("../../lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    })),
  },
}));

import { useProgressStore } from "../useProgressStore";

describe("useProgressStore", () => {
  const store = () => useProgressStore.getState();

  // ---- calculateXPForLevel ----

  describe("calculateXPForLevel", () => {
    // Formula: Math.floor(100 * level * (1 + level * 0.1))
    it("should return 110 XP for level 1", () => {
      expect(store().calculateXPForLevel(1)).toBe(110);
    });

    it("should return 240 XP for level 2", () => {
      expect(store().calculateXPForLevel(2)).toBe(240);
    });

    it("should return 2000 XP for level 10", () => {
      expect(store().calculateXPForLevel(10)).toBe(2000);
    });

    it("should increase non-linearly (level 50 >> level 25 * 2)", () => {
      const xp25 = store().calculateXPForLevel(25);
      const xp50 = store().calculateXPForLevel(50);
      expect(xp50).toBeGreaterThan(xp25 * 2);
    });

    it("should return a positive integer for any positive level", () => {
      for (let level = 1; level <= 100; level++) {
        const xp = store().calculateXPForLevel(level);
        expect(xp).toBeGreaterThan(0);
        expect(Number.isInteger(xp)).toBe(true);
      }
    });

    it("should always increase as level increases", () => {
      let prev = 0;
      for (let level = 1; level <= 100; level++) {
        const xp = store().calculateXPForLevel(level);
        expect(xp).toBeGreaterThan(prev);
        prev = xp;
      }
    });
  });

  // ---- calculateLevel ----

  describe("calculateLevel", () => {
    it("should return level 1 for 0 XP", () => {
      expect(store().calculateLevel(0)).toBe(1);
    });

    it("should return level 1 for XP just below level 2 threshold", () => {
      const xpForLevel2 = store().calculateXPForLevel(2);
      expect(store().calculateLevel(xpForLevel2 - 1)).toBe(1);
    });

    it("should return level 2 at exactly the level 2 XP threshold", () => {
      const xpForLevel2 = store().calculateXPForLevel(2);
      expect(store().calculateLevel(xpForLevel2)).toBe(2);
    });

    it("should cap at level 100", () => {
      expect(store().calculateLevel(999999999)).toBe(100);
    });

    it("should be consistent with calculateXPForLevel", () => {
      for (let level = 1; level <= 50; level++) {
        const xp = store().calculateXPForLevel(level);
        expect(store().calculateLevel(xp)).toBe(level);
      }
    });

    it("should handle negative XP gracefully (return level 1)", () => {
      expect(store().calculateLevel(-100)).toBe(1);
    });
  });

  // ---- getLevelInfo ----

  describe("getLevelInfo", () => {
    it('should return "Rhythm Rookie" for level 1', () => {
      const info = store().getLevelInfo(1);
      expect(info.name).toBe("Rhythm Rookie");
    });

    it('should return "Beat Builder" for level 5', () => {
      const info = store().getLevelInfo(5);
      expect(info.name).toBe("Beat Builder");
    });

    it('should return "Music Legend" for level 50+', () => {
      expect(store().getLevelInfo(50).name).toBe("Music Legend");
      expect(store().getLevelInfo(99).name).toBe("Music Legend");
    });

    it("should return the highest matching tier (not overshoot)", () => {
      // Level 4 should still be "Rhythm Rookie" (minLevel 5 is Beat Builder)
      expect(store().getLevelInfo(4).name).toBe("Rhythm Rookie");
      // Level 9 should be "Beat Builder" (minLevel 10 is Melody Maker)
      expect(store().getLevelInfo(9).name).toBe("Beat Builder");
    });

    it("should always include an icon", () => {
      for (let level = 1; level <= 50; level++) {
        const info = store().getLevelInfo(level);
        expect(info.icon).toBeDefined();
        expect(info.icon.length).toBeGreaterThan(0);
      }
    });
  });

  // ---- getXPProgress ----

  describe("getXPProgress", () => {
    it("should return 0% when no progress loaded", () => {
      useProgressStore.setState({ progress: null });
      const result = store().getXPProgress();
      expect(result.current).toBe(0);
      expect(result.needed).toBe(100);
      expect(result.percentage).toBe(0);
    });

    it("should calculate correct percentage within a level", () => {
      const xpLevel1 = store().calculateXPForLevel(1); // 110
      const xpLevel2 = store().calculateXPForLevel(2); // 240
      const midpoint = xpLevel1 + Math.floor((xpLevel2 - xpLevel1) / 2);

      useProgressStore.setState({
        progress: { total_xp: midpoint, current_level: 1 },
      });

      const result = store().getXPProgress();
      expect(result.percentage).toBeGreaterThanOrEqual(45);
      expect(result.percentage).toBeLessThanOrEqual(55);
    });

    it("should never exceed 100%", () => {
      useProgressStore.setState({
        progress: { total_xp: 999999, current_level: 99 },
      });
      const result = store().getXPProgress();
      expect(result.percentage).toBeLessThanOrEqual(100);
    });
  });

  // ---- XP_VALUES ----

  describe("getXPValues", () => {
    it("should return all expected XP values", () => {
      const values = store().getXPValues();
      expect(values.ASSIGNMENT_SUBMIT).toBe(50);
      expect(values.ASSIGNMENT_ON_TIME_BONUS).toBe(20);
      expect(values.PROJECT_CREATE).toBe(10);
      expect(values.PROJECT_SAVE).toBe(5);
      expect(values.LOOP_PLACE).toBe(2);
      expect(values.DAILY_LOGIN).toBe(10);
      expect(values.BADGE_UNLOCK_BONUS).toBe(25);
      expect(values.PROJECT_EXPORT).toBe(30);
    });
  });

  // ---- awardXP ----

  describe("awardXP", () => {
    it("should reject zero XP", async () => {
      const result = await store().awardXP("student-1", "test", 0);
      expect(result.success).toBe(false);
    });

    it("should reject negative XP", async () => {
      const result = await store().awardXP("student-1", "test", -10);
      expect(result.success).toBe(false);
    });

    it("should reject null studentId", async () => {
      const result = await store().awardXP(null, "test", 10);
      expect(result.success).toBe(false);
    });

    it("should reject undefined studentId", async () => {
      const result = await store().awardXP(undefined, "test", 10);
      expect(result.success).toBe(false);
    });
  });

  // ---- trackAssignmentSubmit ----

  describe("trackAssignmentSubmit", () => {
    beforeEach(() => {
      useProgressStore.setState({
        progress: {
          student_id: "student-1",
          total_xp: 100,
          current_level: 1,
          assignments_completed: 2,
        },
        badges: [],
        allBadges: [],
        newlyUnlockedBadges: [],
      });
    });

    it("should call awardXP with 50 for late submission", async () => {
      const spy = vi.spyOn(store(), "awardXP");

      await store().trackAssignmentSubmit(
        "student-1",
        "assign-1",
        "Rhythm Basics",
        false
      );

      expect(spy).toHaveBeenCalledWith(
        "student-1",
        "assignment_submit",
        50,
        "assign-1",
        expect.objectContaining({ on_time: false })
      );
      spy.mockRestore();
    });

    it("should call awardXP with 70 (50+20 bonus) for on-time submission", async () => {
      const spy = vi.spyOn(store(), "awardXP");

      await store().trackAssignmentSubmit(
        "student-1",
        "assign-1",
        "Rhythm Basics",
        true
      );

      expect(spy).toHaveBeenCalledWith(
        "student-1",
        "assignment_submit",
        70,
        "assign-1",
        expect.objectContaining({ on_time: true })
      );
      spy.mockRestore();
    });
  });

  // ---- checkBadgeUnlocks ----

  describe("checkBadgeUnlocks", () => {
    it("should not unlock badges when criteria not met", async () => {
      useProgressStore.setState({
        allBadges: [
          {
            id: "badge-1",
            badge_key: "first_project",
            name: "First Project",
            xp_reward: 25,
            unlock_criteria: {
              type: "count",
              field: "projects_created",
              threshold: 1,
            },
          },
        ],
        badges: [],
        newlyUnlockedBadges: [],
      });

      await store().checkBadgeUnlocks("student-1", {
        projects_created: 0,
        current_level: 1,
        current_streak: 0,
        total_time_minutes: 0,
        total_xp: 0,
      });

      expect(useProgressStore.getState().newlyUnlockedBadges).toHaveLength(0);
    });

    it("should not re-unlock already earned badges", async () => {
      useProgressStore.setState({
        allBadges: [
          {
            id: "badge-1",
            badge_key: "first_project",
            name: "First Project",
            xp_reward: 25,
            unlock_criteria: {
              type: "count",
              field: "projects_created",
              threshold: 1,
            },
          },
        ],
        badges: [{ badge_id: "badge-1" }], // already earned
        newlyUnlockedBadges: [],
      });

      await store().checkBadgeUnlocks("student-1", {
        projects_created: 5,
        total_xp: 500,
      });

      expect(useProgressStore.getState().newlyUnlockedBadges).toHaveLength(0);
    });

    it("should skip when studentId is null", async () => {
      await store().checkBadgeUnlocks(null, { total_xp: 100 });
      // Should not throw
    });

    it("should skip when progress is null", async () => {
      await store().checkBadgeUnlocks("student-1", null);
      // Should not throw
    });
  });

  // ---- reset ----

  describe("reset", () => {
    it("should clear all state", () => {
      useProgressStore.setState({
        progress: { total_xp: 500 },
        badges: [{ id: "b1" }],
        error: "some error",
        isLoading: true,
      });

      store().reset();

      const state = useProgressStore.getState();
      expect(state.progress).toBeNull();
      expect(state.badges).toEqual([]);
      expect(state.allBadges).toEqual([]);
      expect(state.error).toBeNull();
      expect(state.isLoading).toBe(false);
    });
  });
});
