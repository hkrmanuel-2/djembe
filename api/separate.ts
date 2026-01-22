import type { VercelRequest, VercelResponse } from "@vercel/node";

const MVSEP_API_URL = "https://mvsep.com/api/separation";

interface SeparateRequest {
  audioUrl: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

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
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error(`Failed to download audio: ${audioResponse.status}`);
    }

    const audioBuffer = await audioResponse.arrayBuffer();
    const audioBlob = new Blob([audioBuffer], { type: "audio/mpeg" });

    // Step 2: Create form data for MVSEP
    const formData = new FormData();
    formData.append("api_token", apiToken);
    formData.append("audiofile", audioBlob, "track.mp3");
    formData.append("sep_type", "63"); // BS Roformer SW: vocals, bass, drums, guitar, piano, other
    formData.append("output_format", "2"); // mp3 128kbps (smaller files for Vercel limit)

    // Step 3: Submit to MVSEP
    const createResponse = await fetch(`${MVSEP_API_URL}/create`, {
      method: "POST",
      body: formData,
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`MVSEP create failed: ${createResponse.status} - ${errorText}`);
    }

    const createData = await createResponse.json();

    if (!createData.success) {
      throw new Error(createData.data?.message || "MVSEP job creation failed");
    }

    const jobHash = createData.data?.hash;
    if (!jobHash) {
      throw new Error("No job hash received from MVSEP");
    }

    // Step 4: Poll for completion
    const stems = await pollForCompletion(jobHash);

    return res.status(200).json({
      success: true,
      stems,
    });
  } catch (error) {
    console.error("[MVSEP API] Error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Separation failed",
    });
  }
}

async function pollForCompletion(hash: string, maxAttempts = 120): Promise<{
  drums: string;
  bass: string;
  guitar: string;
  piano: string;
  vocals: string;
  other: string;
}> {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(`${MVSEP_API_URL}/get?hash=${hash}`);

    if (!response.ok) {
      throw new Error(`Status check failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("[MVSEP] Poll response:", JSON.stringify(data, null, 2));

    if (data.status === "done" && data.data?.files) {
      const files = data.data.files;
      console.log("[MVSEP] Files received:", JSON.stringify(files, null, 2));
      console.log("[MVSEP] Files type:", Array.isArray(files) ? "array" : typeof files);

      const stems = {
        drums: "",
        bass: "",
        guitar: "",
        piano: "",
        vocals: "",
        other: "",
      };

      // Handle case where files is an object with stem names as keys
      if (!Array.isArray(files) && typeof files === "object") {
        console.log("[MVSEP] Files is object, keys:", Object.keys(files));
        for (const [key, value] of Object.entries(files)) {
          const keyLower = key.toLowerCase();
          const url = typeof value === "string" ? value : (value as any)?.url || (value as any)?.download_url || "";
          console.log("[MVSEP] Object entry:", { key: keyLower, url: url.substring(0, 50) });

          if (keyLower.includes("drum")) stems.drums = url;
          else if (keyLower.includes("bass")) stems.bass = url;
          else if (keyLower.includes("guitar")) stems.guitar = url;
          else if (keyLower.includes("piano")) stems.piano = url;
          else if (keyLower.includes("vocal")) stems.vocals = url;
          else if (keyLower.includes("other")) stems.other = url;
        }
      } else if (Array.isArray(files)) {
        // Handle case where files is an array
        for (const file of files) {
          console.log("[MVSEP] File object keys:", Object.keys(file));
          // Try different possible field names for the file info
          // MVSEP uses "type" for stem name (e.g., "Bass", "Drums", "Vocals")
          const name = (file.type || file.name || file.filename || file.stem || file.title || "").toLowerCase();
          const url = file.url || file.download_url || file.link || file.path || "";

          console.log("[MVSEP] Processing file:", { name, url: url ? url.substring(0, 50) + "..." : "empty" });

          if (name.includes("drum")) stems.drums = url;
          else if (name.includes("bass")) stems.bass = url;
          else if (name.includes("guitar")) stems.guitar = url;
          else if (name.includes("piano")) stems.piano = url;
          else if (name.includes("vocal")) stems.vocals = url;
          else if (name.includes("other")) stems.other = url;
        }
      }

      // Convert MVSEP URLs to proxied URLs to avoid CORS issues
      const proxiedStems = {
        drums: stems.drums ? `/api/proxy-audio?url=${encodeURIComponent(stems.drums)}` : "",
        bass: stems.bass ? `/api/proxy-audio?url=${encodeURIComponent(stems.bass)}` : "",
        guitar: stems.guitar ? `/api/proxy-audio?url=${encodeURIComponent(stems.guitar)}` : "",
        piano: stems.piano ? `/api/proxy-audio?url=${encodeURIComponent(stems.piano)}` : "",
        vocals: stems.vocals ? `/api/proxy-audio?url=${encodeURIComponent(stems.vocals)}` : "",
        other: stems.other ? `/api/proxy-audio?url=${encodeURIComponent(stems.other)}` : "",
      };

      console.log("[MVSEP] Final stems (proxied):", proxiedStems);
      return proxiedStems;
    }

    if (data.status === "failed") {
      throw new Error(data.data?.message || "Separation failed");
    }

    await new Promise((r) => setTimeout(r, 3000));
  }

  throw new Error("Separation timeout");
}
