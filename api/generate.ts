import type { VercelRequest, VercelResponse } from "@vercel/node";

const SUNO_API_BASE_URL = "https://api.sunoapi.org";

interface GenerateRequest {
  prompt: string;
  styleTags: string;
  title: string;
  bpm: number;
}

export const config = {
  maxDuration: 60,
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || "http://localhost:5173";
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.SUNO_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "SUNO_API_KEY not configured" });
  }

  const { prompt, styleTags, title, bpm } = req.body as GenerateRequest;

  if (!prompt) {
    return res.status(400).json({ error: "prompt is required" });
  }

  try {
    console.log("[Suno Proxy] Generating track...");

    const response = await fetch(`${SUNO_API_BASE_URL}/api/v1/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        gpt_description_prompt: prompt,
        style: styleTags || "",
        title: title || `Track - ${bpm || 120}bpm`,
        model: "V4_5ALL",
        instrumental: true,
        customMode: true,
        callBackUrl: "https://example.com/callback",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Suno API error: ${response.status}`);
    }

    const data = await response.json();
    const taskId = data.data?.taskId || data.taskId;

    if (!taskId) {
      throw new Error("No task ID received from Suno");
    }

    return res.status(200).json({
      success: true,
      taskId,
    });
  } catch (error) {
    console.error("[Suno Proxy] Error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Generation failed",
    });
  }
}
