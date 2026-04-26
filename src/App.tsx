import { ArrowUpRight, Braces, Database, KeyRound, LockKeyhole, MessageSquareText, ShieldCheck } from "lucide-react";
import { KnowledgeAssistant } from "./components/KnowledgeAssistant";

const capabilities = [
  {
    icon: <Database size={20} aria-hidden="true" />,
    title: "Configurable knowledge",
    text: "Approved FAQ, policy, product, onboarding, or support entries are supplied through server environment configuration.",
  },
  {
    icon: <LockKeyhole size={20} aria-hidden="true" />,
    title: "Server-side Gemini call",
    text: "The client talks to /api/chat. The API key stays on the server and is never bundled into browser code.",
  },
  {
    icon: <Braces size={20} aria-hidden="true" />,
    title: "Structured responses",
    text: "Gemini returns JSON with an answer, confidence, source labels, cannot-answer state, and follow-up prompts.",
  },
];

function App() {
  return (
    <>
      <header className="site-header">
        <a className="brand" href="#top">
          Patterna
        </a>
        <nav aria-label="Primary navigation">
          <a href="#overview">Overview</a>
          <a href="#architecture">Architecture</a>
          <a href="https://github.com/alex-devhub/patterna-ai-assistant" target="_blank" rel="noreferrer">
            GitHub
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <p className="kicker">Configurable AI assistant</p>
            <h1>Answer from approved knowledge, not guesswork.</h1>
            <p>
              Patterna is a React and Vercel starter for Gemini-powered knowledge assistants. It is designed for
              businesses or portfolios that need controlled answers from approved content, visible source metadata, and
              a private server-side API key.
            </p>
            <div className="hero-actions">
              <a className="button primary" href="#demo">
                <MessageSquareText size={18} aria-hidden="true" />
                Try the demo
              </a>
              <a className="button secondary" href="#architecture">
                <ShieldCheck size={18} aria-hidden="true" />
                View architecture
              </a>
            </div>
          </div>

          <div className="proof-panel" aria-label="Project focus">
            <span>Business pattern</span>
            <strong>Approved knowledge in. Structured answer out.</strong>
            <p>
              Replace the knowledge entries with support policies, product notes, service FAQs, or internal process
              guidance. The interface and API route stay the same.
            </p>
          </div>
        </section>

        <section className="section overview" id="overview">
          <div className="section-heading">
            <p className="kicker">Project goal</p>
            <h2>Useful AI integration with clear boundaries.</h2>
            <p>
              Patterna is intentionally more than a prompt box. It shows the parts an employer or small business would
              expect from a controlled assistant: private keys, configurable knowledge, structured model output, and
              honest handling when the answer is not known.
            </p>
          </div>

          <div className="capability-grid">
            {capabilities.map((capability) => (
              <article key={capability.title}>
                {capability.icon}
                <h3>{capability.title}</h3>
                <p>{capability.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section demo-section" id="demo">
          <div className="demo-copy">
            <p className="kicker">Live interface</p>
            <h2>One chat surface, any approved knowledge base.</h2>
            <p>
              The demo calls the same API route used in production. If the server has no Gemini key or knowledge JSON
              configured, it fails clearly instead of faking a local answer.
            </p>
            <ul>
              <li>
                <KeyRound size={18} aria-hidden="true" />
                Secret key is read only by the server route.
              </li>
              <li>
                <Braces size={18} aria-hidden="true" />
                The UI renders JSON fields from Gemini.
              </li>
              <li>
                <Database size={18} aria-hidden="true" />
                Knowledge is replaceable without rewriting the chat component.
              </li>
            </ul>
          </div>

          <div className="demo-panel">
            <KnowledgeAssistant />
          </div>
        </section>

        <section className="section architecture" id="architecture">
          <div className="section-heading">
            <p className="kicker">Implementation</p>
            <h2>Small codebase, clear responsibilities.</h2>
          </div>
          <div className="flow-grid">
            <article>
              <span>1</span>
              <h3>React client</h3>
              <p>Collects the question and recent chat history, then posts to /api/chat.</p>
            </article>
            <article>
              <span>2</span>
              <h3>Server route</h3>
              <p>Reads environment variables, validates the request, and builds the knowledge-grounded Gemini prompt.</p>
            </article>
            <article>
              <span>3</span>
              <h3>Gemini response</h3>
              <p>Returns structured JSON that the UI can render predictably, including confidence and sources.</p>
            </article>
          </div>
        </section>
      </main>
    </>
  );
}

export default App;

