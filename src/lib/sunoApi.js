// Suno API integration
// Documentation: https://docs.sunoapi.org/

const SUNO_API_BASE_URL = 'https://api.sunoapi.org';

/**
 * Generate music using Suno API
 * @param {string} prompt - Music generation prompt
 * @param {number} bpm - Target BPM for the music
 * @param {string} apiKey - Suno API key
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function generateMusic(prompt, bpm, apiKey) {
    if (!apiKey) {
        return { success: false, error: 'Suno API key is required' };
    }

    try {
        // Generate music with prompt and BPM
        // According to Suno API docs: https://docs.sunoapi.org/
        const response = await fetch(`${SUNO_API_BASE_URL}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                prompt: `${prompt} at ${bpm} BPM`,
                model: 'v5', // Use latest model
                make_instrumental: true,
                wait_audio: false, // We'll poll for completion
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API error: ${response.status}`);
        }

        const data = await response.json();

        // Handle different response formats
        // Check for task_id or ids array
        const taskId = data.task_id || (data.ids && data.ids[0]) || data.id;

        if (taskId) {
            // Poll for completion
            return await pollForCompletion(taskId, apiKey);
        }

        // If audio_url is already present, return immediately
        if (data.audio_url || data.url || data.audioUrl) {
            return {
                success: true,
                data: {
                    ...data,
                    audio_url: data.audio_url || data.url || data.audioUrl
                }
            };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Suno API error:', error);
        return { success: false, error: error.message || 'Failed to generate music' };
    }
}

/**
 * Poll for music generation completion
 * @param {string} taskId - Task ID from generation request
 * @param {string} apiKey - Suno API key
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
async function pollForCompletion(taskId, apiKey, maxAttempts = 60) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            // Use GET endpoint to check status
            const response = await fetch(`${SUNO_API_BASE_URL}/get?ids=${taskId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Polling error: ${response.status}`);
            }

            const data = await response.json();

            // Check if generation is complete
            // Response format may vary, check for common patterns
            let task = null;
            if (data.data && Array.isArray(data.data) && data.data[0]) {
                task = data.data[0];
            } else if (data.id) {
                task = data;
            }

            if (task) {
                // Check various possible status fields
                const status = task.status || task.state || task.progress;
                const audioUrl = task.audio_url || task.url || task.audioUrl;

                if ((status === 'completed' || status === 'done' || status === 100) && audioUrl) {
                    return { success: true, data: { ...task, audio_url: audioUrl } };
                }
                if (status === 'failed' || status === 'error') {
                    return { success: false, error: task.error || 'Music generation failed' };
                }
            }

            // Wait before next poll (exponential backoff, max 5 seconds)
            const waitTime = Math.min(1000 + (attempt * 500), 5000);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        } catch (error) {
            if (attempt === maxAttempts - 1) {
                return { success: false, error: error.message || 'Polling timeout' };
            }
            // Wait a bit before retrying on error
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    return { success: false, error: 'Generation timeout - please try again' };
}

/**
 * Get remaining API credits
 * @param {string} apiKey - Suno API key
 * @returns {Promise<{success: boolean, credits?: number, error?: string}>}
 */
export async function getRemainingCredits(apiKey) {
    if (!apiKey) {
        return { success: false, error: 'Suno API key is required' };
    }

    try {
        const response = await fetch(`${SUNO_API_BASE_URL}/get_credits`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
        });

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
