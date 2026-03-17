import { logger } from "./logger";
// Voices API - Suno generation (via server proxy) + MVSEP stem separation
// Suno calls are proxied through /api/generate (API key stays server-side)
// MVSEP: https://mvsep.com/ (BS Roformer SW model)

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
 * Generate a full music track via server-side Suno proxy
 */
export async function generateTrack(settings) {
  try {
    const prompt = buildPrompt(settings);
    const genre = settings.genre || "afrobeat";
    const style = settings.style || "upbeat";
    const mood = settings.mood || "happy";
    const bpm = settings.bpm || 120;

    const styleTags = `${genre}, ${style}, ${mood}, ${bpm} bpm, instrumental, kid-friendly, educational, rhythmic, loopable`;

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        styleTags,
        title: `${genre} ${mood} rhythm - ${bpm}bpm`,
        bpm,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.success || !data.taskId) {
      throw new Error(data.error || "No task ID received from generation");
    }

    const trackResult = await pollForTrackCompletion(data.taskId);
    return trackResult;
  } catch (error) {
    console.error("[VoicesAPI] Generate track error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Poll for track generation completion via server-side proxy
 */
async function pollForTrackCompletion(taskId, maxAttempts = 60) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(`/api/generate-status?taskId=${taskId}`);

      if (!response.ok) {
        throw new Error(`Polling error: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "done" && data.audioUrl) {
        return {
          success: true,
          taskId,
          audioId: data.audioId,
          audioUrl: data.audioUrl,
        };
      }

      if (data.status === "failed") {
        return { success: false, error: data.error || "Generation failed" };
      }

      // Still processing
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
    logger.log("[VoicesAPI] Starting stem separation for:", audioUrl);
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
    logger.log("[VoicesAPI] Separation started:", startData);

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
        logger.warn("[VoicesAPI] Status check failed, retrying...");
        continue;
      }

      const statusData = await statusResponse.json();
      logger.log("[VoicesAPI] Status:", statusData.status);

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
export function mapStemsToCategories(rawStems) {
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
    logger.log("[VoicesAPI] Starting stem generation...");

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
