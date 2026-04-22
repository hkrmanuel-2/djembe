// Voices Store - State management for 3D Worlds music panel
// Handles beat-synced voice switching using Tone.js Transport

import { create } from "zustand";
import { logger } from "../lib/logger";
import * as Tone from "tone";
import { getVoiceSettings } from "../lib/teacherApi";
import { generateAndSeparateStems } from "../lib/voicesApi";

// Session storage key for caching stems (includes worldId)
const getStemsCacheKey = (worldId) => `djembe_voices_stems_${worldId}`;
const getSettingsCacheKey = (worldId) => `djembe_voices_settings_${worldId}`;

// Internal refs (not in state)
let barSchedulerId = null;
let players = {}; // { category: { stemId: Tone.Player } }
let masterGain = null;

export const useVoicesStore = create((set, get) => ({
  // =============== STATE ===============

  // Current world ID
  worldId: "world1",

  // Teacher settings (fetched from DB)
  settings: {
    bpm: 120,
    genre: "afrobeat",
    style: "upbeat",
    mood: "happy",
    custom_prompt: null,
  },

  // Generated stems for this session
  stems: {
    rhythm: [],
    bass: [],
    harmony: [],
    melody: [],
    extras: [],
  },

  // Playback state
  isPlaying: false,
  isGenerating: false,
  generationStage: null, // 'generating' | 'separating' | 'processing' | 'complete'
  generationMessage: "",

  // Audio state
  audioInitialized: false,
  stemsLoaded: false,

  // Category states
  categories: {
    rhythm: { activeVoice: null, pendingVoice: null, pendingStartTime: null, muted: false, solo: false },
    bass: { activeVoice: null, pendingVoice: null, pendingStartTime: null, muted: false, solo: false },
    harmony: { activeVoice: null, pendingVoice: null, pendingStartTime: null, muted: false, solo: false },
    melody: { activeVoice: null, pendingVoice: null, pendingStartTime: null, muted: false, solo: false },
    extras: { activeVoice: null, pendingVoice: null, pendingStartTime: null, muted: false, solo: false },
  },

  // Global controls
  globalMuted: false,

  // Current transport time (for UI)
  currentBar: 0,
  timeToNextBar: 0,

  // =============== ACTIONS ===============

  /**
   * Set the current world ID
   */
  setWorldId: (worldId) => {
    set({ worldId });
  },

  /**
   * Fetch voice settings from database.
   * Always hits the DB. If the teacher's settings have changed since the last
   * visit to this world, invalidate the cached stems so the student regenerates
   * in the new genre on their next play.
   */
  fetchSettings: async (schoolId, worldId = null) => {
    const currentWorldId = worldId || get().worldId;

    try {
      if (worldId) {
        set({ worldId });
      }

      const result = await getVoiceSettings(schoolId, currentWorldId);
      if (!result.data) return result;

      const fresh = result.data;
      const snapshotKey = getSettingsCacheKey(currentWorldId);
      const prevSnapshot = sessionStorage.getItem(snapshotKey);

      const stemRelevant = (s) =>
        JSON.stringify({
          bpm: s.bpm,
          genre: s.genre,
          style: s.style,
          mood: s.mood,
          custom_prompt: s.custom_prompt ?? null,
        });

      const freshSnapshot = stemRelevant(fresh);
      if (prevSnapshot && prevSnapshot !== freshSnapshot) {
        // Teacher changed settings since stems were generated — drop stems.
        sessionStorage.removeItem(getStemsCacheKey(currentWorldId));
        set({
          stems: { rhythm: [], bass: [], harmony: [], melody: [], extras: [] },
          stemsLoaded: false,
        });
      }

      sessionStorage.setItem(snapshotKey, freshSnapshot);
      set({ settings: fresh });
      return result;
    } catch (error) {
      console.error("[VoicesStore] Fetch settings error:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Check if we have cached stems for this session and world
   */
  checkCachedStems: () => {
    const { worldId } = get();
    try {
      const cacheKey = getStemsCacheKey(worldId);
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsedStems = JSON.parse(cached);
        set({ stems: parsedStems, stemsLoaded: true });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  /**
   * Generate stems using Suno API
   */
  generateStems: async () => {
    const { settings, worldId } = get();

    set({
      isGenerating: true,
      generationStage: "starting",
      generationMessage: "Initializing...",
    });

    try {
      const result = await generateAndSeparateStems(settings, (stage, message) => {
        set({ generationStage: stage, generationMessage: message });
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      // Cache stems for session (per world)
      const cacheKey = getStemsCacheKey(worldId);
      sessionStorage.setItem(cacheKey, JSON.stringify(result.stems));

      set({
        stems: result.stems,
        stemsLoaded: true,
        isGenerating: false,
        generationStage: "complete",
        generationMessage: "Ready!",
      });

      return { success: true };
    } catch (error) {
      console.error("[VoicesStore] Generate stems error:", error);
      set({
        isGenerating: false,
        generationStage: null,
        generationMessage: "",
      });
      return { success: false, error: error.message };
    }
  },

  /**
   * Initialize audio context and create players
   */
  initAudio: async () => {
    if (get().audioInitialized) return;

    try {
      await Tone.start();
      logger.log("[VoicesStore] Audio context started");

      // Create master gain
      masterGain = new Tone.Gain(0.8).toDestination();

      // Set BPM
      const { settings } = get();
      Tone.Transport.bpm.value = settings.bpm;

      set({ audioInitialized: true });
    } catch (error) {
      console.error("[VoicesStore] Init audio error:", error);
    }
  },

  /**
   * Load all stem audio files into Tone.Players
   */
  loadStemPlayers: async () => {
    const { stems, audioInitialized } = get();

    if (!audioInitialized) {
      await get().initAudio();
    }

    // Dispose existing players
    Object.values(players).forEach((categoryPlayers) => {
      Object.values(categoryPlayers).forEach((player) => {
        if (player && player.dispose) player.dispose();
      });
    });
    players = {};

    // Create new players for each stem
    const loadPromises = [];

    Object.entries(stems).forEach(([category, categoryStems]) => {
      players[category] = {};

      categoryStems.forEach((stem) => {
        const player = new Tone.Player({
          url: stem.url,
          loop: true,
          fadeIn: 0.05,
          fadeOut: 0.05,
        }).connect(masterGain);

        players[category][stem.id] = player;
        // Use player.loaded - a promise that resolves when THIS player's buffer is ready
        loadPromises.push(player.loaded);
      });
    });

    // Wait for ALL player buffers to be fully loaded
    await Promise.all(loadPromises);
    logger.log("[VoicesStore] All stem players loaded");
  },

  /**
   * Start playback - begins transport and bar scheduling
   * All active voices start at exactly the same time for seamless sync
   */
  startPlayback: async () => {
    const { audioInitialized, stemsLoaded, settings, categories } = get();

    if (!audioInitialized) {
      await get().initAudio();
    }

    if (!stemsLoaded) {
      logger.warn("[VoicesStore] Stems not loaded yet");
      return;
    }

    // Load players if not already (and wait for them to be ready)
    if (Object.keys(players).length === 0) {
      logger.log("[VoicesStore] Loading stem players before playback...");
      await get().loadStemPlayers();
      logger.log("[VoicesStore] Stem players ready, starting playback");
    }

    // Update BPM
    Tone.Transport.bpm.value = settings.bpm;

    // Calculate bar duration
    const secondsPerBar = (60 / settings.bpm) * 4;

    // Schedule bar boundary callback
    if (barSchedulerId !== null) {
      Tone.Transport.clear(barSchedulerId);
    }

    barSchedulerId = Tone.Transport.scheduleRepeat(
      (time) => {
        get()._processBarBoundary(time);
      },
      secondsPerBar,
      0
    );

    // Reset transport position to ensure clean start
    Tone.Transport.position = 0;

    // Start transport
    Tone.Transport.start();
    set({ isPlaying: true });

    // Start all active voices at the same time (at the beginning of the transport)
    // This ensures they're all perfectly in sync
    const startTime = Tone.now() + 0.01; // Small delay to ensure scheduling
    Object.entries(categories).forEach(([category, state]) => {
      if (state.activeVoice && players[category]?.[state.activeVoice]) {
        const player = players[category][state.activeVoice];
        if (player.buffer?.loaded) {
          const shouldPlay = get()._shouldCategoryPlay(category);
          if (shouldPlay) {
            // Start from the beginning of the audio, synchronized
            player.start(startTime, 0);
          }
        }
      }
    });

    // Update time display
    get()._startTimeUpdater();

    logger.log("[VoicesStore] Playback started - all voices synchronized");
  },

  /**
   * Stop playback
   */
  stopPlayback: () => {
    // Stop transport
    Tone.Transport.stop();
    Tone.Transport.position = 0;

    // Clear scheduler
    if (barSchedulerId !== null) {
      Tone.Transport.clear(barSchedulerId);
      barSchedulerId = null;
    }

    // Stop all players (only if they have loaded buffers and were started)
    Object.values(players).forEach((categoryPlayers) => {
      Object.values(categoryPlayers).forEach((player) => {
        try {
          if (player && player.buffer?.loaded && player.state === "started") {
            player.stop();
          }
        } catch {
          // Ignore errors when stopping players
        }
      });
    });

    // Clear active/pending states
    const { categories } = get();
    const resetCategories = {};
    Object.keys(categories).forEach((cat) => {
      resetCategories[cat] = {
        ...categories[cat],
        activeVoice: null,
        pendingVoice: null,
        pendingStartTime: null,
      };
    });

    set({
      isPlaying: false,
      currentBar: 0,
      timeToNextBar: 0,
      categories: resetCategories,
    });

    logger.log("[VoicesStore] Playback stopped");
  },

  /**
   * Calculate the time to the next beat or bar boundary
   * @param {number} bpm - Current BPM
   * @param {boolean} toBar - If true, calculates to next bar; if false, to next beat
   * @returns {number} Time in seconds to the next boundary
   */
  _getTimeToNextBoundary: (bpm, toBar = true) => {
    const secondsPerBeat = 60 / bpm;
    const secondsPerBar = secondsPerBeat * 4;
    const boundary = toBar ? secondsPerBar : secondsPerBeat;
    const currentPosition = Tone.Transport.seconds;
    const timeToNext = boundary - (currentPosition % boundary);
    // If we're very close to the boundary (within 50ms), go to the next one
    return timeToNext < 0.05 ? boundary : timeToNext;
  },

  /**
   * Select a voice - queues it for the next bar boundary for seamless mixing
   */
  selectVoice: (category, voiceId) => {
    const { categories, isPlaying, settings } = get();
    const categoryState = categories[category];

    if (!categoryState) return;

    // If clicking the same voice that's active, deselect it (stop at next bar)
    if (categoryState.activeVoice === voiceId) {
      if (isPlaying) {
        // Schedule stop at next bar boundary for seamless transition
        const timeToNextBar = get()._getTimeToNextBoundary(settings.bpm, true);
        const stopTime = Tone.Transport.seconds + timeToNextBar;

        if (players[category]?.[voiceId]?.state === "started") {
          players[category][voiceId].stop(stopTime);
        }
      } else {
        // Stop immediately if not playing
        if (players[category]?.[voiceId]?.state === "started") {
          players[category][voiceId].stop();
        }
      }

      set({
        categories: {
          ...categories,
          [category]: {
            ...categoryState,
            activeVoice: null,
            pendingVoice: null,
            pendingStartTime: null,
          },
        },
      });
      return;
    }

    // If clicking the same voice that's pending, cancel it
    if (categoryState.pendingVoice === voiceId) {
      set({
        categories: {
          ...categories,
          [category]: {
            ...categoryState,
            pendingVoice: null,
            pendingStartTime: null,
          },
        },
      });
      return;
    }

    // If not playing yet, just set as active (will start when playback begins)
    if (!isPlaying) {
      set({
        categories: {
          ...categories,
          [category]: {
            ...categoryState,
            activeVoice: voiceId,
            pendingVoice: null,
            pendingStartTime: null,
          },
        },
      });
      return;
    }

    // Queue for next bar (will be processed in _processBarBoundary)
    set({
      categories: {
        ...categories,
        [category]: {
          ...categoryState,
          pendingVoice: voiceId,
          pendingStartTime: Date.now(),
        },
      },
    });
  },

  /**
   * Process bar boundary - switch pending voices to active
   * Called by Tone.Transport scheduler
   */
  _processBarBoundary: (time) => {
    const { categories } = get();
    const updatedCategories = { ...categories };
    let hasChanges = false;

    Object.entries(categories).forEach(([category, state]) => {
      if (state.pendingVoice !== null && state.pendingVoice !== state.activeVoice) {
        // Stop current voice (only if it was actually started)
        const currentPlayer = players[category]?.[state.activeVoice];
        if (currentPlayer && currentPlayer.buffer?.loaded && currentPlayer.state === "started") {
          currentPlayer.stop(time);
        }

        // Start new voice at exact bar boundary
        const newPlayer = players[category]?.[state.pendingVoice];
        if (newPlayer && newPlayer.buffer?.loaded) {
          // Check mute/solo
          const shouldPlay = get()._shouldCategoryPlay(category);
          if (shouldPlay) {
            newPlayer.start(time);
          }
        }

        updatedCategories[category] = {
          ...state,
          activeVoice: state.pendingVoice,
          pendingVoice: null,
          pendingStartTime: null,
        };
        hasChanges = true;
      }
    });

    if (hasChanges) {
      set({ categories: updatedCategories });
    }

    // Update bar counter
    set((s) => ({ currentBar: s.currentBar + 1 }));
  },

  /**
   * Check if a category should play (considering mute/solo)
   */
  _shouldCategoryPlay: (category) => {
    const { categories, globalMuted } = get();

    if (globalMuted) return false;

    const state = categories[category];
    if (state.muted) return false;

    // Check if any category has solo enabled
    const anySolo = Object.values(categories).some((c) => c.solo);
    if (anySolo && !state.solo) return false;

    return true;
  },

  /**
   * Toggle mute for a category
   */
  toggleMute: (category) => {
    const { categories } = get();
    const state = categories[category];
    const newMuted = !state.muted;

    // Update player volume immediately
    if (state.activeVoice && players[category]?.[state.activeVoice]) {
      players[category][state.activeVoice].mute = newMuted;
    }

    set({
      categories: {
        ...categories,
        [category]: { ...state, muted: newMuted },
      },
    });
  },

  /**
   * Toggle solo for a category
   */
  toggleSolo: (category) => {
    const { categories } = get();
    const state = categories[category];
    const newSolo = !state.solo;

    // Update all players based on new solo state
    Object.entries(categories).forEach(([cat, catState]) => {
      if (catState.activeVoice && players[cat]?.[catState.activeVoice]) {
        const shouldMute = newSolo && cat !== category;
        players[cat][catState.activeVoice].mute = shouldMute || catState.muted;
      }
    });

    set({
      categories: {
        ...categories,
        [category]: { ...state, solo: newSolo },
      },
    });
  },

  /**
   * Reset all voices - stop everything
   */
  resetAll: () => {
    get().stopPlayback();
  },

  /**
   * Randomize - select random voice for each category
   */
  randomizeAll: () => {
    const { stems, categories } = get();
    const updatedCategories = { ...categories };

    Object.entries(stems).forEach(([category, categoryStems]) => {
      if (categoryStems.length > 0) {
        const randomIndex = Math.floor(Math.random() * categoryStems.length);
        const randomStem = categoryStems[randomIndex];

        updatedCategories[category] = {
          ...updatedCategories[category],
          pendingVoice: randomStem.id,
          pendingStartTime: Date.now(),
        };
      }
    });

    set({ categories: updatedCategories });
  },

  /**
   * Mute all voices
   */
  muteAll: () => {
    const { globalMuted } = get();
    const newMuted = !globalMuted;

    // Update master gain
    if (masterGain) {
      masterGain.gain.value = newMuted ? 0 : 0.8;
    }

    set({ globalMuted: newMuted });
  },

  /**
   * Update time display (called in animation frame)
   */
  _startTimeUpdater: () => {
    const { settings, isPlaying } = get();

    const update = () => {
      if (!get().isPlaying) return;

      const secondsPerBar = (60 / settings.bpm) * 4;
      const currentPosition = Tone.Transport.seconds;
      const timeToNextBar = secondsPerBar - (currentPosition % secondsPerBar);

      set({ timeToNextBar });

      requestAnimationFrame(update);
    };

    if (isPlaying) {
      requestAnimationFrame(update);
    }
  },

  /**
   * Cleanup when leaving world
   */
  cleanup: () => {
    get().stopPlayback();

    // Dispose all players
    Object.values(players).forEach((categoryPlayers) => {
      Object.values(categoryPlayers).forEach((player) => {
        if (player && player.dispose) player.dispose();
      });
    });
    players = {};

    // Dispose master gain
    if (masterGain) {
      masterGain.dispose();
      masterGain = null;
    }

    set({ audioInitialized: false });
  },

  /**
   * Clear session cache (for testing/reset)
   */
  clearCache: () => {
    const { worldId } = get();
    sessionStorage.removeItem(getStemsCacheKey(worldId));
    sessionStorage.removeItem(getSettingsCacheKey(worldId));
    set({
      stems: { rhythm: [], bass: [], harmony: [], melody: [], extras: [] },
      stemsLoaded: false,
    });
  },

  /**
   * Clear all world caches
   */
  clearAllCaches: () => {
    // Clear all known world caches
    ["world1", "world2"].forEach((wId) => {
      sessionStorage.removeItem(getStemsCacheKey(wId));
      sessionStorage.removeItem(getSettingsCacheKey(wId));
    });
    set({
      stems: { rhythm: [], bass: [], harmony: [], melody: [], extras: [] },
      stemsLoaded: false,
    });
  },
}));
