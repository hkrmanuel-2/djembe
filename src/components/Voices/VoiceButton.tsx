import { motion } from "framer-motion";
import { Play } from "lucide-react";

interface VoiceButtonProps {
  id: string;
  name: string;
  isActive: boolean;
  isPending: boolean;
  timeToNextBar: number; // seconds until bar switch
  secondsPerBar: number; // total bar duration for calculating progress
  onClick: () => void;
  disabled?: boolean;
}

export default function VoiceButton({
  id,
  name,
  isActive,
  isPending,
  timeToNextBar,
  secondsPerBar,
  onClick,
  disabled = false,
}: VoiceButtonProps) {
  // Calculate the loader animation duration
  // The loader should complete exactly when the bar boundary hits
  const loaderDuration = isPending ? timeToNextBar : 0;

  // Calculate stroke dashoffset for the circular progress
  const circumference = 2 * Math.PI * 18; // radius = 18

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative w-12 h-12 rounded-full flex items-center justify-center
        transition-all duration-200
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${isActive ? "bg-green-500/30 border-2 border-green-400" : ""}
        ${isPending ? "bg-yellow-500/20 border-2 border-yellow-400/50" : ""}
        ${!isActive && !isPending ? "bg-white/10 border-2 border-white/20 hover:bg-white/20" : ""}
      `}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
    >
      {/* Play icon */}
      <Play
        size={20}
        className={`
          ${isActive ? "text-green-400 fill-green-400" : ""}
          ${isPending ? "text-yellow-400" : ""}
          ${!isActive && !isPending ? "text-white/70" : ""}
        `}
      />

      {/* Circular loader for pending state */}
      {isPending && loaderDuration > 0 && (
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 48 48"
        >
          {/* Background circle */}
          <circle
            cx="24"
            cy="24"
            r="18"
            fill="none"
            stroke="rgba(250, 204, 21, 0.2)"
            strokeWidth="3"
          />
          {/* Animated progress circle */}
          <motion.circle
            cx="24"
            cy="24"
            r="18"
            fill="none"
            stroke="rgb(250, 204, 21)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: 0 }}
            transition={{
              duration: loaderDuration,
              ease: "linear",
            }}
          />
        </svg>
      )}

      {/* Active glow effect */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-full bg-green-400/20"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.2, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </motion.button>
  );
}
