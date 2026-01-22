// Voices API - Suno generation + Replicate Demucs stem separation
// Suno: https://docs.sunoapi.org/
// Replicate Demucs: https://replicate.com/cjwbw/demucs

const SUNO_API_BASE_URL = "https://api.sunoapi.org";

/**
 * Get Suno API key from environment
 */
function getSunoApiKey() {
  return import.meta.env.VITE_SUNO_API_KEY || "";
}

/**
 * Build a music generation prompt from teacher settings
 */
export function buildPrompt(settings) {
  const parts = [];

  if (settings.genre) parts.push(settings.genre);
  if (settings.style) parts.push(settings.style);
  if (settings.mood) parts.push(`${settings.mood} mood`);
  if (settings.bpm) parts.push(`at ${settings.bpm} BPM`);
  if (settings.custom_prompt) parts.push(settings.custom_prompt);

  // Add instructions for better stem separation
  parts.push("instrumental, clear mix, separated instruments, loopable");

  return parts.join(", ");
}

/**
 * Generate a full music track using Suno API
 */
export async function generateTrack(settings) {
  const apiKey = getSunoApiKey();
  if (!apiKey) {
    return { success: false, error: "Suno API key not configured" };
  }

  try {
    const prompt = buildPrompt(settings);
    console.log("[VoicesAPI] Generating track with prompt:", prompt);

    const response = await fetch(`${SUNO_API_BASE_URL}/api/v1/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt: prompt,
        model: "V4_5ALL",
        instrumental: true,
        customMode: true,
        callBackUrl: "https://example.com/callback",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("[VoicesAPI] Generate response:", data);

    const taskId = data.data?.taskId || data.taskId;
    if (!taskId) {
      throw new Error("No task ID received from generation");
    }

    const trackResult = await pollForTrackCompletion(taskId, apiKey);
    return trackResult;
  } catch (error) {
    console.error("[VoicesAPI] Generate track error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Poll for track generation completion
 */
async function pollForTrackCompletion(taskId, apiKey, maxAttempts = 60) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(
        `${SUNO_API_BASE_URL}/api/v1/generate/record-info?taskId=${taskId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Polling error: ${response.status}`);
      }

      const data = await response.json();
      const taskData = data.data;

      if (!taskData) {
        await wait(2000);
        continue;
      }

      const status = taskData.status;
      console.log("[VoicesAPI] Track generation status:", status);

      if (status === "SUCCESS" || status === "FIRST_SUCCESS") {
        const sunoData = taskData.response?.sunoData;
        if (Array.isArray(sunoData) && sunoData[0]) {
          const track = sunoData[0];
          return {
            success: true,
            taskId: taskId,
            audioId: track.id || track.audioId,
            audioUrl: track.audioUrl || track.streamAudioUrl,
          };
        }
      }

      if (
        status === "CREATE_TASK_FAILED" ||
        status === "GENERATE_AUDIO_FAILED" ||
        status === "CALLBACK_EXCEPTION" ||
        status === "SENSITIVE_WORD_ERROR"
      ) {
        return {
          success: false,
          error: taskData.errorMessage || `Generation failed: ${status}`,
        };
      }

      const waitTime = Math.min(1000 + attempt * 500, 5000);
      await wait(waitTime);
    } catch (error) {
      if (attempt === maxAttempts - 1) {
        return { success: false, error: error.message };
      }
      await wait(2000);
    }
  }

  return { success: false, error: "Track generation timeout" };
}

/**
 * Separate stems using Replicate Demucs via our API route
 */
export async function separateStems(audioUrl) {
  try {
    console.log("[VoicesAPI] Separating stems for:", audioUrl);

    const response = await fetch("/api/separate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ audioUrl }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Separation failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Stem separation failed");
    }

    // Map 6 stems to our 5 voice categories
    const mappedStems = mapStemsToCategories(data.stems);

    return {
      success: true,
      stems: mappedStems,
      rawStems: data.stems,
    };
  } catch (error) {
    console.error("[VoicesAPI] Stem separation error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Map BS Roformer SW 6 stems (drums, bass, guitar, piano, vocals, other) to our 5 categories
 */
function mapStemsToCategories(rawStems) {
  return {
    rhythm: rawStems.drums
      ? [{ id: "rhythm-0", name: "Drums", url: rawStems.drums, stemKey: "drums" }]
      : [],
    bass: rawStems.bass
      ? [{ id: "bass-0", name: "Bass", url: rawStems.bass, stemKey: "bass" }]
      : [],
    harmony: [
      ...(rawStems.piano ? [{ id: "harmony-0", name: "Piano", url: rawStems.piano, stemKey: "piano" }] : []),
      ...(rawStems.other ? [{ id: "harmony-1", name: "Other", url: rawStems.other, stemKey: "other" }] : []),
    ],
    melody: [
      ...(rawStems.guitar ? [{ id: "melody-0", name: "Guitar", url: rawStems.guitar, stemKey: "guitar" }] : []),
      ...(rawStems.vocals ? [{ id: "melody-1", name: "Vocals", url: rawStems.vocals, stemKey: "vocals" }] : []),
    ],
    extras: [],
  };
}

/**
 * Full workflow: Generate track with Suno, separate with Demucs
 */
export async function generateAndSeparateStems(settings, onProgress = () => {}) {
  try {
    console.log("[VoicesAPI] Starting stem generation...");

    // Stage 1: Generate track with Suno
    onProgress("generating", "Creating music track...");
    const trackResult = await generateTrack(settings);

    if (!trackResult.success) {
      return { success: false, error: trackResult.error };
    }

    if (!trackResult.audioUrl) {
      return { success: false, error: "No audio URL received from generation" };
    }

    // Stage 2: Separate stems with Demucs
    onProgress("separating", "Separating instruments with AI...");
    const separationResult = await separateStems(trackResult.audioUrl);

    if (!separationResult.success) {
      return { success: false, error: separationResult.error };
    }

    onProgress("complete", "Stems ready!");
    return {
      success: true,
      stems: separationResult.stems,
      rawStems: separationResult.rawStems,
      trackInfo: {
        taskId: trackResult.taskId,
        audioId: trackResult.audioId,
        audioUrl: trackResult.audioUrl,
      },
    };
  } catch (error) {
    console.error("[VoicesAPI] Generate and separate error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Helper: Wait for specified milliseconds
 */
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
