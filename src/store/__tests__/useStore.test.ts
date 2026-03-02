import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("../../lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

vi.mock("../useAuthStore", () => ({
  useAuthStore: { getState: () => ({ userProfile: null, userType: null }) },
}));

vi.mock("../useProgressStore", () => ({
  useProgressStore: {
    getState: () => ({
      trackLoopPlace: vi.fn(),
      trackProjectCreate: vi.fn(),
    }),
  },
}));

import { useStore } from "../useStore";

describe("useStore - Project Management", () => {
  beforeEach(() => {
    useStore.setState({
      project: {
        id: null,
        name: "Untitled Project",
        bpm: 120,
        placedLoops: [],
        bars: 10,
      },
      transport: {
        bpm: 120,
        isPlaying: false,
        currentBeat: 0,
      },
    });
  });

  describe("addPlacedLoop", () => {
    it("should add a loop to placedLoops", () => {
      const loop = {
        id: "loop-1",
        name: "Kick",
        col: 0,
        row: 0,
        url: "/kick.wav",
      };
      useStore.getState().addPlacedLoop(loop);

      const { placedLoops } = useStore.getState().project;
      expect(placedLoops).toHaveLength(1);
      expect(placedLoops[0].id).toBe("loop-1");
    });

    it("should append when adding multiple loops", () => {
      useStore.getState().addPlacedLoop({ id: "loop-1", name: "Kick" });
      useStore.getState().addPlacedLoop({ id: "loop-2", name: "Snare" });

      expect(useStore.getState().project.placedLoops).toHaveLength(2);
    });

    it("should preserve existing loops when adding new ones", () => {
      useStore.getState().addPlacedLoop({ id: "loop-1", name: "Kick" });
      useStore.getState().addPlacedLoop({ id: "loop-2", name: "Snare" });

      const loops = useStore.getState().project.placedLoops;
      expect(loops[0].name).toBe("Kick");
      expect(loops[1].name).toBe("Snare");
    });
  });

  describe("removePlacedLoop", () => {
    it("should remove a loop by ID", () => {
      useStore.setState({
        project: {
          ...useStore.getState().project,
          placedLoops: [
            { id: "loop-1", name: "Kick" },
            { id: "loop-2", name: "Snare" },
          ],
        },
      });

      useStore.getState().removePlacedLoop("loop-1");

      const { placedLoops } = useStore.getState().project;
      expect(placedLoops).toHaveLength(1);
      expect(placedLoops[0].id).toBe("loop-2");
    });

    it("should do nothing when removing non-existent ID", () => {
      useStore.setState({
        project: {
          ...useStore.getState().project,
          placedLoops: [{ id: "loop-1", name: "Kick" }],
        },
      });

      useStore.getState().removePlacedLoop("does-not-exist");
      expect(useStore.getState().project.placedLoops).toHaveLength(1);
    });
  });

  describe("newProject", () => {
    it("should reset project to defaults", () => {
      useStore.setState({
        project: {
          id: "proj-123",
          name: "My Song",
          bpm: 140,
          placedLoops: [{ id: "loop-1" }],
          bars: 20,
        },
      });

      useStore.getState().newProject();

      const project = useStore.getState().project;
      expect(project.id).toBeNull();
      expect(project.name).toBe("Untitled Project");
      expect(project.bpm).toBe(120);
      expect(project.placedLoops).toEqual([]);
      expect(project.bars).toBe(10);
    });
  });

  describe("setProjectName", () => {
    it("should update project name", () => {
      useStore.getState().setProjectName("My Cool Beat");
      expect(useStore.getState().project.name).toBe("My Cool Beat");
    });

    it("should handle empty string", () => {
      useStore.getState().setProjectName("");
      expect(useStore.getState().project.name).toBe("");
    });
  });

  describe("setBpm", () => {
    it("should update both transport and project BPM", () => {
      useStore.getState().setBpm(140);
      expect(useStore.getState().transport.bpm).toBe(140);
      expect(useStore.getState().project.bpm).toBe(140);
    });
  });

  describe("updateProjectDimensions", () => {
    it("should update bar count", () => {
      useStore.getState().updateProjectDimensions(20);
      expect(useStore.getState().project.bars).toBe(20);
    });

    it("should default to 10 bars when given falsy value", () => {
      useStore.getState().updateProjectDimensions(null);
      expect(useStore.getState().project.bars).toBe(10);
    });
  });

  describe("updatePlacedLoop", () => {
    it("should update properties of a specific loop", () => {
      useStore.setState({
        project: {
          ...useStore.getState().project,
          placedLoops: [{ id: "loop-1", col: 0, row: 0, name: "Kick" }],
        },
      });

      useStore.getState().updatePlacedLoop("loop-1", { col: 4 });

      const loop = useStore.getState().project.placedLoops[0];
      expect(loop.col).toBe(4);
      expect(loop.name).toBe("Kick"); // unchanged
    });

    it("should not affect other loops", () => {
      useStore.setState({
        project: {
          ...useStore.getState().project,
          placedLoops: [
            { id: "loop-1", col: 0, name: "Kick" },
            { id: "loop-2", col: 4, name: "Snare" },
          ],
        },
      });

      useStore.getState().updatePlacedLoop("loop-1", { col: 8 });

      const loops = useStore.getState().project.placedLoops;
      expect(loops[0].col).toBe(8);
      expect(loops[1].col).toBe(4); // unchanged
    });
  });
});
