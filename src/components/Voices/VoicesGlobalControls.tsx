import { motion } from "framer-motion";
import { RotateCcw, Shuffle, VolumeX, Volume2 } from "lucide-react";

interface VoicesGlobalControlsProps {
  onReset: () => void;
  onRandomize: () => void;
  onMuteAll: () => void;
  globalMuted: boolean;
  disabled?: boolean;
}

export default function VoicesGlobalControls({
  onReset,
  onRandomize,
  onMuteAll,
  globalMuted,
  disabled = false,
}: VoicesGlobalControlsProps) {
  const buttonClass = `
    flex-1 py-2 px-3 rounded-lg text-sm font-medium
    transition-all duration-200
    border border-white/20
    ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-white/20 active:scale-95"}
  `;

  return (
    <motion.div
      className="flex gap-2 mt-4 pt-4 border-t border-white/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      {/* Reset button */}
      <button
        onClick={onReset}
        disabled={disabled}
        className={`${buttonClass} bg-white/5 text-white/80`}
      >
        <span className="flex items-center justify-center gap-1">
          <RotateCcw size={14} />
          <span>Reset</span>
        </span>
      </button>

      {/* Randomize button */}
      <button
        onClick={onRandomize}
        disabled={disabled}
        className={`${buttonClass} bg-purple-500/20 text-purple-300`}
      >
        <span className="flex items-center justify-center gap-1">
          <Shuffle size={14} />
          <span>Randomize</span>
        </span>
      </button>

      {/* Mute All button */}
      <button
        onClick={onMuteAll}
        disabled={disabled}
        className={`${buttonClass} ${
          globalMuted
            ? "bg-red-500/30 text-red-300 border-red-400/50"
            : "bg-white/5 text-white/80"
        }`}
      >
        <span className="flex items-center justify-center gap-1">
          {globalMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          <span>{globalMuted ? "Unmute" : "Mute"}</span>
        </span>
      </button>
    </motion.div>
  );
}
