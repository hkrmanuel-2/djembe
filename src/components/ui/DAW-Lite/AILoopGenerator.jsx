import { useState, useEffect } from 'react';
import { useStore } from '../../../store/useStore.js';
import { useAuthStore } from '../../../store/useAuthStore.js';
import { generateMusic, getRemainingCredits } from '../../../lib/sunoApi.js';
import { supabase } from '../../../lib/supabase.js';

export default function AILoopGenerator({ onLoopGenerated }) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [credits, setCredits] = useState(null);

  const projectBpm = useStore((state) => state.project.bpm);
  const loadLoops = useStore((state) => state.loadLoops);
  const userProfile = useAuthStore((state) => state.userProfile);

  // Check credits on mount
  useEffect(() => {
    checkCredits();
  }, []);

  const checkCredits = async () => {
    const result = await getRemainingCredits();
    if (result.success) {
      setCredits(result.credits);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Generate music via server-side Suno proxy
      const result = await generateMusic(prompt.trim(), projectBpm);

      if (!result.success) {
        setError(result.error || 'Failed to generate music');
        setIsGenerating(false);
        return;
      }

      const generatedMusic = result.data;

      // Get audio URL
      const audioUrl = generatedMusic.audio_url || generatedMusic.url;
      if (!audioUrl) {
        setError('Generated music has no audio URL');
        setIsGenerating(false);
        return;
      }

      // Create a name from the prompt (truncate if too long)
      const loopName = prompt.trim().substring(0, 50) || 'AI Generated Loop';

      // Save loop to database
      const { data, error: dbError } = await supabase
        .from('loops')
        .insert([
          {
            name: loopName,
            url: audioUrl,
            icon: '🤖',
            is_ai_generated: true,
            bpm: projectBpm,
            created_by: userProfile?.teacher_id || userProfile?.student_id || null,
          },
        ])
        .select()
        .single();

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      // Reload loops to include the new one
      await loadLoops();

      // Clear prompt
      setPrompt('');

      // Update credits
      await checkCredits();

      // Notify parent component
      if (onLoopGenerated) {
        onLoopGenerated(data);
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message || 'Failed to generate and save loop');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-[240px] border-r border-white/10 p-3 bg-white/5 backdrop-blur-sm flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h2 className="text-lg font-bold text-white">AI GEN</h2>
        {credits !== null && (
          <span className="text-xs text-white/70 bg-white/10 px-2 py-1 rounded border border-white/20">
            {credits}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
        <div className="mb-3 flex-shrink-0">
          <label className="block text-xs font-semibold text-white/70 mb-1">
            Prompt ({projectBpm} BPM)
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="upbeat electronic..."
            className="w-full px-2 py-2 border border-white/20 rounded-lg text-xs resize-none bg-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-white/40"
            rows={3}
            disabled={isGenerating}
          />
        </div>

        {error && (
          <div className="mb-3 p-2 bg-red-500/20 border border-red-400/30 rounded-lg backdrop-blur-sm flex-shrink-0">
            <p className="text-[10px] text-red-200">{error}</p>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className={`w-full py-2 px-3 rounded-lg font-semibold text-sm text-white transition-all shadow-lg flex-shrink-0 ${
            isGenerating || !prompt.trim()
              ? 'bg-white/10 cursor-not-allowed'
              : 'bg-purple-600/80 hover:bg-purple-600 active:scale-95'
          }`}
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span>
              <span className="text-xs">Gen...</span>
            </span>
          ) : (
            '✨ Generate'
          )}
        </button>

        <div className="mt-3 p-2 bg-blue-500/20 border border-blue-400/30 rounded-lg backdrop-blur-sm flex-shrink-0">
          <p className="text-xs text-blue-300 font-semibold mb-1">💡 Tips:</p>
          <ul className="text-[10px] text-blue-200/80 space-y-0.5">
            <li>• Describe style</li>
            <li>• Matches BPM</li>
            <li>• Shows in library</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
