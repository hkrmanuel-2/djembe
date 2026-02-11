// Voices API - Suno generation + MVSEP stem separation
// Suno: https://docs.sunoapi.org/
// MVSEP: https://mvsep.com/ (BS Roformer SW model)

const SUNO_API_BASE_URL = "https://api.sunoapi.org";

/**
 * Get Suno API key from environment
 */
function getSunoApiKey() {
  return import.meta.env.VITE_SUNO_API_KEY || "";
}

/**
 * Build a kid-friendly music generation prompt from teacher settings
 * Creates educational rhythm tracks suitable for children aged 5-12
 */
export function buildPrompt(settings) {
  const genre = settings.genre || "afrobeat";
  const bpm = settings.bpm || 120;
  const style = settings.style || "upbeat";
  const mood = settings.mood || "happy";
  const customPrompt = settings.custom_prompt || "";

  // Build the comprehensive kid-friendly prompt
  const prompt = `Create a kid-friendly, instrumental music track for children aged 5–12 that teaches rhythm through listening and movement.

STRICT PARAMETERS (must be followed):
- Genre: ${genre}
- Tempo: ${bpm} BPM (maintain this exact tempo throughout)
- Style: ${style}
- Mood: ${mood}

Instrumentation:
- Use instruments typical of the ${genre} genre
- Supporting instruments: light percussion (e.g. shakers, bells, soft claps)
- No vocals, no lyrics, no chanting

Musical Direction:
The track should be fun, playful, and educational.
Use simple, repetitive rhythmic patterns that are easy for children to follow.
Focus on groove, clarity, and rhythm consistency.
Incorporate call-and-response style patterns suitable for beginner learners.

Tone & Safety:
- Child-safe and positive
- No aggressive, dark, intense, or scary sounds
- No distortion or harsh frequencies
- No sudden drops or dramatic transitions

Structure:
- Clear rhythmic loop
- Predictable patterns
- Easy to clap, dance, or move along to
- Feels joyful, inviting, and culturally respectful

Production Notes:
- Clean and warm mix
- Minimal layers (do not overcrowd)
- Emphasize downbeats and groove
- Educational and immersive, not cinematic or complex
${customPrompt ? `\nAdditional teacher notes: ${customPrompt}` : ""}

IMPORTANT:
Maintain a steady tempo of exactly ${bpm} BPM.
Ensure the musical style and rhythm clearly match the selected genre: ${genre}.
Create loopable, instrumental content with clear stem separation.`;

  return prompt;
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
    const genre = settings.genre || "afrobeat";
    const style = settings.style || "upbeat";
    const mood = settings.mood || "happy";
    const bpm = settings.bpm || 120;

    // Build style tags for Suno (more effective than long prompts)
    const styleTags = `${genre}, ${style}, ${mood}, ${bpm} bpm, instrumental, kid-friendly, educational, rhythmic, loopable`;

    console.log("[VoicesAPI] Generating track with style:", styleTags);
    console.log("[VoicesAPI] Full prompt:", prompt);

    const response = await fetch(`${SUNO_API_BASE_URL}/api/v1/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        // Use gpt_description_prompt for the full description
        gpt_description_prompt: prompt,
        // Use style/tags for genre direction (Suno weights this heavily)
        style: styleTags,
        title: `${genre} ${mood} rhythm - ${bpm}bpm`,
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
 * Separate stems using MVSEP via our API routes
 * Uses two-step process to avoid Vercel timeout:
 * 1. POST /api/separate - starts the job, returns hash
 * 2. GET /api/separate-status?hash=... - polls until done
 */
export async function separateStems(audioUrl, onProgress = () => {}) {
  try {
    console.log("[VoicesAPI] Starting stem separation for:", audioUrl);
    onProgress("Starting separation...");

    // Step 1: Start the separation job
    const startResponse = await fetch("/api/separate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ audioUrl }),
    });

    if (!startResponse.ok) {
      const errorData = await startResponse.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to start separation: ${startResponse.status}`);
    }

    const startData = await startResponse.json();
    console.log("[VoicesAPI] Separation started:", startData);

    if (!startData.success) {
      throw new Error(startData.error || "Failed to start separation");
    }

    const hash = startData.hash;
    if (!hash) {
      throw new Error("No job hash received");
    }

    // Step 2: Poll for completion
    onProgress("Processing audio (this may take 1-3 minutes)...");
    const maxAttempts = 120; // 120 * 3s = 6 minutes max

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await wait(3000); // Wait 3 seconds between polls

      const statusResponse = await fetch(`/api/separate-status?hash=${hash}`);

      if (!statusResponse.ok) {
        console.warn("[VoicesAPI] Status check failed, retrying...");
        continue;
      }

      const statusData = await statusResponse.json();
      console.log("[VoicesAPI] Status:", statusData.status);

      if (statusData.status === "done" && statusData.stems) {
        // Success! Map stems to our categories
        const mappedStems = mapStemsToCategories(statusData.stems);

        return {
          success: true,
          stems: mappedStems,
          rawStems: statusData.stems,
        };
      }

      if (statusData.status === "failed") {
        throw new Error(statusData.error || "Separation failed");
      }

      // Still processing - update progress
      const progress = Math.min(95, Math.round((attempt / maxAttempts) * 100));
      onProgress(`Processing audio... ${progress}%`);
    }

    throw new Error("Separation timeout - please try again");
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

    // Stage 2: Separate stems with MVSEP
    onProgress("separating", "Separating instruments with AI...");
    const separationResult = await separateStems(trackResult.audioUrl, (msg) => {
      onProgress("separating", msg);
    });

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
