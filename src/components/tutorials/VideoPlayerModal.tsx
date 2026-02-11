import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { incrementViewCount, getDifficultyColor, getCategoryName } from "@/lib/tutorialsApi";

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutorial: {
    id: string;
    title: string;
    description: string;
    video_url: string;
    duration_minutes: number;
    difficulty_level: string;
    category: string;
  } | null;
}

export default function VideoPlayerModal({
  isOpen,
  onClose,
  tutorial,
}: VideoPlayerModalProps) {
  // Increment view count when modal opens
  useEffect(() => {
    if (isOpen && tutorial) {
      incrementViewCount(tutorial.id);
    }
  }, [isOpen, tutorial]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!tutorial) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.85)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-5xl bg-[#3E2468] rounded-2xl border border-white/20 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              aria-label="Close"
            >
              <X size={24} />
            </button>

            {/* Video Player */}
            <div className="relative aspect-video bg-black">
              <iframe
                src={tutorial.video_url}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={tutorial.title}
              />
            </div>

            {/* Tutorial Info */}
            <div className="p-6">
              {/* Title */}
              <h2 className="text-2xl font-bold text-white mb-3">
                {tutorial.title}
              </h2>

              {/* Meta Info */}
              <div className="flex gap-3 mb-4 flex-wrap">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(
                    tutorial.difficulty_level
                  )}`}
                >
                  {tutorial.difficulty_level.charAt(0).toUpperCase() +
                    tutorial.difficulty_level.slice(1)}
                </span>
                <span className="px-3 py-1 bg-white/10 rounded-full text-white/80 text-xs font-semibold">
                  {getCategoryName(tutorial.category)}
                </span>
                <span className="px-3 py-1 bg-white/10 rounded-full text-white/80 text-xs font-semibold">
                  Duration: {tutorial.duration_minutes} min
                </span>
              </div>

              {/* Description */}
              <p className="text-white/70 leading-relaxed">
                {tutorial.description}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
