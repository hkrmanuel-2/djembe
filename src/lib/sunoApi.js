// Suno API integration (via server-side proxy)
// API key is kept server-side in /api/generate* endpoints

/**
 * Generate music using Suno API via server proxy
 * @param {string} prompt - Music generation prompt
 * @param {number} bpm - Target BPM for the music
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function generateMusic(prompt, bpm) {
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: `${prompt} at ${bpm} BPM`,
                bpm,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `API error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success || !data.taskId) {
            throw new Error(data.error || 'No task ID received');
        }

        // Poll for completion
        return await pollForCompletion(data.taskId);
    } catch (error) {
        console.error('Suno API error:', error);
        return { success: false, error: error.message || 'Failed to generate music' };
    }
}

/**
 * Poll for music generation completion via server proxy
 * @param {string} taskId - Task ID from generation request
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
async function pollForCompletion(taskId, maxAttempts = 60) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            const response = await fetch(`/api/generate-status?taskId=${taskId}`);

            if (!response.ok) {
                throw new Error(`Polling error: ${response.status}`);
            }

            const data = await response.json();

            if (data.status === 'done' && data.audioUrl) {
                return {
                    success: true,
                    data: { audio_url: data.audioUrl, audioId: data.audioId },
                };
            }

            if (data.status === 'failed') {
                return { success: false, error: data.error || 'Generation failed' };
            }

            // Still processing - wait with backoff
            const waitTime = Math.min(1000 + (attempt * 500), 5000);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        } catch (error) {
            if (attempt === maxAttempts - 1) {
                return { success: false, error: error.message || 'Polling timeout' };
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    return { success: false, error: 'Generation timeout - please try again' };
}

/**
 * Get remaining API credits via server proxy
 * @returns {Promise<{success: boolean, credits?: number, error?: string}>}
 */
export async function getRemainingCredits() {
    try {
        const response = await fetch('/api/generate-credits');

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        return { success: true, credits: data.credits || 0 };
    } catch (error) {
        console.error('Suno API credits error:', error);
        return { success: false, error: error.message || 'Failed to get credits' };
    }
}
