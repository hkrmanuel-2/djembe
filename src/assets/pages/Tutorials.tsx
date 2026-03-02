import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { getTutorials, getCategoryName } from "@/lib/tutorialsApi";
import TutorialCard from "@/components/tutorials/TutorialCard";
import VideoPlayerModal from "@/components/tutorials/VideoPlayerModal";
import { Search } from "lucide-react";
import { logger } from "@/lib/logger";

interface Tutorial {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  category: string;
  target_audience: string;
  difficulty_level: string;
  duration_minutes: number;
}

export default function Tutorials() {
  const { userType } = useAuthStore();
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [filteredTutorials, setFilteredTutorials] = useState<Tutorial[]>([]);

  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [showSearch, setShowSearch] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load tutorials on mount
  useEffect(() => {
    loadTutorials();
  }, [userType]);

  // Apply filters when tutorials or filter values change
  useEffect(() => {
    applyFilters();
  }, [tutorials, searchQuery, selectedCategory, selectedDifficulty]);

  const loadTutorials = async () => {
    setError(null);
    try {
      const result = await getTutorials({
        targetAudience: userType,
      });

      if (result.error) {
        console.error("Tutorials API error:", result.error);
        setError(result.error);
      }

      logger.log("Tutorials loaded:", result.data?.length || 0, "tutorials", result.data);
      setTutorials(result.data || []);
    } catch (error: any) {
      console.error("Error loading tutorials:", error);
      setError(error.message || "Failed to load tutorials");
    }
  };

  const applyFilters = () => {
    let filtered = [...tutorials];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((t) => t.category === selectedCategory);
    }

    // Difficulty filter
    if (selectedDifficulty !== "all") {
      filtered = filtered.filter((t) => t.difficulty_level === selectedDifficulty);
    }

    setFilteredTutorials(filtered);
  };

  const handleTutorialClick = (tutorial: Tutorial) => {
    setSelectedTutorial(tutorial);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedTutorial(null), 300);
  };

  // Group tutorials by category
  const groupedTutorials = filteredTutorials.reduce((acc, tutorial) => {
    if (!acc[tutorial.category]) {
      acc[tutorial.category] = [];
    }
    acc[tutorial.category].push(tutorial);
    return acc;
  }, {} as Record<string, Tutorial[]>);

  // Get unique categories and difficulties from all tutorials
  const categories = Array.from(new Set(tutorials.map((t) => t.category)));
  const difficulties = Array.from(
    new Set(tutorials.map((t) => t.difficulty_level))
  );

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
  };

  return (
    <div
      className="flex w-full flex-col min-h-screen relative overflow-x-hidden"
      style={{
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
      `}</style>

      {/* Fixed background */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: "linear-gradient(180deg, #F3EEFF 0%, #E8DFFF 50%, #F8F5FF 100%)",
        }}
      />

      {/* Gradient blobs */}
      <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(123, 91, 168, 0.18) 0%, transparent 70%)", animation: "float 8s ease-in-out infinite" }}
        />
        <div
          className="absolute top-[15%] -right-24 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(217, 119, 70, 0.14) 0%, transparent 70%)", animation: "floatSlow 10s ease-in-out infinite 2s" }}
        />
        <div
          className="absolute -bottom-20 left-[20%] w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(66, 201, 201, 0.12) 0%, transparent 70%)", animation: "float 9s ease-in-out infinite 1s" }}
        />
        <div
          className="absolute top-[55%] -left-16 w-[450px] h-[450px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(242, 201, 76, 0.10) 0%, transparent 70%)", animation: "floatSlow 7s ease-in-out infinite 3s" }}
        />
      </div>

      {/* Floating SVG Musical Elements */}
      <div className="fixed inset-0 z-[5] pointer-events-none overflow-hidden hidden sm:block">
        {/* Large eighth note - top left */}
        <div className="absolute top-24 left-4 md:left-12" style={{ animation: "float 4s ease-in-out infinite", opacity: 0.3 }}>
          <svg width="48" height="56" viewBox="0 0 24 30" fill="#E8627A">
            <path d="M9 3v20a5 5 0 1 1-2-4V3h2z" />
            <path d="M9 3c0 0 4-1 7 2s4 6 4 6" stroke="#E8627A" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </div>

        {/* Star - top right */}
        <div className="absolute top-16 right-6 md:right-14" style={{ animation: "floatSlow 4.5s ease-in-out infinite 0.5s", opacity: 0.3 }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="#F2C94C">
            <path d="M12 2l2.09 6.26L20.18 9l-5.09 3.74L16.18 19 12 15.27 7.82 19l1.09-6.26L3.82 9l6.09-.74z" />
          </svg>
        </div>

        {/* Quarter note - mid right */}
        <div className="absolute top-[45%] right-4 md:right-8" style={{ animation: "float 5s ease-in-out infinite 2s", opacity: 0.25 }}>
          <svg width="30" height="48" viewBox="0 0 16 32" fill="#42C9C9">
            <rect x="10" y="0" width="2.5" height="24" rx="1" />
            <ellipse cx="7" cy="26" rx="5.5" ry="4" />
          </svg>
        </div>

        {/* Double beamed notes - left side */}
        <div className="absolute top-[50%] left-4 md:left-8" style={{ animation: "floatSlow 5s ease-in-out infinite 1s", opacity: 0.25 }}>
          <svg width="50" height="50" viewBox="0 0 32 32" fill="#E8627A">
            <rect x="6" y="2" width="2.5" height="22" rx="1" />
            <rect x="22" y="6" width="2.5" height="18" rx="1" />
            <ellipse cx="5" cy="25" rx="4.5" ry="3.5" />
            <ellipse cx="21" cy="25" rx="4.5" ry="3.5" />
            <rect x="8" y="2" width="16.5" height="2.5" rx="1" />
            <rect x="8" y="7" width="16.5" height="2.5" rx="1" />
          </svg>
        </div>

        {/* Sparkle - upper center */}
        <div className="absolute top-32 left-[25%]" style={{ animation: "floatSlow 6s ease-in-out infinite 1.5s", opacity: 0.2 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#D97746">
            <path d="M12 0l1.8 8.2L22 12l-8.2 1.8L12 22l-1.8-8.2L2 12l8.2-1.8z" />
          </svg>
        </div>

        {/* Star - lower left */}
        <div className="absolute bottom-32 left-[12%]" style={{ animation: "floatSlow 5.5s ease-in-out infinite 4s", opacity: 0.25 }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#F2C94C">
            <path d="M12 2l2.09 6.26L20.18 9l-5.09 3.74L16.18 19 12 15.27 7.82 19l1.09-6.26L3.82 9l6.09-.74z" />
          </svg>
        </div>

        {/* Eighth note - bottom right */}
        <div className="absolute bottom-24 right-[18%]" style={{ animation: "float 4s ease-in-out infinite 3s", opacity: 0.22 }}>
          <svg width="38" height="44" viewBox="0 0 24 30" fill="#42C9C9">
            <path d="M9 3v20a5 5 0 1 1-2-4V3h2z" />
            <path d="M9 3c0 0 4-1 7 2s4 6 4 6" stroke="#42C9C9" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </div>

        {/* Star - right edge */}
        <div className="absolute top-[62%] right-4 md:right-10" style={{ animation: "floatSlow 4s ease-in-out infinite 2.5s", opacity: 0.2 }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="#F2C94C">
            <path d="M12 2l2.09 6.26L20.18 9l-5.09 3.74L16.18 19 12 15.27 7.82 19l1.09-6.26L3.82 9l6.09-.74z" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen px-4 sm:px-6 pt-16 pb-12">
        <div className="max-w-5xl mx-auto">
          {/* Title + Mascot + Filters Section */}
          <motion.div {...fadeIn} className="relative mb-6">
            {/* Title row with mascot */}
            <div className="flex items-center gap-4 mb-4">
              <div>
                <h1
                  className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight"
                  style={{ color: "#3E2468", fontFamily: "'Fredoka', sans-serif" }}
                >
                  TUTORIAL
                  <br />
                  <span style={{ color: "#3E2468" }}>ISLAND</span>
                </h1>
              </div>

              {/* Djembe mascot beside title */}
              <div className="hidden sm:block flex-shrink-0 -mt-4">
                <div
                  className="w-[100px] h-[120px] md:w-[130px] md:h-[150px] overflow-hidden"
                >
                  <img
                    src="/ui assets/djemb_fullbody.png"
                    alt="Djembe mascot"
                    className="w-[300%] h-[300%] max-w-none"
                    style={{
                      transform: "translate(-33.333%, -33.333%)",
                      filter: "drop-shadow(0 6px 16px rgba(0,0,0,0.15))",
                      imageRendering: "auto",
                    }}
                  />
                </div>
              </div>

              {/* Filter pills */}
              <div className="flex flex-wrap gap-2 ml-auto items-start">
                {/* Search pill */}
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all"
                  style={{
                    background: showSearch ? "#D97746" : "linear-gradient(135deg, #D97746, #E6945A)",
                    color: "white",
                    boxShadow: "0 2px 8px rgba(217, 119, 70, 0.3)",
                  }}
                >
                  <Search size={14} />
                  Search for Adventures
                </button>

                {/* Category pill */}
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="appearance-none bg-white px-5 py-2.5 rounded-full text-sm font-semibold cursor-pointer outline-none transition-all"
                    style={{
                      color: selectedCategory !== "all" ? "#D97746" : "#3E2468",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      border: selectedCategory !== "all" ? "2px solid #D97746" : "2px solid transparent",
                    }}
                  >
                    <option value="all">Category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {getCategoryName(category)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty pill */}
                <div className="relative">
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="appearance-none bg-white px-5 py-2.5 rounded-full text-sm font-semibold cursor-pointer outline-none transition-all"
                    style={{
                      color: selectedDifficulty !== "all" ? "#D97746" : "#3E2468",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      border: selectedDifficulty !== "all" ? "2px solid #D97746" : "2px solid transparent",
                    }}
                  >
                    <option value="all">Difficulty</option>
                    {difficulties.map((difficulty) => (
                      <option key={difficulty} value={difficulty}>
                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Search bar - expandable */}
            {showSearch && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <div className="relative max-w-md">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search tutorials..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full bg-white border-2 rounded-full pl-11 pr-4 py-2.5 text-gray-700 placeholder:text-gray-400 outline-none transition-all"
                    style={{ borderColor: "#E8DFFF" }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#7B5BA8";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#E8DFFF";
                    }}
                  />
                </div>
              </motion.div>
            )}

            <p className="text-gray-400 text-sm">
              Master Djembe step by step with our video guides
            </p>
          </motion.div>

          {/* Tutorial Background + Cards overlapping */}
          <div className="relative">
            {/* Background track image - sits behind the cards */}
            <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.1 }} className="pointer-events-none">
              <img
                src="/ui assets/tutorial_bg.png"
                alt=""
                className="w-full"
                style={{
                  filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.06))",
                }}
              />
              {/* Stars row */}
              <div className="flex items-center justify-center gap-2 mt-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill="#F2C94C" opacity={0.7}>
                    <path d="M12 2l2.09 6.26L20.18 9l-5.09 3.74L16.18 19 12 15.27 7.82 19l1.09-6.26L3.82 9l6.09-.74z" />
                  </svg>
                ))}
              </div>
            </motion.div>

            {/* Tutorial cards overlapping the bg image */}
            <div className="relative -mt-64 sm:-mt-80 md:-mt-[420px] lg:-mt-[550px] pt-4">
              {error ? (
                <div className="text-center py-16">
                  <p className="text-red-500 text-lg font-semibold mb-2">
                    Could not load tutorials
                  </p>
                  <p className="text-gray-400 text-sm">
                    {error}
                  </p>
                </div>
              ) : Object.keys(groupedTutorials).length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-500 text-lg">
                    No tutorials found matching your filters.
                  </p>
                </div>
              ) : (
                Object.entries(groupedTutorials).map(([category, categoryTutorials], idx) => (
                  <motion.div
                    key={category}
                    {...fadeIn}
                    transition={{ duration: 0.4, delay: 0.2 + idx * 0.1 }}
                    className="mb-10"
                  >
                    {/* Category Header */}
                    <h2
                      className="text-2xl font-bold mb-5 italic"
                      style={{ color: "#3E2468", fontFamily: "'Fredoka', sans-serif" }}
                    >
                      {getCategoryName(category)}
                    </h2>

                    {/* Tutorial Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {categoryTutorials.map((tutorial) => (
                        <TutorialCard
                          key={tutorial.id}
                          tutorial={tutorial}
                          onClick={() => handleTutorialClick(tutorial)}
                        />
                      ))}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      <VideoPlayerModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        tutorial={selectedTutorial}
      />
    </div>
  );
}
