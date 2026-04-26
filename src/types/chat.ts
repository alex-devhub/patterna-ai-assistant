export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type KnowledgeEntry = {
  id: string;
  title: string;
  content: string;
  keywords?: string[];
};

export type ChatResponse = {
  intent: "knowledge_question" | "assistant_capability" | "off_topic" | "unsafe_or_abusive" | "unsupported";
  answer: string;
  confidence: number;
  cannotAnswer: boolean;
  matchedSources: string[];
  suggestedFollowUps: string[];
  provider: "gemini" | "server-router";
  model: string;
};

