import { useState, useEffect } from 'react';
import { useStore } from '../../../store/useStore.js';
import { generateMusic, getRemainingCredits } from '../../../lib/sunoApi.js';
import { supabase } from '../../../lib/supabase.js';

export default function AILoopGenerator({ onLoopGenerated }) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [credits, setCredits] = useState(null);

  const projectBpm = useStore((state) => state.project.bpm);
  const loadLoops = useStore((state) => state.loadLoops);

  // Get API key from .env file
  const apiKey = import.meta.env.VITE_SUNO_API_KEY || '';

  // Check credits on mount if API key is available
  useEffect(() => {
    if (apiKey) {
      checkCredits(apiKey);
    }
  }, [apiKey]);

  const checkCredits = async (key) => {
    const result = await getRemainingCredits(key);
    if (result.success) {
      setCredits(result.credits);
    }
  };

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('suno_api_key', apiKey.trim());
      setShowApiKeyInput(false);
      checkCredits(apiKey.trim());
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    if (!apiKey) {
      setError('Suno API key not found. Please add VITE_SUNO_API_KEY to your .env file.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Generate music with Suno API
      const result = await generateMusic(prompt.trim(), projectBpm, apiKey);

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

      // Generate random colors for the loop
      const colors = [
        { bg: 'bg-blue-400', hover: 'hover:bg-blue-500', border: 'border-blue-600' },
        { bg: 'bg-green-400', hover: 'hover:bg-green-500', border: 'border-green-600' },
        { bg: 'bg-red-400', hover: 'hover:bg-red-500', border: 'border-red-600' },
        { bg: 'bg-yellow-400', hover: 'hover:bg-yellow-500', border: 'border-yellow-600' },
        { bg: 'bg-indigo-400', hover: 'hover:bg-indigo-500', border: 'border-indigo-600' },
      ];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      // Save loop to database
      const { data, error: dbError } = await supabase
        .from('loops')
        .insert([
          {
            name: loopName,
            url: audioUrl,
            icon: '🤖',
            color: randomColor.bg,
            hover_color: randomColor.hover,
            border: randomColor.border,
            bpm: projectBpm,
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
      await checkCredits(apiKey);

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
    <div className="w-[280px] border-r border-black p-6 bg-gradient-to-b from-purple-50 to-purple-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-black">AI LOOP GENERATOR</h2>
        {credits !== null && (
          <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded border border-gray-300">
            {credits} credits
          </span>
        )}
      </div>

      {!apiKey && (
        <div className="mb-4 p-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800 mb-2">
            <strong>Setup Required:</strong> Add VITE_SUNO_API_KEY to your .env file to generate AI loops.
          </p>
          <p className="text-xs text-yellow-700">
            Get your API key from{' '}
            <a
              href="https://sunoapi.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-semibold"
            >
              sunoapi.org
            </a>
          </p>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Prompt ({projectBpm} BPM)
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., upbeat electronic dance music, smooth jazz piano, energetic rock drums..."
          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm resize-none"
          rows={4}
          disabled={isGenerating}
        />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg">
          <p className="text-xs text-red-800">{error}</p>
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim()}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${
          isGenerating || !prompt.trim()
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-purple-600 hover:bg-purple-700 active:scale-95'
        }`}
      >
        {isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span>
            Generating...
          </span>
        ) : (
          '✨ Generate AI Loop'
        )}
      </button>

      <div className="mt-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800 font-semibold mb-1">💡 Tips:</p>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Describe the style and mood</li>
          <li>• Loops match your project BPM</li>
          <li>• Generated loops appear in library</li>
        </ul>
      </div>
    </div>
  );
}
