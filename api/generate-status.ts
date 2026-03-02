import type { VercelRequest, VercelResponse } from "@vercel/node";

const SUNO_API_BASE_URL = "https://api.sunoapi.org";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || "http://localhost:5173";
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.SUNO_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "SUNO_API_KEY not configured" });
  }

  const taskId = req.query.taskId as string;
  if (!taskId) {
    return res.status(400).json({ error: "taskId query parameter is required" });
  }

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
      throw new Error(`Suno polling error: ${response.status}`);
    }

    const data = await response.json();
    const taskData = data.data;

    if (!taskData) {
      return res.status(200).json({
        success: true,
        status: "pending",
        message: "Waiting for data...",
      });
    }

    const status = taskData.status;

    // Success - return audio URL
    if (status === "SUCCESS" || status === "FIRST_SUCCESS") {
      const sunoData = taskData.response?.sunoData;
      if (Array.isArray(sunoData) && sunoData[0]) {
        const track = sunoData[0];
        return res.status(200).json({
          success: true,
          status: "done",
          audioId: track.id || track.audioId,
          audioUrl: track.audioUrl || track.streamAudioUrl,
        });
      }
    }

    // Failed
    if (
      status === "CREATE_TASK_FAILED" ||
      status === "GENERATE_AUDIO_FAILED" ||
      status === "CALLBACK_EXCEPTION" ||
      status === "SENSITIVE_WORD_ERROR"
    ) {
      return res.status(200).json({
        success: false,
        status: "failed",
        error: taskData.errorMessage || `Generation failed: ${status}`,
      });
    }

    // Still processing
    return res.status(200).json({
      success: true,
      status: "processing",
      message: `Status: ${status}`,
    });
  } catch (error) {
    console.error("[Suno Status] Error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Status check failed",
    });
  }
}
