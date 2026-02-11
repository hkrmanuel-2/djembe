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
        const response = await fetch(`${SUNO_API_BASE_URL}/api/v1/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                prompt: `${prompt} at ${bpm} BPM`,
                model: 'V4_5ALL',
                instrumental: true,
                customMode: true,
                callBackUrl: 'https://example.com/callback', // Required by API, we poll instead
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Suno generate response:', data);

        // Handle response format: { code: 200, data: { taskId: "..." } }
        const taskId = data.data?.taskId || data.taskId || data.task_id || (data.ids && data.ids[0]) || data.id;

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
            const response = await fetch(`${SUNO_API_BASE_URL}/api/v1/generate/record-info?taskId=${taskId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Polling error: ${response.status}`);
            }

            const data = await response.json();
            console.log('Suno poll response:', data);

            // Response format: { code: 200, data: { status: "SUCCESS", response: { sunoData: [{ audioUrl: "..." }] } } }
            const taskData = data.data;
            if (!taskData) {
                continue; // No data yet, keep polling
            }

            const status = taskData.status;
            console.log('Task status:', status);

            // Check for completion - audio URLs are in response.sunoData array
            if (status === 'SUCCESS' || status === 'FIRST_SUCCESS') {
                const sunoData = taskData.response?.sunoData;
                if (Array.isArray(sunoData) && sunoData[0]) {
                    const audioUrl = sunoData[0].audioUrl || sunoData[0].streamAudioUrl;
                    console.log('Audio URL found:', audioUrl);
                    if (audioUrl) {
                        return { success: true, data: { ...sunoData[0], audio_url: audioUrl } };
                    }
                }
            }

            // Check for failures
            if (status === 'CREATE_TASK_FAILED' || status === 'GENERATE_AUDIO_FAILED' ||
                status === 'CALLBACK_EXCEPTION' || status === 'SENSITIVE_WORD_ERROR') {
                return { success: false, error: taskData.errorMessage || `Generation failed: ${status}` };
            }

            // Still pending (PENDING, TEXT_SUCCESS) - keep polling

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
        const response = await fetch(`${SUNO_API_BASE_URL}/api/v1/generate/credit`, {
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
