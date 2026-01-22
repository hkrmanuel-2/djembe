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
    formData.append("output_format", "0"); // mp3 320kbps

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

      const stems = {
        drums: "",
        bass: "",
        guitar: "",
        piano: "",
        vocals: "",
        other: "",
      };

      for (const file of files) {
        // Try different possible field names for the file info
        const name = (file.name || file.filename || file.stem || "").toLowerCase();
        const url = file.url || file.download_url || file.link || "";

        console.log("[MVSEP] Processing file:", { name, url: url.substring(0, 50) + "..." });

        if (name.includes("drum")) {
          stems.drums = url;
        } else if (name.includes("bass")) {
          stems.bass = url;
        } else if (name.includes("guitar")) {
          stems.guitar = url;
        } else if (name.includes("piano")) {
          stems.piano = url;
        } else if (name.includes("vocal")) {
          stems.vocals = url;
        } else if (name.includes("other")) {
          stems.other = url;
        }
      }

      // If no matches, try to extract from file structure directly
      if (!stems.drums && !stems.bass && !stems.vocals) {
        console.log("[MVSEP] No matches found, raw files:", files);
      }

      return stems;
    }

    if (data.status === "failed") {
      throw new Error(data.data?.message || "Separation failed");
    }

    await new Promise((r) => setTimeout(r, 3000));
  }

  throw new Error("Separation timeout");
}
