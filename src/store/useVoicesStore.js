// Voices Store - State management for 3D Worlds music panel
// Handles beat-synced voice switching using Tone.js Transport

import { create } from "zustand";
import * as Tone from "tone";
import { getVoiceSettings } from "../lib/teacherApi";
import { generateAndSeparateStems } from "../lib/voicesApi";

// Session storage key for caching stems
const STEMS_CACHE_KEY = "djembe_voices_stems";
const SETTINGS_CACHE_KEY = "djembe_voices_settings";

// Internal refs (not in state)
let barSchedulerId = null;
let players = {}; // { category: { stemId: Tone.Player } }
let masterGain = null;

export const useVoicesStore = create((set, get) => ({
  // =============== STATE ===============

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
   * Fetch voice settings from database
   */
  fetchSettings: async (schoolId) => {
    try {
      // Check session cache first
      const cached = sessionStorage.getItem(SETTINGS_CACHE_KEY);
      if (cached) {
        const parsedSettings = JSON.parse(cached);
        set({ settings: parsedSettings });
        return { success: true, data: parsedSettings };
      }

      const result = await getVoiceSettings(schoolId);
      if (result.data) {
        set({ settings: result.data });
        sessionStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(result.data));
      }
      return result;
    } catch (error) {
      console.error("[VoicesStore] Fetch settings error:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Check if we have cached stems for this session
   */
  checkCachedStems: () => {
    try {
      const cached = sessionStorage.getItem(STEMS_CACHE_KEY);
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
    const { settings } = get();

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

      // Cache stems for session
      sessionStorage.setItem(STEMS_CACHE_KEY, JSON.stringify(result.stems));

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
      console.log("[VoicesStore] Audio context started");

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
    console.log("[VoicesStore] All stem players loaded");
  },

  /**
   * Start playback - begins transport and bar scheduling
   */
  startPlayback: async () => {
    const { audioInitialized, stemsLoaded, settings } = get();

    if (!audioInitialized) {
      await get().initAudio();
    }

    if (!stemsLoaded) {
      console.warn("[VoicesStore] Stems not loaded yet");
      return;
    }

    // Load players if not already (and wait for them to be ready)
    if (Object.keys(players).length === 0) {
      console.log("[VoicesStore] Loading stem players before playback...");
      await get().loadStemPlayers();
      console.log("[VoicesStore] Stem players ready, starting playback");
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

    // Start transport
    Tone.Transport.start();
    set({ isPlaying: true });

    // Update time display
    get()._startTimeUpdater();

    console.log("[VoicesStore] Playback started");
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
        } catch (e) {
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

    console.log("[VoicesStore] Playback stopped");
  },

  /**
   * Select a voice - queues it for the next bar boundary
   */
  selectVoice: (category, voiceId) => {
    const { categories, isPlaying, settings } = get();
    const categoryState = categories[category];

    if (!categoryState) return;

    // If clicking the same voice that's active, deselect it
    if (categoryState.activeVoice === voiceId) {
      // Stop the player
      if (players[category]?.[voiceId]?.state === "started") {
        players[category][voiceId].stop();
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

    // Calculate time to next bar for the loader animation
    const secondsPerBar = (60 / settings.bpm) * 4;
    const currentPosition = Tone.Transport.seconds;
    const timeToNextBar = secondsPerBar - (currentPosition % secondsPerBar);

    // If not playing yet, activate immediately
    if (!isPlaying) {
      // Start the player immediately
      if (players[category]?.[voiceId]) {
        players[category][voiceId].start();
      }

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

    // Queue for next bar
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
    sessionStorage.removeItem(STEMS_CACHE_KEY);
    sessionStorage.removeItem(SETTINGS_CACHE_KEY);
    set({
      stems: { rhythm: [], bass: [], harmony: [], melody: [], extras: [] },
      stemsLoaded: false,
    });
  },
}));
