# Patterna AI Assistant

Patterna is a configurable AI knowledge assistant built with React, TypeScript, a Vercel API route, and the Gemini API.

It is designed to demonstrate a practical business pattern: approved knowledge goes in, a structured answer comes out, and the Gemini API key stays on the server.

## What This Project Shows

- A React chat interface with suggested questions, visible sources, and confidence metadata.
- A server-side `/api/chat` route so the Gemini key is never exposed to browser code.
- A configurable knowledge base supplied through `PATTERNA_KNOWLEDGE_JSON`.
- Structured Gemini JSON output for predictable UI rendering.
- Guardrails for unsupported, off-topic, abusive, or unknown questions.
- Local development support through Vite middleware using the same `/api/chat` path.

## Why It Is Useful

Many small businesses, internal teams, and portfolio sites do not need a general-purpose chatbot. They need a focused assistant that answers from approved material such as:

- product FAQs
- customer support policies
- onboarding guidance
- service documentation
- public project information
- internal process notes

Patterna keeps that boundary visible. If a question is not covered by the configured knowledge base, the assistant should say so rather than inventing an answer.

## Security Model

The browser never receives the Gemini API key.

```text
React UI -> /api/chat -> Gemini API
                  ^
                  server environment variables only
```

The key is read from `process.env.GEMINI_API_KEY` inside the server route. Do not place real keys in frontend code, committed files, screenshots, README examples, or client-side environment variables.

## Run Locally

```bash
npm install
npm run dev
```

The app runs at:

```text
http://127.0.0.1:5173/
```

## Environment Variables

Copy `.env.example` to `.env.local`, then replace the placeholders.

```text
GEMINI_API_KEY=your_google_ai_studio_key_here
GEMINI_MODEL=gemini-2.5-flash-lite
PATTERNA_ASSISTANT_NAME=Patterna Assistant
PATTERNA_ORGANIZATION=Your organisation or project name
PATTERNA_USE_CASE=customer support knowledge assistant
PATTERNA_KNOWLEDGE_JSON=[{"id":"support-hours","title":"Support hours","content":"Support is available Monday to Friday, 9:00-17:00 UK time.","keywords":["hours","support"]}]
```

`PATTERNA_KNOWLEDGE_JSON` must be a JSON array. Each entry should use this shape:

```json
{
  "id": "refund-policy",
  "title": "Refund policy",
  "content": "Approved answer text or source notes go here.",
  "keywords": ["refund", "returns", "policy"]
}
```

The prompt does not contain a fixed business, company, or personal knowledge base. You configure the knowledge entries yourself.

## Deploy To Vercel

1. Create a Vercel project from this repository.
2. Add the same environment variables in Vercel Project Settings.
3. Deploy.

Vercel will serve the React app and run `api/chat.ts` as a serverless function.

## Project Structure

```text
api/chat.ts                    Serverless API route
src/server/chatEngine.ts        Gemini request, prompt, validation, JSON parsing
src/components/KnowledgeAssistant.tsx
src/config/demoPrompts.ts       Suggested UI prompts only
src/types/chat.ts               Shared response types
src/App.tsx                     Demo page
src/styles.css                  Interface styling
```

## Response Contract

Gemini is asked to return JSON in this shape:

```ts
type ChatResponse = {
  intent: "knowledge_question" | "assistant_capability" | "off_topic" | "unsafe_or_abusive" | "unsupported";
  answer: string;
  confidence: number;
  cannotAnswer: boolean;
  matchedSources: string[];
  suggestedFollowUps: string[];
};
```

The UI renders this structure directly so users can see the answer, confidence level, and source labels instead of receiving an opaque paragraph.

## Build Check

```bash
npm run build
```

## Notes

- Keep `.env.local` private.
- Keep knowledge entries concise and approved.
- Avoid loading private customer data unless you have proper consent, retention rules, and security controls.
- This project is a starter pattern, not a replacement for legal, medical, financial, or safety-critical review.
