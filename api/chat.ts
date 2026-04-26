import { ChatApiError, createPatternaChatResponse } from "../src/server/chatEngine.js";

type VercelRequest = {
  method?: string;
  body?: unknown;
};

type VercelResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => {
    json: (body: unknown) => void;
  };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const reply = await createPatternaChatResponse(payload ?? {}, process.env);

    return res.status(200).json(reply);
  } catch (error) {
    const statusCode = error instanceof ChatApiError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : "AI response failed.";

    return res.status(statusCode).json({ error: message });
  }
}

