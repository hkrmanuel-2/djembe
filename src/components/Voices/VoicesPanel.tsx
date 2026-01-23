import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Music, Play, Pause, Loader2 } from "lucide-react";
import { useVoicesStore } from "../../store/useVoicesStore";
import { useAuthStore } from "../../store/useAuthStore";
import VoiceCategory from "./VoiceCategory";
import VoicesGlobalControls from "./VoicesGlobalControls";

interface VoicesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  worldId?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  rhythm: "Rhythm",
  bass: "Bass",
  harmony: "Harmony",
  melody: "Melody",
  extras: "Extras",
};

export default function VoicesPanel({ isOpen, onClose, worldId = "world1" }: VoicesPanelProps) {
  const userProfile = useAuthStore((state) => state.userProfile);
  const schoolId = userProfile?.school_id;

  const {
    settings,
    stems,
    isPlaying,
    isGenerating,
    generationStage,
    generationMessage,
    stemsLoaded,
    categories,
    globalMuted,
    timeToNextBar,
    setWorldId,
    fetchSettings,
    checkCachedStems,
    generateStems,
    initAudio,
    startPlayback,
    stopPlayback,
    selectVoice,
    toggleMute,
    toggleSolo,
    resetAll,
    randomizeAll,
    muteAll,
    cleanup,
  } = useVoicesStore();

  // Calculate seconds per bar
  const secondsPerBar = (60 / settings.bpm) * 4;

  // Initialize on mount - DO NOT auto-generate (manual button click only)
  useEffect(() => {
    if (!isOpen || !schoolId) return;

    const init = async () => {
      // Set world ID first
      setWorldId(worldId);

      // Fetch settings for this world
      await fetchSettings(schoolId, worldId);

      // Check for cached stems (if any exist from previous generation)
      checkCachedStems();

      // Initialize audio
      await initAudio();
    };

    init();

    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, [isOpen, schoolId, worldId]);

  // Handle play/pause toggle
  const handlePlayToggle = async () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      await startPlayback();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed right-0 top-0 h-full w-80 z-50 flex flex-col"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
        >
          {/* Panel background */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl border-l border-white/10" />

          {/* Content */}
          <div className="relative flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Music className="text-white/80" size={20} />
                <h2 className="text-lg font-bold text-white">Voices</h2>
              </div>

              <div className="flex items-center gap-2">
                {/* Play/Pause button */}
                {stemsLoaded && (
                  <button
                    onClick={handlePlayToggle}
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      transition-all duration-200
                      ${isPlaying
                        ? "bg-orange-500/30 text-orange-300 border border-orange-400/50"
                        : "bg-green-500/30 text-green-300 border border-green-400/50"
                      }
                    `}
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                )}

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center
                           hover:bg-white/20 transition-colors"
                >
                  <X size={18} className="text-white/80" />
                </button>
              </div>
            </div>

            {/* BPM display */}
            <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
              <span className="text-xs text-white/40">Tempo</span>
              <span className="text-sm font-mono text-white/80">{settings.bpm} BPM</span>
            </div>

            {/* Main content */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Generation loading state */}
              {isGenerating && (
                <motion.div
                  className="flex flex-col items-center justify-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
                  <p className="text-sm text-white/80 mb-1">{generationMessage}</p>
                  <p className="text-xs text-white/40 capitalize">{generationStage}</p>

                  {/* Progress dots */}
                  <div className="flex gap-1 mt-4">
                    {["generating", "separating", "processing", "complete"].map((stage, i) => (
                      <div
                        key={stage}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          generationStage === stage
                            ? "bg-purple-400"
                            : i < ["generating", "separating", "processing", "complete"].indexOf(generationStage || "")
                            ? "bg-green-400"
                            : "bg-white/20"
                        }`}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Voice categories */}
              {stemsLoaded && !isGenerating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <VoiceCategory
                      key={key}
                      name={label}
                      categoryKey={key}
                      stems={stems[key as keyof typeof stems] || []}
                      state={categories[key as keyof typeof categories]}
                      timeToNextBar={timeToNextBar}
                      secondsPerBar={secondsPerBar}
                      onSelectVoice={selectVoice}
                      onToggleMute={toggleMute}
                      onToggleSolo={toggleSolo}
                    />
                  ))}

                  {/* Global controls */}
                  <VoicesGlobalControls
                    onReset={resetAll}
                    onRandomize={randomizeAll}
                    onMuteAll={muteAll}
                    globalMuted={globalMuted}
                  />
                </motion.div>
              )}

              {/* Not loaded and not generating - waiting state */}
              {!stemsLoaded && !isGenerating && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Music className="w-12 h-12 text-white/20 mb-4" />
                  <p className="text-sm text-white/60 text-center">
                    Open the panel to generate music stems
                  </p>
                  <button
                    onClick={() => generateStems()}
                    className="mt-4 px-6 py-2.5 bg-purple-500/30 text-purple-300 rounded-lg
                             border border-purple-400/30 hover:bg-purple-500/40 transition-colors"
                  >
                    Generate Stems
                  </button>
                </div>
              )}
            </div>

            {/* Footer - settings info */}
            <div className="p-3 border-t border-white/10 bg-white/5">
              <div className="flex flex-wrap gap-2 text-xs text-white/40">
                {settings.genre && (
                  <span className="px-2 py-0.5 bg-white/10 rounded">{settings.genre}</span>
                )}
                {settings.style && (
                  <span className="px-2 py-0.5 bg-white/10 rounded">{settings.style}</span>
                )}
                {settings.mood && (
                  <span className="px-2 py-0.5 bg-white/10 rounded">{settings.mood}</span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
