import { describe, it, expect, vi } from "vitest";

const mockFrom = vi.fn();
vi.mock("../supabase", () => ({
  supabase: { from: (...args: any[]) => mockFrom(...args) },
}));

// Mock notificationApi to prevent import errors
vi.mock("../notificationApi", () => ({
  notifyStudentsNewAssignment: vi.fn().mockResolvedValue(undefined),
  notifyStudentFeedback: vi.fn().mockResolvedValue(undefined),
}));

import { getVoiceSettings } from "../teacherApi";

describe("teacherApi", () => {
  describe("getVoiceSettings", () => {
    it("should return stored settings when they exist", async () => {
      const storedSettings = {
        bpm: 140,
        genre: "jazz",
        style: "smooth",
        mood: "chill",
        custom_prompt: "Use saxophone",
        world_id: "world1",
      };

      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi
          .fn()
          .mockResolvedValue({ data: storedSettings, error: null }),
      });

      const result = await getVoiceSettings("school-1", "world1");
      expect(result.data).toEqual(storedSettings);
      expect(result.error).toBeNull();
    });

    it("should return defaults when no settings exist (PGRST116)", async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: "PGRST116", message: "No rows" },
        }),
      });

      const result = await getVoiceSettings("school-1", "world1");
      expect(result.data.bpm).toBe(120);
      expect(result.data.genre).toBe("afrobeat");
      expect(result.data.style).toBe("upbeat");
      expect(result.data.mood).toBe("happy");
      expect(result.data.world_id).toBe("world1");
    });

    it("should propagate real database errors", async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: "42P01", message: "relation does not exist" },
        }),
      });

      const result = await getVoiceSettings("school-1", "world1");
      expect(result.error).toBeTruthy();
    });

    it("should default worldId to 'world1'", async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: "PGRST116", message: "No rows" },
        }),
      });

      const result = await getVoiceSettings("school-1");
      expect(result.data.world_id).toBe("world1");
    });
  });
});
