import { motion } from "framer-motion";
import { getDifficultyColor, getCategoryName } from "@/lib/tutorialsApi";
import { Play } from "lucide-react";

interface TutorialCardProps {
  tutorial: {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string;
    duration_minutes: number;
    difficulty_level: string;
    category: string;
  };
  onClick: () => void;
}

export default function TutorialCard({ tutorial, onClick }: TutorialCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-2xl border-2 overflow-hidden cursor-pointer transition-all group"
      style={{ borderColor: "#E8DFFF", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        <img
          src={tutorial.thumbnail_url}
          alt={tutorial.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            e.currentTarget.parentElement!.style.background =
              "linear-gradient(135deg, #7B5BA8 0%, #D97746 100%)";
          }}
        />

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all"
            style={{
              background: "rgba(255,255,255,0.95)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            }}
          >
            <Play
              size={24}
              fill="#3E2468"
              stroke="#3E2468"
              className="ml-1"
            />
          </div>
        </div>

        {/* Duration Badge */}
        <div
          className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg text-xs font-bold"
          style={{ background: "rgba(0,0,0,0.7)", color: "white" }}
        >
          {tutorial.duration_minutes} min
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3
          className="font-bold text-base mb-1.5 line-clamp-2"
          style={{ color: "#3E2468", fontFamily: "'Fredoka', sans-serif" }}
        >
          {tutorial.title}
        </h3>

        {/* Description */}
        <p className="text-gray-400 text-sm mb-3 line-clamp-2 leading-relaxed">
          {tutorial.description}
        </p>

        {/* Badges */}
        <div className="flex gap-2 flex-wrap">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(
              tutorial.difficulty_level
            )}`}
          >
            {tutorial.difficulty_level.charAt(0).toUpperCase() +
              tutorial.difficulty_level.slice(1)}
          </span>
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: "#F3EEFF", color: "#7B5BA8" }}
          >
            {getCategoryName(tutorial.category)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
