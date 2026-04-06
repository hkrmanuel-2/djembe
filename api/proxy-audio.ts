import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Proxy endpoint to fetch audio files from MVSEP with CORS headers
 * This is needed because MVSEP's storage doesn't set Access-Control-Allow-Origin
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers
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

  const { url } = req.query;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "url parameter is required" });
  }

  // Allow proxying from trusted audio sources
  const allowedDomains = [
    "mvsep.com",
    "musicfile.api.box",
    "cdn.suno.ai",
    "cdn1.suno.ai",
    "cdn2.suno.ai",
  ];

  // Validate URL hostname against allowed domains (prevents bypass via url.includes)
  let isAllowed = false;
  try {
    const parsed = new URL(url);
    isAllowed = allowedDomains.some(
      (d) => parsed.hostname === d || parsed.hostname.endsWith("." + d)
    );
  } catch {
    isAllowed = false;
  }
  if (!isAllowed) {
    return res.status(403).json({ error: "URL domain not allowed" });
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Failed to fetch audio: ${response.status}`
      });
    }

    // Get content type from response
    const contentType = response.headers.get("content-type") || "audio/mpeg";

    // Stream the audio data
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", buffer.length);
    res.setHeader("Cache-Control", "public, max-age=3600"); // Cache for 1 hour

    return res.status(200).send(buffer);
  } catch (error) {
    console.error("[Proxy Audio] Error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Proxy failed",
    });
  }
}
