import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import CloudShader from "@/components/ui/cloud-shader";
import { Globe, Music, Save, Loader2, Check, ArrowLeft } from "lucide-react";
import { getVoiceSettings, updateVoiceSettings } from "@/lib/teacherApi";
import { useNavigate } from "react-router-dom";

// Preset options
const GENRE_OPTIONS = [
  "afrobeat",
  "jazz",
  "electronic",
  "hip-hop",
  "classical",
  "rock",
  "reggae",
  "funk",
  "world",
  "ambient",
];

const STYLE_OPTIONS = [
  "upbeat",
  "relaxed",
  "energetic",
  "chill",
  "intense",
  "groovy",
  "melodic",
  "rhythmic",
];

const MOOD_OPTIONS = [
  "happy",
  "calm",
  "intense",
  "dreamy",
  "playful",
  "focused",
  "inspiring",
  "mysterious",
];

const WORLD_OPTIONS = [
  { id: "world1", name: "Fireside World", emoji: "🔥" },
  { id: "world2", name: "Auditorium World", emoji: "🎭" },
];

export default function WorldsSettings() {
  const { userProfile } = useAuthStore();
  const navigate = useNavigate();

  const [selectedWorld, setSelectedWorld] = useState("world1");
  const [settings, setSettings] = useState({
    bpm: 120,
    genre: "afrobeat",
    style: "upbeat",
    mood: "happy",
    custom_prompt: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  // Load settings when world changes
  useEffect(() => {
    const loadSettings = async () => {
      if (!userProfile?.school_id) return;

      setIsLoading(true);
      const result = await getVoiceSettings(userProfile.school_id, selectedWorld);
      if (result.data) {
        setSettings({
          bpm: result.data.bpm || 120,
          genre: result.data.genre || "afrobeat",
          style: result.data.style || "upbeat",
          mood: result.data.mood || "happy",
          custom_prompt: result.data.custom_prompt || "",
        });
      }
      setIsLoading(false);
    };

    loadSettings();
  }, [userProfile?.school_id, selectedWorld]);

  // Handle save
  const handleSave = async () => {
    console.log("[WorldsSettings] Save clicked, userProfile:", userProfile);

    if (!userProfile?.school_id) {
      setError("No school ID found. Please contact support.");
      return;
    }

    // Get teacher_id - it might be named teacher_id or just use the user id
    const teacherId = userProfile.teacher_id || userProfile.id;
    if (!teacherId) {
      setError("No teacher ID found. Please contact support.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    console.log("[WorldsSettings] Saving settings:", {
      schoolId: userProfile.school_id,
      teacherId,
      settings,
      selectedWorld,
    });

    const result = await updateVoiceSettings(
      userProfile.school_id,
      teacherId,
      settings,
      selectedWorld
    );

    console.log("[WorldsSettings] Save result:", result);

    if (result.error) {
      setError(result.error);
    } else {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }

    setIsSaving(false);
  };

  // Handle BPM change
  const handleBpmChange = (value: number) => {
    const clamped = Math.min(200, Math.max(60, value));
    setSettings((prev) => ({ ...prev, bpm: clamped }));
  };

  if (isLoading) {
    return (
      <div
        className="flex w-full flex-col min-h-screen relative overflow-hidden"
        style={{ backgroundColor: "#1A2B4A" }}
      >
        <div className="absolute inset-0 z-0 pointer-events-none">
          <CloudShader speed={0.3} octaves={5} scale={2.5} className="w-full h-full opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#1A2B4A]/90 via-[#1A2B4A]/70 to-[#4A9B9B]/30" />
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div
              className="w-16 h-16 border-4 border-white/20 rounded-full animate-spin mx-auto mb-4"
              style={{ borderTopColor: "#8B5CF6" }}
            />
            <p className="text-lg text-white/70">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex w-full flex-col min-h-screen relative overflow-hidden"
      style={{ backgroundColor: "#1A2B4A", fontFamily: "'Outfit', sans-serif" }}
    >
      <div className="absolute inset-0 z-0 pointer-events-none">
        <CloudShader speed={0.3} octaves={5} scale={2.5} className="w-full h-full opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A2B4A]/90 via-[#1A2B4A]/70 to-[#8B5CF6]/20" />
      </div>

      <div className="relative z-10 min-h-screen px-6 py-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-3xl mx-auto"
        >
          {/* Back Button */}
          <motion.button
            variants={itemVariants}
            onClick={() => navigate("/students")}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </motion.button>

          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-10">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border mb-4"
              style={{ backgroundColor: "rgba(139, 92, 246, 0.2)", borderColor: "rgba(139, 92, 246, 0.3)" }}
            >
              <Globe size={16} style={{ color: "#8B5CF6" }} />
              <span className="text-sm font-medium text-white/90">3D Worlds</span>
            </div>

            <h1 className="text-5xl font-bold text-white mb-2">
              World <span style={{ color: "#8B5CF6" }}>Settings</span>
            </h1>
            <p className="text-xl text-white/60">
              Configure AI-generated music for student exploration worlds
            </p>
          </motion.div>

          {/* World Selector */}
          <motion.div
            variants={itemVariants}
            className="mb-6"
          >
            <label className="block text-base font-medium text-white mb-3">Select World</label>
            <div className="flex gap-3">
              {WORLD_OPTIONS.map((world) => (
                <button
                  key={world.id}
                  onClick={() => setSelectedWorld(world.id)}
                  className={`
                    flex-1 px-4 py-4 rounded-xl flex items-center gap-3 transition-all
                    ${selectedWorld === world.id
                      ? "bg-purple-500/30 border-2 border-purple-400/70 shadow-lg shadow-purple-500/20"
                      : "bg-white/5 border border-white/10 hover:bg-white/10"
                    }
                  `}
                >
                  <span className="text-2xl">{world.emoji}</span>
                  <span className={`font-medium ${selectedWorld === world.id ? "text-purple-200" : "text-white/70"}`}>
                    {world.name}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Settings Card */}
          <motion.div
            variants={itemVariants}
            className="rounded-2xl backdrop-blur-md border p-8"
            style={{
              backgroundColor: "rgba(255,255,255,0.08)",
              borderColor: "rgba(255,255,255,0.15)",
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/10">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Music className="text-purple-400" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Music Generation</h3>
                <p className="text-sm text-white/60">
                  Settings for {WORLD_OPTIONS.find(w => w.id === selectedWorld)?.name || "this world"}
                </p>
              </div>
            </div>

            <div className="space-y-8">
              {/* BPM Slider */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-base font-medium text-white">Tempo (BPM)</label>
                  <span className="text-lg font-mono text-purple-300 bg-purple-500/20 px-3 py-1 rounded-lg">
                    {settings.bpm}
                  </span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="200"
                  value={settings.bpm}
                  onChange={(e) => handleBpmChange(parseInt(e.target.value))}
                  className="w-full h-3 bg-white/10 rounded-lg appearance-none cursor-pointer
                           [&::-webkit-slider-thumb]:appearance-none
                           [&::-webkit-slider-thumb]:w-6
                           [&::-webkit-slider-thumb]:h-6
                           [&::-webkit-slider-thumb]:rounded-full
                           [&::-webkit-slider-thumb]:bg-purple-500
                           [&::-webkit-slider-thumb]:cursor-pointer
                           [&::-webkit-slider-thumb]:shadow-lg"
                />
                <div className="flex justify-between text-sm text-white/40 mt-2">
                  <span>60 (Slow)</span>
                  <span>130 (Medium)</span>
                  <span>200 (Fast)</span>
                </div>
              </div>

              {/* Genre */}
              <div>
                <label className="block text-base font-medium text-white mb-3">Genre</label>
                <div className="flex flex-wrap gap-2">
                  {GENRE_OPTIONS.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => setSettings((prev) => ({ ...prev, genre }))}
                      className={`
                        px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize
                        ${settings.genre === genre
                          ? "bg-purple-500/40 text-purple-200 border-2 border-purple-400/70 shadow-lg shadow-purple-500/20"
                          : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white/80"
                        }
                      `}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style */}
              <div>
                <label className="block text-base font-medium text-white mb-3">Style</label>
                <div className="flex flex-wrap gap-2">
                  {STYLE_OPTIONS.map((style) => (
                    <button
                      key={style}
                      onClick={() => setSettings((prev) => ({ ...prev, style }))}
                      className={`
                        px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize
                        ${settings.style === style
                          ? "bg-blue-500/40 text-blue-200 border-2 border-blue-400/70 shadow-lg shadow-blue-500/20"
                          : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white/80"
                        }
                      `}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mood */}
              <div>
                <label className="block text-base font-medium text-white mb-3">Mood</label>
                <div className="flex flex-wrap gap-2">
                  {MOOD_OPTIONS.map((mood) => (
                    <button
                      key={mood}
                      onClick={() => setSettings((prev) => ({ ...prev, mood }))}
                      className={`
                        px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize
                        ${settings.mood === mood
                          ? "bg-green-500/40 text-green-200 border-2 border-green-400/70 shadow-lg shadow-green-500/20"
                          : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white/80"
                        }
                      `}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom prompt */}
              <div>
                <label className="block text-base font-medium text-white mb-3">
                  Custom Additions <span className="text-white/40 font-normal">(optional)</span>
                </label>
                <textarea
                  value={settings.custom_prompt}
                  onChange={(e) => setSettings((prev) => ({ ...prev, custom_prompt: e.target.value }))}
                  placeholder="Add specific instruments, sounds, or descriptions... e.g., 'with djembe drums and kalimba'"
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl
                           text-white placeholder:text-white/30 text-base resize-none
                           focus:outline-none focus:border-purple-400/50 focus:bg-white/8
                           transition-colors"
                  rows={3}
                />
              </div>

              {/* Preview prompt */}
              <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-400/20">
                <p className="text-sm text-purple-300 mb-2 font-medium">Music generation settings:</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-white/60">Genre:</div>
                  <div className="text-white/90 capitalize">{settings.genre}</div>
                  <div className="text-white/60">Tempo:</div>
                  <div className="text-white/90">{settings.bpm} BPM</div>
                  <div className="text-white/60">Style:</div>
                  <div className="text-white/90 capitalize">{settings.style}</div>
                  <div className="text-white/60">Mood:</div>
                  <div className="text-white/90 capitalize">{settings.mood}</div>
                  {settings.custom_prompt && (
                    <>
                      <div className="text-white/60">Custom:</div>
                      <div className="text-white/90">{settings.custom_prompt}</div>
                    </>
                  )}
                </div>
                <p className="text-xs text-white/40 mt-3">
                  Generates kid-friendly, educational rhythms with these settings
                </p>
              </div>

              {/* Error message */}
              {error && (
                <div className="p-4 bg-red-500/20 border border-red-400/30 rounded-xl">
                  <p className="text-base text-red-300">{error}</p>
                </div>
              )}

              {/* Save button */}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`
                  w-full py-4 rounded-xl font-semibold text-base
                  flex items-center justify-center gap-3 transition-all
                  ${isSaving
                    ? "bg-white/10 text-white/50 cursor-not-allowed"
                    : saveSuccess
                    ? "bg-green-500/30 text-green-300 border-2 border-green-400/50"
                    : "bg-purple-500/30 text-purple-200 border-2 border-purple-400/50 hover:bg-purple-500/40 hover:shadow-lg hover:shadow-purple-500/20"
                  }
                `}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : saveSuccess ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Saved Successfully!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Settings</span>
                  </>
                )}
              </button>

              {/* Info note */}
              <p className="text-sm text-white/40 text-center">
                These settings will be used to generate music for students in 3D Worlds.
                Changes take effect on the next student session.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
