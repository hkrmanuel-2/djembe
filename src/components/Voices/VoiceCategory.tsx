import { motion } from "framer-motion";
import VoiceButton from "./VoiceButton";

interface Stem {
  id: string;
  name: string;
  url: string;
}

interface CategoryState {
  activeVoice: string | null;
  pendingVoice: string | null;
  pendingStartTime: number | null;
  muted: boolean;
  solo: boolean;
}

interface VoiceCategoryProps {
  name: string;
  categoryKey: string;
  stems: Stem[];
  state: CategoryState;
  timeToNextBar: number;
  secondsPerBar: number;
  onSelectVoice: (category: string, voiceId: string) => void;
  onToggleMute: (category: string) => void;
  onToggleSolo: (category: string) => void;
  disabled?: boolean;
}

// Category colors
const categoryColors: Record<string, { bar: string; text: string }> = {
  rhythm: { bar: "bg-purple-500", text: "text-purple-300" },
  bass: { bar: "bg-blue-500", text: "text-blue-300" },
  harmony: { bar: "bg-pink-500", text: "text-pink-300" },
  melody: { bar: "bg-green-500", text: "text-green-300" },
  extras: { bar: "bg-orange-500", text: "text-orange-300" },
};

export default function VoiceCategory({
  name,
  categoryKey,
  stems,
  state,
  timeToNextBar,
  secondsPerBar,
  onSelectVoice,
  onToggleMute,
  onToggleSolo,
  disabled = false,
}: VoiceCategoryProps) {
  const colors = categoryColors[categoryKey] || { bar: "bg-white", text: "text-white" };

  // Count active voices
  const activeCount = state.activeVoice ? 1 : 0;
  const totalCount = stems.length;

  return (
    <motion.div
      className="mb-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Category header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${colors.text}`}>
            {name}
          </span>
          <span className="text-xs text-white/40">
            ({activeCount} / {totalCount})
          </span>
        </div>

        {/* Solo/Mute buttons */}
        <div className="flex gap-1">
          <button
            onClick={() => onToggleSolo(categoryKey)}
            disabled={disabled}
            className={`
              w-6 h-6 rounded text-xs font-bold transition-all
              ${state.solo
                ? "bg-yellow-500 text-black"
                : "bg-white/10 text-white/60 hover:bg-white/20"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            S
          </button>
          <button
            onClick={() => onToggleMute(categoryKey)}
            disabled={disabled}
            className={`
              w-6 h-6 rounded text-xs font-bold transition-all
              ${state.muted
                ? "bg-red-500 text-white"
                : "bg-white/10 text-white/60 hover:bg-white/20"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            M
          </button>
        </div>
      </div>

      {/* Color bar indicator */}
      <div className={`h-1 ${colors.bar} rounded-full mb-3 opacity-60`} />

      {/* Voice buttons */}
      <div className="flex flex-wrap gap-2">
        {stems.map((stem) => (
          <VoiceButton
            key={stem.id}
            id={stem.id}
            name={stem.name}
            isActive={state.activeVoice === stem.id}
            isPending={state.pendingVoice === stem.id}
            timeToNextBar={timeToNextBar}
            secondsPerBar={secondsPerBar}
            onClick={() => onSelectVoice(categoryKey, stem.id)}
            disabled={disabled}
          />
        ))}

        {/* Empty state */}
        {stems.length === 0 && (
          <div className="text-xs text-white/40 italic py-2">
            No stems available
          </div>
        )}
      </div>
    </motion.div>
  );
}
