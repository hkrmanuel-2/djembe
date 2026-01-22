import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Music, Save, Loader2, Check } from "lucide-react";
import { getVoiceSettings, updateVoiceSettings } from "../../lib/teacherApi";

interface VoicesSettingsProps {
  schoolId: string;
  teacherId: string;
}

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

export default function VoicesSettings({ schoolId, teacherId }: VoicesSettingsProps) {
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

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      const result = await getVoiceSettings(schoolId);
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

    if (schoolId) {
      loadSettings();
    }
  }, [schoolId]);

  // Handle save
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    const result = await updateVoiceSettings(schoolId, teacherId, settings);

    if (result.error) {
      setError(result.error);
    } else {
      setSaveSuccess(true);
      // Clear success after 3 seconds
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
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      className="bg-white/5 rounded-xl border border-white/10 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
          <Music className="text-purple-400" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">3D World Music</h3>
          <p className="text-sm text-white/60">Configure AI-generated music for student worlds</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* BPM Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-white/80">Tempo (BPM)</label>
            <span className="text-sm font-mono text-purple-300">{settings.bpm}</span>
          </div>
          <input
            type="range"
            min="60"
            max="200"
            value={settings.bpm}
            onChange={(e) => handleBpmChange(parseInt(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-4
                     [&::-webkit-slider-thumb]:h-4
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-purple-500
                     [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <div className="flex justify-between text-xs text-white/40 mt-1">
            <span>60</span>
            <span>200</span>
          </div>
        </div>

        {/* Genre */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">Genre</label>
          <div className="flex flex-wrap gap-2">
            {GENRE_OPTIONS.map((genre) => (
              <button
                key={genre}
                onClick={() => setSettings((prev) => ({ ...prev, genre }))}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                  ${settings.genre === genre
                    ? "bg-purple-500/30 text-purple-300 border border-purple-400/50"
                    : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
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
          <label className="block text-sm font-medium text-white/80 mb-2">Style</label>
          <div className="flex flex-wrap gap-2">
            {STYLE_OPTIONS.map((style) => (
              <button
                key={style}
                onClick={() => setSettings((prev) => ({ ...prev, style }))}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                  ${settings.style === style
                    ? "bg-blue-500/30 text-blue-300 border border-blue-400/50"
                    : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
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
          <label className="block text-sm font-medium text-white/80 mb-2">Mood</label>
          <div className="flex flex-wrap gap-2">
            {MOOD_OPTIONS.map((mood) => (
              <button
                key={mood}
                onClick={() => setSettings((prev) => ({ ...prev, mood }))}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                  ${settings.mood === mood
                    ? "bg-green-500/30 text-green-300 border border-green-400/50"
                    : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
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
          <label className="block text-sm font-medium text-white/80 mb-2">
            Custom Additions (optional)
          </label>
          <textarea
            value={settings.custom_prompt}
            onChange={(e) => setSettings((prev) => ({ ...prev, custom_prompt: e.target.value }))}
            placeholder="Add specific instruments, sounds, or descriptions..."
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg
                     text-white placeholder:text-white/30 text-sm resize-none
                     focus:outline-none focus:border-purple-400/50"
            rows={2}
          />
        </div>

        {/* Preview prompt */}
        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
          <p className="text-xs text-white/40 mb-1">Generated prompt preview:</p>
          <p className="text-sm text-white/70 italic">
            "{settings.genre}, {settings.style}, {settings.mood} mood, at {settings.bpm} BPM
            {settings.custom_prompt ? `, ${settings.custom_prompt}` : ""}"
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-400/30 rounded-lg">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`
            w-full py-3 rounded-lg font-semibold text-sm
            flex items-center justify-center gap-2 transition-all
            ${isSaving
              ? "bg-white/10 text-white/50 cursor-not-allowed"
              : saveSuccess
              ? "bg-green-500/30 text-green-300 border border-green-400/50"
              : "bg-purple-500/30 text-purple-300 border border-purple-400/50 hover:bg-purple-500/40"
            }
          `}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : saveSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </>
          )}
        </button>

        {/* Info note */}
        <p className="text-xs text-white/40 text-center">
          These settings will be used to generate music for students in 3D Worlds.
          Changes take effect on the next student session.
        </p>
      </div>
    </motion.div>
  );
}
