import { describe, it, expect } from "vitest";
import { buildPrompt, mapStemsToCategories } from "../voicesApi";

// ============================================
// TEST 1.3: Prompt Builder
// ============================================

describe("voicesApi", () => {
  describe("buildPrompt", () => {
    it("should include the specified genre", () => {
      const prompt = buildPrompt({ genre: "jazz", bpm: 100 });
      expect(prompt).toContain("jazz");
    });

    it("should include the exact BPM value", () => {
      const prompt = buildPrompt({ bpm: 145 });
      expect(prompt).toContain("145 BPM");
    });

    it("should include style and mood", () => {
      const prompt = buildPrompt({ style: "chill", mood: "relaxed" });
      expect(prompt).toContain("chill");
      expect(prompt).toContain("relaxed");
    });

    it("should use defaults when settings are empty", () => {
      const prompt = buildPrompt({});
      expect(prompt).toContain("afrobeat");
      expect(prompt).toContain("120 BPM");
      expect(prompt).toContain("upbeat");
      expect(prompt).toContain("happy");
    });

    it("should include custom_prompt when provided", () => {
      const prompt = buildPrompt({
        custom_prompt: "Focus on djembe drums",
      });
      expect(prompt).toContain("Focus on djembe drums");
      expect(prompt).toContain("Additional teacher notes");
    });

    it("should NOT include 'Additional teacher notes' when no custom_prompt", () => {
      const prompt = buildPrompt({ genre: "afrobeat" });
      expect(prompt).not.toContain("Additional teacher notes");
    });

    it("should always require instrumental (no vocals)", () => {
      const prompt = buildPrompt({});
      expect(prompt.toLowerCase()).toContain("no vocals");
      expect(prompt.toLowerCase()).toContain("instrumental");
    });

    it("should always enforce child safety", () => {
      const prompt = buildPrompt({});
      expect(prompt).toContain("Child-safe");
      expect(prompt).toContain("No aggressive");
      expect(prompt).toContain("No distortion");
    });

    it("should return a non-empty string", () => {
      const prompt = buildPrompt({});
      expect(typeof prompt).toBe("string");
      expect(prompt.length).toBeGreaterThan(100);
    });
  });

  // ============================================
  // TEST 1.4: Stem Mapping
  // ============================================

  describe("mapStemsToCategories", () => {
    it("should map drums to rhythm category", () => {
      const result = mapStemsToCategories({
        drums: "http://example.com/drums.wav",
      });
      expect(result.rhythm).toHaveLength(1);
      expect(result.rhythm[0].name).toBe("Drums");
      expect(result.rhythm[0].url).toBe("http://example.com/drums.wav");
    });

    it("should map bass to bass category", () => {
      const result = mapStemsToCategories({
        bass: "http://example.com/bass.wav",
      });
      expect(result.bass).toHaveLength(1);
      expect(result.bass[0].name).toBe("Bass");
    });

    it("should map piano and other to harmony category", () => {
      const result = mapStemsToCategories({
        piano: "http://example.com/piano.wav",
        other: "http://example.com/other.wav",
      });
      expect(result.harmony).toHaveLength(2);
      expect(result.harmony[0].name).toBe("Piano");
      expect(result.harmony[1].name).toBe("Other");
    });

    it("should map guitar and vocals to melody category", () => {
      const result = mapStemsToCategories({
        guitar: "http://example.com/guitar.wav",
        vocals: "http://example.com/vocals.wav",
      });
      expect(result.melody).toHaveLength(2);
      expect(result.melody[0].name).toBe("Guitar");
      expect(result.melody[1].name).toBe("Vocals");
    });

    it("should always return empty extras array", () => {
      const result = mapStemsToCategories({
        drums: "x",
        bass: "x",
        piano: "x",
        guitar: "x",
        vocals: "x",
        other: "x",
      });
      expect(result.extras).toEqual([]);
    });

    it("should handle completely empty input", () => {
      const result = mapStemsToCategories({});
      expect(result.rhythm).toEqual([]);
      expect(result.bass).toEqual([]);
      expect(result.harmony).toEqual([]);
      expect(result.melody).toEqual([]);
      expect(result.extras).toEqual([]);
    });

    it("should assign correct IDs to stems", () => {
      const result = mapStemsToCategories({
        drums: "x",
        bass: "x",
        piano: "x",
        other: "x",
      });
      expect(result.rhythm[0].id).toBe("rhythm-0");
      expect(result.bass[0].id).toBe("bass-0");
      expect(result.harmony[0].id).toBe("harmony-0");
      expect(result.harmony[1].id).toBe("harmony-1");
    });

    it("should handle partial stems (only drums)", () => {
      const result = mapStemsToCategories({ drums: "http://drums.wav" });
      expect(result.rhythm).toHaveLength(1);
      expect(result.bass).toHaveLength(0);
      expect(result.harmony).toHaveLength(0);
      expect(result.melody).toHaveLength(0);
    });
  });
});
