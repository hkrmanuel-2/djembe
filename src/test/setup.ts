import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Auto-cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Tone.js globally (Web Audio API doesn't exist in jsdom)
vi.mock("tone", () => ({
  start: vi.fn(),
  Transport: {
    bpm: { value: 120 },
    start: vi.fn(),
    stop: vi.fn(),
    pause: vi.fn(),
    position: 0,
    seconds: 0,
    state: "stopped",
    scheduleRepeat: vi.fn(() => 0),
    clear: vi.fn(),
  },
  Player: vi.fn(() => ({
    connect: vi.fn().mockReturnThis(),
    start: vi.fn(),
    stop: vi.fn(),
    dispose: vi.fn(),
    loaded: Promise.resolve(),
    buffer: { loaded: true },
    state: "stopped",
    loop: false,
    mute: false,
    toDestination: vi.fn().mockReturnThis(),
  })),
  Gain: vi.fn(() => ({
    toDestination: vi.fn().mockReturnThis(),
    gain: { value: 0.8 },
    dispose: vi.fn(),
  })),
  loaded: vi.fn(() => Promise.resolve()),
  now: vi.fn(() => 0),
}));

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, "sessionStorage", { value: sessionStorageMock });
