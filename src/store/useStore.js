import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as Tone from "tone";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "./useAuthStore";

export const useStore = create(
  persist(
    (set, get) => {
      // internal (non-persistent) variables captured by closure:
      let rafId = null;
      let startTime = 0; // Tone.now() when transport started
      let lastTriggeredBeat = -1; // to avoid retriggering same beat multiple frames

      // Track which loop instances have been triggered at which beat
      // This prevents retriggering the same loop instance multiple times
      const triggeredLoops = new Set(); // Set of "loopId-beatIndex" strings

      // helper: play a loop once (DAW-style, not continuous looping)
      const playLoopOnce = (loop) => {
        if (!loop || !loop.url) return;
        try {
          const audio = new Audio(loop.url);
          audio.loop = false; // Play once, don't loop
          audio.volume = 0.7;
          audio.play().catch((err) => {
            console.warn("Audio play error:", err);
          });
          // Let the audio play to completion naturally - don't track it
        } catch (err) {
          console.warn("Failed to play placed loop:", err);
        }
      };

      // Stop all loops (for stop/rewind)
      const stopAllLoops = () => {
        // Clear triggered loops tracking so they can play again
        triggeredLoops.clear();
      };

      // update loop called by requestAnimationFrame
      const updateBeatLoop = () => {
        const transport = get().transport;
        const project = get().project;
        // if not playing, stop raf
        if (!transport.isPlaying) {
          if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
          }
          return;
        }

        // seconds per beat derived from bpm
        const bpm = transport.bpm || 120;
        const secondsPerBeat = 60 / bpm;

        const now = Tone.now(); // use Tone's clock
        const elapsed = now - startTime;
        const floatBeat = elapsed / secondsPerBeat; // e.g., 0.0..n
        const beatsPerBar = 4;
        const totalBeats = (project.bars || 10) * beatsPerBar; // 10 bars * 4 beats = 40 beats
        const beatIndex = Math.floor(floatBeat) % totalBeats; // ensure wrap (0-39 for 10 bars)

        // update currentBeat in store if changed
        if (beatIndex !== transport.currentBeat) {
          set((state) => ({
            transport: { ...state.transport, currentBeat: beatIndex },
          }));
        }

        // trigger placed loops only once per beat
        if (beatIndex !== lastTriggeredBeat) {
          lastTriggeredBeat = beatIndex;

          // DAW-style playback: trigger loops when playhead reaches their start beat
          const subdivisionsPerBeat = 4;
          const placed = get().project.placedLoops || [];

          placed.forEach((p) => {
            // Convert loop's grid column to beat index (start beat)
            const loopStartBeat = Math.floor(p.col / subdivisionsPerBeat);

            // Trigger playback when playhead reaches the loop's start beat
            if (beatIndex === loopStartBeat) {
              // Create unique key for this loop instance at this beat
              // Include a "cycle" identifier to handle timeline looping
              const totalBeats = (project.bars || 10) * beatsPerBar;
              const cycle = Math.floor(floatBeat / totalBeats);
              const triggerKey = `${p.id}-${loopStartBeat}-${cycle}`;
              
              // Only trigger if we haven't already triggered this loop in this cycle
              if (!triggeredLoops.has(triggerKey)) {
                triggeredLoops.add(triggerKey);
                playLoopOnce(p);
                
                // Clean up old triggers from previous cycles to prevent memory buildup
                // Remove triggers from cycles that are more than 2 cycles behind
                if (triggeredLoops.size > 500) {
                  triggeredLoops.forEach((key) => {
                    const parts = key.split('-');
                    if (parts.length === 3) {
                      const keyCycle = parseInt(parts[2], 10);
                      if (cycle - keyCycle > 2) {
                        triggeredLoops.delete(key);
                      }
                    }
                  });
                }
              }
            }
          });
        }

        // schedule next frame
        rafId = requestAnimationFrame(updateBeatLoop);
      };

      return {
        // ==================== STATE ====================
        transport: {
          bpm: 120,
          isPlaying: false,
          currentBeat: 0,
        },

        // Loops loaded from DATABASE
        library: [],

        project: {
          id: null,
          name: "Untitled Project",
          bpm: 120,
          placedLoops: [],
          bars: 10,
        },

        // Audio players (not persisted)
        players: {},
        audioInitialized: false,
        isLoading: false,
        error: null,
        userProjects: [],

        // ==================== LOAD LOOPS FROM DATABASE ====================
        loadLoops: async () => {
          set({ isLoading: true, error: null });

          try {
            const { data, error } = await supabase
              .from("loops")
              .select("*")
              .order("name", { ascending: true });

            if (error) throw error;

            // Map database fields to app format
            const loops = data.map((loop) => ({
              id: loop.loop_id || loop.id,
              name: loop.name,
              url: loop.url,
              color: loop.color || "bg-purple-400",
              hoverColor: loop.hover_color || "hover:bg-purple-500",
              border: loop.border || "border-purple-600",
              icon: loop.icon || "🎵",
              bpm: loop.bpm || 120, // Default to 120 if not specified
            }));

            set({ library: loops, isLoading: false });
            return { success: true, data: loops };
          } catch (error) {
            console.error("Load loops error:", error);
            // Fallback to default loops if database fails
            set({
              error: error.message,
              isLoading: false,
              library: [
                {
                  id: "1",
                  name: "KICK",
                  url: "https://dtghqnhhsgbvhxlmtwwn.supabase.co/storage/v1/object/public/Loops/kick.wav",
                  color: "bg-purple-400",
                  hoverColor: "hover:bg-purple-500",
                  border: "border-purple-600",
                  icon: "🥁",
                },
                {
                  id: "2",
                  name: "Bell",
                  url: "/loops/bell.mp3",
                  color: "bg-yellow-300",
                  hoverColor: "hover:bg-yellow-400",
                  border: "border-yellow-500",
                  icon: "🔔",
                },
                {
                  id: "3",
                  name: "Shaker",
                  url: "/loops/shaker.mp3",
                  color: "bg-orange-300",
                  hoverColor: "hover:bg-orange-400",
                  border: "border-orange-500",
                  icon: "🎵",
                },
                {
                  loop_id: "4",
                  name: "Melody Loop",
                  url: "/loops/melody.mp3",
                  color: "bg-pink-300",
                  hoverColor: "hover:bg-pink-400",
                  border: "border-pink-500",
                  icon: "🎹",
                },
              ],
            });
            return { success: false, error: error.message };
          }
        },

        // ==================== AUDIO ACTIONS ====================
        initAudio: async () => {
          try {
            await Tone.start();
            const { library } = get();
            const players = {};

            for (const loop of library) {
              if (loop.url) {
                // create persistent players only if you plan to use Tone players for looping playback
                // We keep them but set loop: false to avoid interfering with our placed-loop one-shot triggering.
                players[loop.loop_id] = new Tone.Player({
                  url: loop.url,
                  loop: false,
                }).toDestination();
              }
            }

            await Tone.loaded();
            // ensure Tone.Transport bpm matches store
            Tone.Transport.bpm.value = get().transport.bpm || 120;

            set({ players, audioInitialized: true, error: null });
            return { success: true };
          } catch (error) {
            console.error("Audio init failed:", error);
            set({ error: "Failed to initialize audio", audioInitialized: false });
            return { success: false, error: error.message };
          }
        },

        // Start transport (begin ticking and trigger beats)
        startTransport: async () => {
          // ensure Tone audio started
          if (!get().audioInitialized) {
            const res = await get().initAudio();
            if (!res.success) return { success: false, error: res.error };
          }

          // sync Tone.Transport bpm
          Tone.Transport.bpm.value = get().transport.bpm || 120;

          // start Tone.Transport so things using Tone can sync if needed
          try {
            if (!Tone.Transport.state || Tone.Transport.state !== "started") {
              Tone.Transport.start("+0");
            }
          } catch (err) {
            // ignore if already started
          }

          // set startTime and flags
          startTime = Tone.now();
          lastTriggeredBeat = -1;

          set((state) => ({
            transport: { ...state.transport, isPlaying: true },
          }));

          // start RAF loop
          if (!rafId) {
            rafId = requestAnimationFrame(updateBeatLoop);
          }

          return { success: true };
        },

        // Pause transport (keeps beat position but stops ticking)
        pauseTransport: () => {
          set((state) => ({
            transport: { ...state.transport, isPlaying: false },
          }));

          // stop Tone.Transport
          try {
            Tone.Transport.pause();
          } catch (err) {
            // ignore
          }

          // Stop all loop playback
          stopAllLoops();

          if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
          }

          return { success: true };
        },

        // togglePlay: uses the new start/pause helpers
        togglePlay: async () => {
          const { transport, audioInitialized } = get();

          if (!audioInitialized) {
            const result = await get().initAudio();
            if (!result.success) return;
          }

          if (transport.isPlaying) {
            // pause
            get().pauseTransport();
          } else {
            // start
            await get().startTransport();
          }
        },

        // stop: stop and reset to 0
        stop: () => {
          // stop RAF & Tone Transport
          if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
          }

          try {
            Tone.Transport.stop();
          } catch (err) {
            // ignore
          }

          // Stop all loop playback
          stopAllLoops();

          // stop any persistent players if desired
          const { players } = get();
          Object.values(players).forEach((player) => {
            try {
              player.stop();
            } catch (e) { }
          });

          set((state) => ({
            transport: { ...state.transport, isPlaying: false, currentBeat: 0 },
          }));

          // reset internal startTime so next start is fresh
          startTime = 0;
          lastTriggeredBeat = -1;
        },

        // rewind sets position to 0 for UI
        rewind: () => {
          try {
            Tone.Transport.position = 0;
          } catch (e) { }
          set((state) => ({
            transport: { ...state.transport, currentBeat: 0 },
          }));
          // reset internals so next start begins at 0
          startTime = Tone.now();
          lastTriggeredBeat = -1;
          // Clear triggered loops so they can play again from the start
          stopAllLoops();
        },

        setBpm: (bpm) => {
          // update Tone transport bpm and store bpm
          try {
            Tone.Transport.bpm.value = bpm;
          } catch (err) { }
          set((state) => ({
            transport: { ...state.transport, bpm },
            project: { ...state.project, bpm },
          }));
        },

        setCurrentBeat: (beat) => {
          set((state) => ({
            transport: { ...state.transport, currentBeat: beat },
          }));
        },

        // ==================== PROJECT ACTIONS ====================
        addPlacedLoop: (loop) => {
          set((state) => ({
            project: {
              ...state.project,
              placedLoops: [...state.project.placedLoops, loop],
            },
          }));
        },

        removePlacedLoop: (id) => {
          set((state) => ({
            project: {
              ...state.project,
              placedLoops: state.project.placedLoops.filter((loop) => loop.id !== id),
            },
          }));
        },

        updatePlacedLoop: (id, updates) => {
          set((state) => ({
            project: {
              ...state.project,
              placedLoops: state.project.placedLoops.map((loop) =>
                loop.id === id ? { ...loop, ...updates } : loop
              ),
            },
          }));
        },

        setProjectName: (name) => {
          set((state) => ({
            project: { ...state.project, name },
          }));
        },

        updateProjectDimensions: (bars, rows) => {
          set((state) => {
            const defaultBars = 10;
            const defaultRows = 5;
            // Allow shrinking back to default when loops are deleted
            const newBars = bars || defaultBars;
            const newRows = rows || defaultRows;
            
            return {
              project: { 
                ...state.project, 
                bars: newBars,
                // Note: rows is not stored in project, but Timeline calculates it dynamically
              },
            };
          });
        },

        newProject: () => {
          set({
            project: {
              id: null,
              name: "Untitled Project",
              bpm: 120,
              placedLoops: [],
              bars: 10,
            },
          });
        },

        // ==================== DATABASE ACTIONS (PROJECTS) ====================
        saveProject: async () => {
          set({ isLoading: true, error: null });

          try {
            // Get current user from auth store
            const authState = useAuthStore.getState();
            const userProfile = authState.userProfile;
            const userType = authState.userType;

            if (!userProfile) {
              throw new Error("User not authenticated. Please log in.");
            }

            // Get student_id or teacher_id based on user type
            const userId = userType === "student"
              ? userProfile.student_id
              : userProfile.teacher_id;

            if (!userId) {
              throw new Error(`Unable to get ${userType} ID. Please contact support.`);
            }

            const { project } = get();
            const projectData = {
              title: project.name, // Schema uses 'title', not 'name'
              bpm: project.bpm,
              placed_loops: project.placedLoops,
              bars: project.bars,
              updated_at: new Date().toISOString(),
            };

            let result;

            if (project.id || project.project_id) {
              // Update existing project
              const projectId = project.id || project.project_id;
              result = await supabase
                .from("projects")
                .update(projectData)
                .eq("project_id", projectId)
                .select()
                .single();
            } else {
              // Create new project - include student_id
              projectData.student_id = userId;
              projectData.created_at = new Date().toISOString();
              result = await supabase
                .from("projects")
                .insert([projectData])
                .select()
                .single();
            }

            if (result.error) throw result.error;

            set((state) => ({
              project: {
                ...state.project,
                id: result.data.project_id,
                project_id: result.data.project_id,
                name: result.data.title || result.data.name,
              },
              isLoading: false,
              error: null,
            }));

            return { success: true, message: "Project saved!" };
          } catch (error) {
            console.error("Save error:", error);
            set({ isLoading: false, error: error.message });
            return { success: false, message: "Failed to save" };
          }
        },

        loadProject: async (projectId) => {
          set({ isLoading: true, error: null });

          try {
            const { data, error } = await supabase
              .from("projects")
              .select("*")
              .eq("project_id", projectId)
              .single();

            if (error) throw error;

            set({
              project: {
                id: data.project_id,
                project_id: data.project_id,
                name: data.title || data.name, // Schema uses 'title'
                bpm: data.bpm,
                placedLoops: data.placed_loops || [],
                bars: data.bars || 10,
              },
              isLoading: false,
              error: null,
            });

            get().setBpm(data.bpm);
            return { success: true };
          } catch (error) {
            console.error("Load error:", error);
            set({ isLoading: false, error: error.message });
            return { success: false };
          }
        },

        loadUserProjects: async () => {
          set({ isLoading: true, error: null });

          try {
            // Get current user from auth store
            const authState = useAuthStore.getState();
            const userProfile = authState.userProfile;

            if (!userProfile) {
              throw new Error("User not authenticated. Please log in.");
            }

            const userId = authState.userType === "student"
              ? userProfile.student_id
              : userProfile.teacher_id;

            if (!userId) {
              throw new Error("Unable to get user ID. Please contact support.");
            }

            const { data, error } = await supabase
              .from("projects")
              .select("project_id, title, bpm, created_at, updated_at")
              .eq("student_id", userId)
              .order("updated_at", { ascending: false });

            if (error) throw error;

            // Map title to name for compatibility
            const mappedData = (data || []).map(project => ({
              ...project,
              name: project.title || project.name,
            }));

            set({ userProjects: mappedData, isLoading: false, error: null });
            return { success: true, data: mappedData };
          } catch (error) {
            console.error("Load projects error:", error);
            set({ isLoading: false, error: error.message });
            return { success: false };
          }
        },

        deleteProject: async (projectId) => {
          set({ isLoading: true, error: null });

          try {
            const { error } = await supabase
              .from("projects")
              .delete()
              .eq("project_id", projectId);

            if (error) throw error;

            set((state) => ({
              userProjects: state.userProjects.filter((p) => (p.project_id !== projectId && p.id !== projectId)),
              isLoading: false,
              error: null,
            }));

            return { success: true };
          } catch (error) {
            console.error("Delete error:", error);
            set({ isLoading: false, error: error.message });
            return { success: false };
          }
        },
      };
    },
    {
      name: "daw-storage",
      partialize: (state) => ({
        transport: {
          bpm: state.transport.bpm,
          isPlaying: state.transport.isPlaying,
          currentBeat: state.transport.currentBeat,
        },
        project: state.project,
        userProjects: state.userProjects,
      }),
    }
  )
);
