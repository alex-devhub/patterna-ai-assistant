import { Bot, ExternalLink, MessageCircle, Send, ShieldCheck, Sparkles } from "lucide-react";
import { Fragment, useEffect, useRef, useState, type FormEvent } from "react";
import { fallbackFollowUps, suggestedQuestions } from "../config/demoPrompts";
import type { ChatMessage, ChatResponse } from "../types/chat";

type UiMessage = ChatMessage & {
  meta?: ChatResponse;
};

const urlPattern = /(https?:\/\/[^\s<>"']+)/g;
const trailingPunctuationPattern = /[),.;:!?]+$/;

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

async function askAssistant(question: string, history: ChatMessage[]): Promise<ChatResponse> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, history }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.error ?? "The AI request failed.");
  }

  return response.json();
}

function LinkifiedText({ text }: { text: string }) {
  const parts = text.split(urlPattern);

  return (
    <>
      {parts.map((part, index) => {
        if (!part.match(urlPattern)) {
          return part;
        }

        const trailingPunctuation = part.match(trailingPunctuationPattern)?.[0] ?? "";
        const url = trailingPunctuation ? part.slice(0, -trailingPunctuation.length) : part;

        return (
          <Fragment key={`${url}-${index}`}>
            <a href={url} target="_blank" rel="noreferrer">
              {new URL(url).hostname.replace(/^www\./, "")}
              <ExternalLink size={13} aria-hidden="true" />
            </a>
            {trailingPunctuation}
          </Fragment>
        );
      })}
    </>
  );
}

function ResponseMeta({ reply }: { reply: ChatResponse }) {
  const confidence = Math.round(Math.max(0, Math.min(1, reply.confidence)) * 100);

  return (
    <div className="response-meta">
      <span>{reply.provider === "gemini" ? "Gemini" : "Router"}</span>
      {reply.provider === "gemini" ? <span>{reply.model}</span> : null}
      <span>{confidence}% confidence</span>
      {reply.matchedSources.length ? <span>Source: {reply.matchedSources.join(", ")}</span> : null}
    </div>
  );
}

export function KnowledgeAssistant() {
  const [messages, setMessages] = useState<UiMessage[]>([
    {
      id: createId("msg"),
      role: "assistant",
      content:
        "Patterna answers from a server-configured knowledge base. Add your own approved facts in PATTERNA_KNOWLEDGE_JSON, then ask a question here.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [followUps, setFollowUps] = useState(suggestedQuestions);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isThinking]);

  async function submitQuestion(question: string) {
    const trimmed = question.trim();

    if (!trimmed || isThinking) {
      return;
    }

    const userMessage: UiMessage = {
      id: createId("msg"),
      role: "user",
      content: trimmed,
    };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setIsThinking(true);

    try {
      const reply = await askAssistant(trimmed, nextMessages);
      setMessages([
        ...nextMessages,
        {
          id: createId("msg"),
          role: "assistant",
          content: reply.answer,
          meta: reply,
        },
      ]);
      setFollowUps(reply.suggestedFollowUps.length ? reply.suggestedFollowUps.slice(0, 3) : fallbackFollowUps);
    } catch (error) {
      const message = error instanceof Error ? error.message : "The assistant could not respond.";

      setMessages([
        ...nextMessages,
        {
          id: createId("msg"),
          role: "assistant",
          content: message,
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitQuestion(input);
  }

  return (
    <section className="assistant-shell" aria-label="Patterna assistant demo">
      <header className="assistant-header">
        <div>
          <span>Patterna demo</span>
          <strong>Knowledge assistant</strong>
        </div>
        <ShieldCheck size={20} aria-hidden="true" />
      </header>

      <div className="assistant-messages" aria-live="polite" ref={messagesRef}>
        {messages.map((message) => (
          <div className={`assistant-message ${message.role}`} key={message.id}>
            <span>{message.role === "assistant" ? <Bot size={15} /> : <MessageCircle size={15} />}</span>
            <div className="assistant-bubble">
              <p>
                <LinkifiedText text={message.content} />
              </p>
              {message.meta ? <ResponseMeta reply={message.meta} /> : null}
            </div>
          </div>
        ))}

        {isThinking ? (
          <div className="assistant-message assistant">
            <span>
              <Bot size={15} />
            </span>
            <div className="assistant-bubble thinking">
              <p>Gemini is checking the approved knowledge entries</p>
              <div className="typing-dots" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="quick-prompts" aria-label="Suggested questions">
        {followUps.map((question) => (
          <button key={question} type="button" onClick={() => submitQuestion(question)} disabled={isThinking}>
            {question}
          </button>
        ))}
      </div>

      <div className="assistant-note">
        <Sparkles size={16} aria-hidden="true" />
        <p>The browser never receives the Gemini key. It only calls the server route at /api/chat.</p>
      </div>

      <form className="assistant-composer" onSubmit={handleSubmit}>
        <input
          aria-label="Question"
          value={input}
          disabled={isThinking}
          placeholder="Ask a configured knowledge-base question..."
          onChange={(event) => setInput(event.target.value)}
        />
        <button type="submit" aria-label="Send question" disabled={isThinking}>
          <Send size={18} aria-hidden="true" />
        </button>
      </form>
    </section>
  );
}

