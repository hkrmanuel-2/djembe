import type { VercelRequest, VercelResponse } from "@vercel/node";

const MVSEP_API_URL = "https://mvsep.com/api/separation";

interface SeparateRequest {
  audioUrl: string;
}

export const config = {
  maxDuration: 60, // Increase timeout to 60s (requires Pro plan, otherwise ignored)
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

  const { audioUrl } = req.body as SeparateRequest;

  if (!audioUrl || typeof audioUrl !== "string") {
    return res.status(400).json({ error: "audioUrl is required" });
  }

  const apiToken = process.env.MVSEP_API_KEY;
  if (!apiToken) {
    return res.status(500).json({ error: "MVSEP_API_KEY not configured" });
  }

  try {
    // Step 1: Download the audio file from URL
    console.log("[MVSEP] Downloading audio from:", audioUrl);
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error(`Failed to download audio: ${audioResponse.status}`);
    }

    const audioBuffer = await audioResponse.arrayBuffer();
    const audioBlob = new Blob([audioBuffer], { type: "audio/mpeg" });
    console.log("[MVSEP] Audio downloaded, size:", audioBuffer.byteLength);

    // Step 2: Create form data for MVSEP
    const formData = new FormData();
    formData.append("api_token", apiToken);
    formData.append("audiofile", audioBlob, "track.mp3");
    formData.append("sep_type", "63"); // BS Roformer SW: vocals, bass, drums, guitar, piano, other
    formData.append("output_format", "2"); // mp3 128kbps (smaller files for Vercel limit)

    // Step 3: Submit to MVSEP
    console.log("[MVSEP] Submitting to MVSEP...");
    const createResponse = await fetch(`${MVSEP_API_URL}/create`, {
      method: "POST",
      body: formData,
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`MVSEP create failed: ${createResponse.status} - ${errorText}`);
    }

    const createData = await createResponse.json();
    console.log("[MVSEP] Create response:", JSON.stringify(createData, null, 2));

    if (!createData.success) {
      throw new Error(createData.data?.message || "MVSEP job creation failed");
    }

    const jobHash = createData.data?.hash;
    if (!jobHash) {
      throw new Error("No job hash received from MVSEP");
    }

    // Return the hash immediately - client will poll for status
    return res.status(200).json({
      success: true,
      status: "processing",
      hash: jobHash,
      message: "Job created. Poll /api/separate-status?hash=" + jobHash,
    });
  } catch (error) {
    console.error("[MVSEP API] Error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Separation failed",
    });
  }
}
