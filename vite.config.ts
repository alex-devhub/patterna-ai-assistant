import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type Plugin } from "vite";
import { ChatApiError, createPatternaChatResponse } from "./src/server/chatEngine";

function readRequestBody(req: any) {
  return new Promise<string>((resolve, reject) => {
    let body = "";

    req.on("data", (chunk: Buffer) => {
      body += chunk.toString("utf8");
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function chatApiPlugin(mode: string): Plugin {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    name: "patterna-dev-chat-api",
    configureServer(server) {
      server.middlewares.use("/api/chat", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.setHeader("Allow", "POST");
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        try {
          const rawBody = await readRequestBody(req);
          const payload = rawBody ? JSON.parse(rawBody) : {};
          const reply = await createPatternaChatResponse(payload, {
            ...process.env,
            ...env,
          });

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(reply));
        } catch (error) {
          const statusCode = error instanceof ChatApiError ? error.statusCode : 500;
          const message = error instanceof Error ? error.message : "AI response failed.";

          res.statusCode = statusCode;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: message }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), chatApiPlugin(mode)],
}));

