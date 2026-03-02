import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { Globe, Music, Save, Loader2, Check, ArrowLeft } from "lucide-react";
import { getVoiceSettings, updateVoiceSettings } from "@/lib/teacherApi";
import { useNavigate } from "react-router-dom";
import { logger } from "@/lib/logger";

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
    logger.log("[WorldsSettings] Save clicked, userProfile:", userProfile);

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

    logger.log("[WorldsSettings] Saving settings:", {
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

    logger.log("[WorldsSettings] Save result:", result);

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
        style={{
          background: 'linear-gradient(180deg, #F3EEFF 0%, #E8DFFF 50%, #F8F5FF 100%)',
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div
              className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4"
              style={{ borderColor: '#E8DFFF', borderTopColor: '#D97746' }}
            />
            <p className="text-lg text-gray-500">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex w-full flex-col min-h-screen relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #F3EEFF 0%, #E8DFFF 50%, #F8F5FF 100%)',
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <div className="relative z-10 min-h-screen px-6 py-8">
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
            className="flex items-center gap-2 hover:opacity-70 mb-6 transition-colors"
            style={{ color: '#3E2468' }}
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </motion.button>

          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-10">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-4"
              style={{ backgroundColor: 'rgba(123, 91, 168, 0.1)', borderColor: '#E8DFFF' }}
            >
              <Globe size={16} style={{ color: '#7B5BA8' }} />
              <span className="text-sm font-medium" style={{ color: '#3E2468' }}>3D Worlds</span>
            </div>

            <h1 className="text-5xl font-bold mb-2" style={{ color: '#3E2468', fontFamily: "'Fredoka', sans-serif" }}>
              World <span style={{ color: '#7B5BA8' }}>Settings</span>
            </h1>
            <p className="text-xl text-gray-500">
              Configure AI-generated music for student exploration worlds
            </p>
          </motion.div>

          {/* World Selector */}
          <motion.div
            variants={itemVariants}
            className="mb-6"
          >
            <label className="block text-base font-medium mb-3" style={{ color: '#3E2468', fontFamily: "'Fredoka', sans-serif" }}>Select World</label>
            <div className="flex gap-3">
              {WORLD_OPTIONS.map((world) => (
                <button
                  key={world.id}
                  onClick={() => setSelectedWorld(world.id)}
                  className="flex-1 px-4 py-4 rounded-xl flex items-center gap-3 transition-all border-2"
                  style={
                    selectedWorld === world.id
                      ? {
                          backgroundColor: 'rgba(123, 91, 168, 0.1)',
                          borderColor: '#7B5BA8',
                          boxShadow: '0 4px 12px rgba(123, 91, 168, 0.15)',
                        }
                      : {
                          backgroundColor: '#FFFFFF',
                          borderColor: '#E8DFFF',
                        }
                  }
                >
                  <span className="text-2xl">{world.emoji}</span>
                  <span
                    className="font-medium"
                    style={{ color: selectedWorld === world.id ? '#7B5BA8' : '#6B7280' }}
                  >
                    {world.name}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Settings Card */}
          <motion.div
            variants={itemVariants}
            className="bg-white shadow-md rounded-2xl border-2 p-8"
            style={{ borderColor: '#E8DFFF' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-8 pb-6 border-b" style={{ borderColor: '#E8DFFF' }}>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(123, 91, 168, 0.1)' }}
              >
                <Music style={{ color: '#7B5BA8' }} size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold" style={{ color: '#3E2468', fontFamily: "'Fredoka', sans-serif" }}>Music Generation</h3>
                <p className="text-sm text-gray-500">
                  Settings for {WORLD_OPTIONS.find(w => w.id === selectedWorld)?.name || "this world"}
                </p>
              </div>
            </div>

            <div className="space-y-8">
              {/* BPM Slider */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-base font-medium" style={{ color: '#3E2468', fontFamily: "'Fredoka', sans-serif" }}>Tempo (BPM)</label>
                  <span
                    className="text-lg font-mono px-3 py-1 rounded-lg"
                    style={{ color: '#7B5BA8', backgroundColor: 'rgba(123, 91, 168, 0.1)' }}
                  >
                    {settings.bpm}
                  </span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="200"
                  value={settings.bpm}
                  onChange={(e) => handleBpmChange(parseInt(e.target.value))}
                  className="w-full h-3 rounded-lg appearance-none cursor-pointer
                           [&::-webkit-slider-thumb]:appearance-none
                           [&::-webkit-slider-thumb]:w-6
                           [&::-webkit-slider-thumb]:h-6
                           [&::-webkit-slider-thumb]:rounded-full
                           [&::-webkit-slider-thumb]:cursor-pointer
                           [&::-webkit-slider-thumb]:shadow-lg"
                  style={{
                    background: '#E8DFFF',
                    // @ts-expect-error -- slider thumb color via CSS custom property
                    '--tw-slider-thumb-bg': '#7B5BA8',
                  } as React.CSSProperties}
                />
                <style>{`
                  input[type="range"]::-webkit-slider-thumb {
                    background-color: #7B5BA8 !important;
                  }
                  input[type="range"]::-moz-range-thumb {
                    background-color: #7B5BA8 !important;
                    border: none;
                    width: 1.5rem;
                    height: 1.5rem;
                    border-radius: 9999px;
                    cursor: pointer;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                  }
                `}</style>
                <div className="flex justify-between text-sm text-gray-400 mt-2">
                  <span>60 (Slow)</span>
                  <span>130 (Medium)</span>
                  <span>200 (Fast)</span>
                </div>
              </div>

              {/* Genre */}
              <div>
                <label className="block text-base font-medium mb-3" style={{ color: '#3E2468', fontFamily: "'Fredoka', sans-serif" }}>Genre</label>
                <div className="flex flex-wrap gap-2">
                  {GENRE_OPTIONS.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => setSettings((prev) => ({ ...prev, genre }))}
                      className="px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize border-2"
                      style={
                        settings.genre === genre
                          ? {
                              backgroundColor: 'rgba(217, 119, 70, 0.1)',
                              color: '#D97746',
                              borderColor: '#D97746',
                            }
                          : {
                              backgroundColor: '#FFFFFF',
                              color: '#6B7280',
                              borderColor: '#E8DFFF',
                            }
                      }
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style */}
              <div>
                <label className="block text-base font-medium mb-3" style={{ color: '#3E2468', fontFamily: "'Fredoka', sans-serif" }}>Style</label>
                <div className="flex flex-wrap gap-2">
                  {STYLE_OPTIONS.map((style) => (
                    <button
                      key={style}
                      onClick={() => setSettings((prev) => ({ ...prev, style }))}
                      className="px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize border-2"
                      style={
                        settings.style === style
                          ? {
                              backgroundColor: 'rgba(66, 201, 201, 0.1)',
                              color: '#42C9C9',
                              borderColor: '#42C9C9',
                            }
                          : {
                              backgroundColor: '#FFFFFF',
                              color: '#6B7280',
                              borderColor: '#E8DFFF',
                            }
                      }
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mood */}
              <div>
                <label className="block text-base font-medium mb-3" style={{ color: '#3E2468', fontFamily: "'Fredoka', sans-serif" }}>Mood</label>
                <div className="flex flex-wrap gap-2">
                  {MOOD_OPTIONS.map((mood) => (
                    <button
                      key={mood}
                      onClick={() => setSettings((prev) => ({ ...prev, mood }))}
                      className="px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize border-2"
                      style={
                        settings.mood === mood
                          ? {
                              backgroundColor: 'rgba(74, 186, 110, 0.1)',
                              color: '#4ABA6E',
                              borderColor: '#4ABA6E',
                            }
                          : {
                              backgroundColor: '#FFFFFF',
                              color: '#6B7280',
                              borderColor: '#E8DFFF',
                            }
                      }
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom prompt */}
              <div>
                <label className="block text-base font-medium mb-3" style={{ color: '#3E2468', fontFamily: "'Fredoka', sans-serif" }}>
                  Custom Additions <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={settings.custom_prompt}
                  onChange={(e) => setSettings((prev) => ({ ...prev, custom_prompt: e.target.value }))}
                  placeholder="Add specific instruments, sounds, or descriptions... e.g., 'with djembe drums and kalimba'"
                  className="w-full px-4 py-4 rounded-xl text-base resize-none transition-colors focus:outline-none"
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '2px solid #E8DFFF',
                    color: '#3E2468',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#7B5BA8';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(123, 91, 168, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#E8DFFF';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  rows={3}
                />
              </div>

              {/* Preview prompt */}
              <div
                className="p-4 rounded-xl border-2"
                style={{ backgroundColor: 'rgba(123, 91, 168, 0.05)', borderColor: '#E8DFFF' }}
              >
                <p className="text-sm mb-2 font-medium" style={{ color: '#7B5BA8' }}>Music generation settings:</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-500">Genre:</div>
                  <div className="capitalize" style={{ color: '#3E2468' }}>{settings.genre}</div>
                  <div className="text-gray-500">Tempo:</div>
                  <div style={{ color: '#3E2468' }}>{settings.bpm} BPM</div>
                  <div className="text-gray-500">Style:</div>
                  <div className="capitalize" style={{ color: '#3E2468' }}>{settings.style}</div>
                  <div className="text-gray-500">Mood:</div>
                  <div className="capitalize" style={{ color: '#3E2468' }}>{settings.mood}</div>
                  {settings.custom_prompt && (
                    <>
                      <div className="text-gray-500">Custom:</div>
                      <div style={{ color: '#3E2468' }}>{settings.custom_prompt}</div>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  Generates kid-friendly, educational rhythms with these settings
                </p>
              </div>

              {/* Error message */}
              {error && (
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '2px solid rgba(239, 68, 68, 0.3)' }}>
                  <p className="text-base" style={{ color: '#DC2626' }}>{error}</p>
                </div>
              )}

              {/* Save button */}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-3 transition-all"
                style={
                  isSaving
                    ? {
                        backgroundColor: '#E8DFFF',
                        color: '#9CA3AF',
                        cursor: 'not-allowed',
                      }
                    : saveSuccess
                    ? {
                        backgroundColor: 'rgba(74, 186, 110, 0.15)',
                        color: '#4ABA6E',
                        border: '2px solid #4ABA6E',
                      }
                    : {
                        background: 'linear-gradient(135deg, #D97746 0%, #E6B84D 100%)',
                        color: '#FFFFFF',
                        boxShadow: '0 4px 12px rgba(217, 119, 70, 0.3)',
                      }
                }
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
              <p className="text-sm text-gray-400 text-center">
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
