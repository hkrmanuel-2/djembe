import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock supabase
vi.mock("../../lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          student_id: "student-1",
          total_xp: 170,
          current_level: 1,
          assignments_completed: 4,
        },
        error: null,
      }),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    })),
  },
}));

import { useProgressStore } from "../../store/useProgressStore";

describe("Assignment Submission XP Flow (Integration)", () => {
  beforeEach(() => {
    useProgressStore.setState({
      progress: {
        student_id: "student-1",
        total_xp: 100,
        current_level: 1,
        assignments_completed: 3,
        projects_created: 0,
        projects_exported: 0,
        loops_placed_total: 0,
      },
      badges: [],
      allBadges: [],
      newlyUnlockedBadges: [],
    });
  });

  it("should award base XP (50) for late submission", async () => {
    const spy = vi.spyOn(useProgressStore.getState(), "awardXP");

    await useProgressStore
      .getState()
      .trackAssignmentSubmit("student-1", "assign-1", "Rhythm Basics", false);

    expect(spy).toHaveBeenCalledWith(
      "student-1",
      "assignment_submit",
      50,
      "assign-1",
      expect.objectContaining({ on_time: false })
    );
    spy.mockRestore();
  });

  it("should award 70 XP (50 + 20 bonus) for on-time submission", async () => {
    const spy = vi.spyOn(useProgressStore.getState(), "awardXP");

    await useProgressStore
      .getState()
      .trackAssignmentSubmit("student-1", "assign-1", "Rhythm Basics", true);

    expect(spy).toHaveBeenCalledWith(
      "student-1",
      "assignment_submit",
      70,
      "assign-1",
      expect.objectContaining({ on_time: true })
    );
    spy.mockRestore();
  });

  it("should include assignment title in metadata description", async () => {
    const spy = vi.spyOn(useProgressStore.getState(), "awardXP");

    await useProgressStore
      .getState()
      .trackAssignmentSubmit(
        "student-1",
        "assign-1",
        "Beat Making 101",
        false
      );

    expect(spy).toHaveBeenCalledWith(
      "student-1",
      "assignment_submit",
      50,
      "assign-1",
      expect.objectContaining({
        description: expect.stringContaining("Beat Making 101"),
      })
    );
    spy.mockRestore();
  });
});
