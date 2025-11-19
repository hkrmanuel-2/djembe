import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as Tone from "tone";
import { supabase } from "../lib/supabase";

export const useStore = create(
  persist(
    (set, get) => ({
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
          const loops = data.map(loop => ({
            id: loop.id,
            name: loop.name,
            url: loop.url,
            color: loop.color || "bg-purple-400",
            hoverColor: loop.hover_color || "hover:bg-purple-500",
            border: loop.border || "border-purple-600",
            icon: loop.icon || "🎵",
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
              { id: "1", name: "Adowa Drum", url: "/loops/adowa.mp3", color: "bg-purple-400", hoverColor: "hover:bg-purple-500", border: "border-purple-600", icon: "🥁" },
              { id: "2", name: "Bell", url: "/loops/bell.mp3", color: "bg-yellow-300", hoverColor: "hover:bg-yellow-400", border: "border-yellow-500", icon: "🔔" },
              { id: "3", name: "Shaker", url: "/loops/shaker.mp3", color: "bg-orange-300", hoverColor: "hover:bg-orange-400", border: "border-orange-500", icon: "🎵" },
              { id: "4", name: "Melody Loop", url: "/loops/melody.mp3", color: "bg-pink-300", hoverColor: "hover:bg-pink-400", border: "border-pink-500", icon: "🎹" },
            ]
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
              players[loop.id] = new Tone.Player({
                url: loop.url,
                loop: true,
              }).toDestination();
            }
          }

          await Tone.loaded();
          set({ players, audioInitialized: true, error: null });
          return { success: true };
        } catch (error) {
          console.error("Audio init failed:", error);
          set({ error: "Failed to initialize audio", audioInitialized: false });
          return { success: false, error: error.message };
        }
      },

      togglePlay: async () => {
        const { transport, audioInitialized, initAudio } = get();

        if (!audioInitialized) {
          const result = await initAudio();
          if (!result.success) return;
        }

        if (transport.isPlaying) {
          Tone.Transport.pause();
          const { players } = get();
          Object.values(players).forEach((player) => player.stop());
          set((state) => ({
            transport: { ...state.transport, isPlaying: false },
          }));
        } else {
          Tone.Transport.start();
          set((state) => ({
            transport: { ...state.transport, isPlaying: true },
          }));
        }
      },

      stop: () => {
        Tone.Transport.stop();
        const { players } = get();
        Object.values(players).forEach((player) => player.stop());
        set((state) => ({
          transport: { ...state.transport, isPlaying: false, currentBeat: 0 },
        }));
      },

      rewind: () => {
        Tone.Transport.position = 0;
        set((state) => ({
          transport: { ...state.transport, currentBeat: 0 },
        }));
      },

      setBpm: (bpm) => {
        Tone.Transport.bpm.value = bpm;
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

      setProjectName: (name) => {
        set((state) => ({
          project: { ...state.project, name },
        }));
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
          const { project } = get();
          const projectData = {
            name: project.name,
            bpm: project.bpm,
            placed_loops: project.placedLoops,
            bars: project.bars,
            updated_at: new Date().toISOString(),
          };

          let result;

          if (project.id) {
            result = await supabase
              .from("projects")
              .update(projectData)
              .eq("id", project.id)
              .select()
              .single();
          } else {
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
              id: result.data.id,
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
            .eq("id", projectId)
            .single();

          if (error) throw error;

          set({
            project: {
              id: data.id,
              name: data.name,
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
          const { data, error } = await supabase
            .from("projects")
            .select("id, name, bpm, created_at, updated_at")
            .order("updated_at", { ascending: false });

          if (error) throw error;

          set({ userProjects: data, isLoading: false, error: null });
          return { success: true, data };
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
            .eq("id", projectId);

          if (error) throw error;

          set((state) => ({
            userProjects: state.userProjects.filter((p) => p.id !== projectId),
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
    }),
    {
      name: "daw-storage",
      partialize: (state) => ({
        transport: state.transport,
        project: state.project,
        userProjects: state.userProjects,
      }),
    }
  )
);