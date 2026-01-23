import type { VercelRequest, VercelResponse } from "@vercel/node";

const MVSEP_API_URL = "https://mvsep.com/api/separation";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const hash = req.query.hash as string;

  if (!hash) {
    return res.status(400).json({ error: "hash query parameter is required" });
  }

  try {
    const response = await fetch(`${MVSEP_API_URL}/get?hash=${hash}`);

    if (!response.ok) {
      throw new Error(`Status check failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("[MVSEP] Status response:", JSON.stringify(data, null, 2));

    // Job still processing
    if (data.status === "processing" || data.status === "pending" || data.status === "queued") {
      return res.status(200).json({
        success: true,
        status: "processing",
        message: "Still processing...",
      });
    }

    // Job failed
    if (data.status === "failed" || data.status === "error") {
      return res.status(200).json({
        success: false,
        status: "failed",
        error: data.data?.message || "Separation failed",
      });
    }

    // Job done - extract stems
    if (data.status === "done" && data.data?.files) {
      const files = data.data.files;
      console.log("[MVSEP] Files received:", JSON.stringify(files, null, 2));
      console.log("[MVSEP] Files type:", Array.isArray(files) ? "array" : typeof files);

      const stems: Record<string, string> = {
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

      return res.status(200).json({
        success: true,
        status: "done",
        stems: proxiedStems,
      });
    }

    // Unknown status
    return res.status(200).json({
      success: true,
      status: data.status || "unknown",
      message: "Unknown status, continue polling...",
    });
  } catch (error) {
    console.error("[MVSEP Status] Error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Status check failed",
    });
  }
}
