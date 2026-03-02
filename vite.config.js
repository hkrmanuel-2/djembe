import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Custom plugin to handle API routes in development
function apiRoutesPlugin() {
  let env;

  return {
    name: "api-routes",
    configResolved(config) {
      env = loadEnv(config.mode, process.cwd(), "");
    },
    configureServer(server) {
      const MVSEP_API_URL = "https://mvsep.com/api/separation";

      // POST /api/separate - Start stem separation
      server.middlewares.use("/api/separate", async (req, res, next) => {
        if (req.method === "OPTIONS") {
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "Content-Type");
          res.statusCode = 200;
          res.end();
          return;
        }

        if (req.method !== "POST") {
          next();
          return;
        }

        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", async () => {
          try {
            const { audioUrl } = JSON.parse(body);

            if (!audioUrl) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "audioUrl is required" }));
              return;
            }

            const apiToken = env.MVSEP_API_KEY;
            if (!apiToken) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "MVSEP_API_KEY not configured" }));
              return;
            }

            console.log("[MVSEP] Downloading audio from:", audioUrl);
            const audioResponse = await fetch(audioUrl);
            if (!audioResponse.ok) {
              throw new Error(`Failed to download audio: ${audioResponse.status}`);
            }

            const audioBuffer = await audioResponse.arrayBuffer();
            const audioBlob = new Blob([audioBuffer], { type: "audio/mpeg" });
            console.log("[MVSEP] Audio downloaded, size:", audioBuffer.byteLength);

            const formData = new FormData();
            formData.append("api_token", apiToken);
            formData.append("audiofile", audioBlob, "track.mp3");
            formData.append("sep_type", "63");
            formData.append("output_format", "2");

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

            res.setHeader("Content-Type", "application/json");
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.end(JSON.stringify({
              success: true,
              status: "processing",
              hash: jobHash,
            }));
          } catch (error) {
            console.error("[MVSEP API] Error:", error);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({
              success: false,
              error: error.message || "Separation failed",
            }));
          }
        });
      });

      // GET /api/separate-status - Check separation status
      server.middlewares.use("/api/separate-status", async (req, res, next) => {
        if (req.method === "OPTIONS") {
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "Content-Type");
          res.statusCode = 200;
          res.end();
          return;
        }

        if (req.method !== "GET") {
          next();
          return;
        }

        const url = new URL(req.url, `http://${req.headers.host}`);
        const hash = url.searchParams.get("hash");

        if (!hash) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "hash parameter required" }));
          return;
        }

        try {
          const response = await fetch(`${MVSEP_API_URL}/get?hash=${hash}`);
          if (!response.ok) {
            throw new Error(`Status check failed: ${response.status}`);
          }

          const data = await response.json();
          console.log("[MVSEP] Status:", data.status);

          res.setHeader("Content-Type", "application/json");
          res.setHeader("Access-Control-Allow-Origin", "*");

          if (data.status === "processing" || data.status === "pending" || data.status === "queued") {
            res.end(JSON.stringify({ success: true, status: "processing" }));
            return;
          }

          if (data.status === "failed" || data.status === "error") {
            res.end(JSON.stringify({ success: false, status: "failed", error: data.data?.message }));
            return;
          }

          if (data.status === "done" && data.data?.files) {
            const files = data.data.files;
            const stems = { drums: "", bass: "", guitar: "", piano: "", vocals: "", other: "" };

            if (!Array.isArray(files) && typeof files === "object") {
              for (const [key, value] of Object.entries(files)) {
                const keyLower = key.toLowerCase();
                const stemUrl = typeof value === "string" ? value : value?.url || "";
                if (keyLower.includes("drum")) stems.drums = stemUrl;
                else if (keyLower.includes("bass")) stems.bass = stemUrl;
                else if (keyLower.includes("guitar")) stems.guitar = stemUrl;
                else if (keyLower.includes("piano")) stems.piano = stemUrl;
                else if (keyLower.includes("vocal")) stems.vocals = stemUrl;
                else if (keyLower.includes("other")) stems.other = stemUrl;
              }
            } else if (Array.isArray(files)) {
              for (const file of files) {
                const name = (file.type || file.name || "").toLowerCase();
                const stemUrl = file.url || "";
                if (name.includes("drum")) stems.drums = stemUrl;
                else if (name.includes("bass")) stems.bass = stemUrl;
                else if (name.includes("guitar")) stems.guitar = stemUrl;
                else if (name.includes("piano")) stems.piano = stemUrl;
                else if (name.includes("vocal")) stems.vocals = stemUrl;
                else if (name.includes("other")) stems.other = stemUrl;
              }
            }

            // Proxy the stems through our audio proxy
            const proxiedStems = {};
            for (const [key, url] of Object.entries(stems)) {
              proxiedStems[key] = url ? `/api/proxy-audio?url=${encodeURIComponent(url)}` : "";
            }

            res.end(JSON.stringify({ success: true, status: "done", stems: proxiedStems }));
            return;
          }

          res.end(JSON.stringify({ success: true, status: data.status || "unknown" }));
        } catch (error) {
          console.error("[MVSEP Status] Error:", error);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ success: false, error: error.message }));
        }
      });

      // GET /api/proxy-audio - Proxy audio files to avoid CORS
      server.middlewares.use("/api/proxy-audio", async (req, res, next) => {
        if (req.method === "OPTIONS") {
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "Content-Type");
          res.statusCode = 200;
          res.end();
          return;
        }

        if (req.method !== "GET") {
          next();
          return;
        }

        const reqUrl = new URL(req.url, `http://${req.headers.host}`);
        const audioUrl = reqUrl.searchParams.get("url");

        if (!audioUrl) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "url parameter required" }));
          return;
        }

        const allowedDomains = ["mvsep.com", "musicfile.api.box", "cdn.suno.ai", "cdn1.suno.ai", "cdn2.suno.ai"];
        const isAllowed = allowedDomains.some((domain) => audioUrl.includes(domain));

        if (!isAllowed) {
          res.statusCode = 403;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "URL domain not allowed" }));
          return;
        }

        try {
          const response = await fetch(audioUrl);
          if (!response.ok) {
            res.statusCode = response.status;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: `Failed to fetch: ${response.status}` }));
            return;
          }

          const contentType = response.headers.get("content-type") || "audio/mpeg";
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          res.setHeader("Content-Type", contentType);
          res.setHeader("Content-Length", buffer.length);
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Cache-Control", "public, max-age=3600");
          res.end(buffer);
        } catch (error) {
          console.error("[Proxy Audio] Error:", error);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: error.message }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), apiRoutesPlugin()],
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{js,ts,jsx,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{js,ts,jsx,tsx}"],
      exclude: ["src/test/**", "src/**/*.d.ts"],
    },
  },
});
