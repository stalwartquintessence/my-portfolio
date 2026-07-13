"use client";

import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import BloomOrbs, { type BloomOrb } from "@/components/ui/BloomOrbs";

const ORBS: BloomOrb[] = [
  {
    color: "purple",
    drift: "c",
    className: "-right-32 -top-24 h-[504px] w-[504px] opacity-[0.32] blur-[110px]",
  },
  {
    color: "teal",
    drift: "a",
    className: "-left-32 bottom-0 h-[480px] w-[480px] opacity-[0.28] blur-[110px]",
  },
];

const fadeIn = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: "easeOut" as const },
};

/* -------------------------------------------------------------------------- */
/* Ask My AI — recruiter-facing chat backed by /api/chat (Groq)               */
/* -------------------------------------------------------------------------- */

/**
 * Inline renderer: turns `**bold**` into <strong>. Splitting on the `**…**`
 * capture group keeps the bold text at odd indices.
 */
function renderInline(text: string, keyPrefix: string): ReactNode {
  return text.split(/\*\*(.+?)\*\*/g).map((part, partIndex) =>
    partIndex % 2 === 1 ? (
      <strong key={`${keyPrefix}-${partIndex}`} className="font-semibold text-cream">
        {part}
      </strong>
    ) : (
      <Fragment key={`${keyPrefix}-${partIndex}`}>{part}</Fragment>
    ),
  );
}

/** A line that looks like a table row: contains at least one pipe. */
function isTableRow(line: string): boolean {
  return line.includes("|");
}

/** The `| --- | :--: |` divider between a table header and its body. */
function isSeparatorRow(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.includes("-") && /^\|?[\s:|-]+\|?$/.test(trimmed);
}

/** Split a row into trimmed cells, ignoring the optional outer pipes. */
function splitTableRow(line: string): string[] {
  let cells = line.trim();
  if (cells.startsWith("|")) cells = cells.slice(1);
  if (cells.endsWith("|")) cells = cells.slice(0, -1);
  return cells.split("|").map((cell) => cell.trim());
}

/**
 * Renders assistant text with light markdown support: `**bold**`, newlines,
 * and GitHub-style tables (a header row followed by a `---` separator). Tables
 * become real <table> elements styled for the glass aesthetic; everything else
 * renders as text runs with <br/> between lines.
 */
function renderRichText(text: string): ReactNode {
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let textRun: string[] = [];

  const flushText = () => {
    // Drop runs that are only blank lines (e.g. spacing around a table).
    if (textRun.some((line) => line.trim() !== "")) {
      const run = textRun;
      const key = `text-${blocks.length}`;
      blocks.push(
        <p key={key}>
          {run.map((line, index) => (
            <Fragment key={index}>
              {index > 0 && <br />}
              {renderInline(line, `${key}-${index}`)}
            </Fragment>
          ))}
        </p>,
      );
    }
    textRun = [];
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const next = lines[i + 1];

    if (isTableRow(line) && next !== undefined && isSeparatorRow(next)) {
      flushText();

      const headerCells = splitTableRow(line);
      i += 2; // consume the header + separator rows

      const bodyRows: string[][] = [];
      while (
        i < lines.length &&
        isTableRow(lines[i]) &&
        !isSeparatorRow(lines[i])
      ) {
        bodyRows.push(splitTableRow(lines[i]));
        i += 1;
      }

      const key = `table-${blocks.length}`;
      blocks.push(
        <div key={key} className="my-2 overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-white/20">
                {headerCells.map((cell, cellIndex) => (
                  <th
                    key={cellIndex}
                    className="px-3 py-1.5 font-semibold text-cream"
                  >
                    {renderInline(cell, `${key}-h-${cellIndex}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b border-white/10 last:border-0"
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-3 py-1.5 align-top text-foreground/80"
                    >
                      {renderInline(cell, `${key}-${rowIndex}-${cellIndex}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
    } else {
      textRun.push(line);
      i += 1;
    }
  }

  flushText();

  return <>{blocks}</>;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "What has Abhi built?",
  "What's his tech stack?",
  "Is he available for internships?",
  "Tell me about Doly",
];

function TypingIndicator() {
  return (
    <div
      className="flex items-center gap-1.5 px-1 py-1"
      aria-label="Assistant is typing"
      role="status"
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-accent"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.18,
          }}
        />
      ))}
    </div>
  );
}

function AskMyAI() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the latest message in view as the conversation grows.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isLoading]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setError(null);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      const data: { reply?: string; error?: string } = await res.json();

      if (!res.ok || typeof data.reply !== "string") {
        throw new Error(data.error ?? "Something went wrong.");
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply as string },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  // Empty state gets centered placeholder text; once messages exist they stack
  // from the top and scroll normally.
  const isEmpty = messages.length === 0 && !isLoading;

  return (
    <GlassCard className="flex flex-col p-5 sm:p-6">
      {/* Message history — fixed min/max height so the card keeps a consistent
          size whether empty or full, scrolling instead of growing and pushing
          the input bar (below) off the bottom. Borderless with a premium
          scrollbar so messages feel like they float in space. */}
      <div
        ref={scrollRef}
        className={`premium-scroll flex max-h-[350px] min-h-[300px] flex-col gap-4 overflow-y-auto px-1 py-2 ${
          isEmpty ? "items-center justify-center" : ""
        }`}
        aria-live="polite"
      >
        {messages.length === 0 && !isLoading && (
          <p className="m-auto max-w-sm text-center text-sm text-foreground/50">
            Start a conversation, or tap one of the questions below.
          </p>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "rounded-br-md bg-accent text-background"
                  : "glass rounded-bl-md border border-white/10 text-foreground/90"
              }`}
            >
              {renderRichText(msg.content)}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="glass rounded-2xl rounded-bl-md border border-white/10 px-3 py-2">
              <TypingIndicator />
            </div>
          </div>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-300"
        >
          {error}
        </p>
      )}

      {/* Suggested starter questions */}
      <div className="mt-4 flex flex-wrap gap-2">
        {SUGGESTIONS.map((question) => (
          <button
            key={question}
            type="button"
            onClick={() => void sendMessage(question)}
            disabled={isLoading}
            className="glass rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-foreground/80 transition-all duration-300 hover:border-accent/50 hover:bg-accent/10 hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {question}
          </button>
        ))}
      </div>

      {/* Input row */}
      <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
        <label htmlFor="chat-input" className="sr-only">
          Ask a question about Abhi
        </label>
        <input
          id="chat-input"
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask anything about Abhi…"
          autoComplete="off"
          disabled={isLoading}
          className="glass flex-1 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-cream placeholder:text-foreground/40 transition-colors focus:border-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || input.trim().length === 0}
          aria-label="Send message"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-background shadow-[0_0_20px_rgba(41,151,255,0.4)] transition-all duration-300 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="h-5 w-5"
          >
            <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </form>
    </GlassCard>
  );
}

/* -------------------------------------------------------------------------- */
/* Send a Message — contact form posting to /api/contact (Resend)             */
/* -------------------------------------------------------------------------- */

const INPUT_CLASS =
  "glass w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-cream placeholder:text-foreground/40 transition-colors focus:border-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50";

type Status = "idle" | "loading" | "success" | "error";

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const EMPTY_FORM: FormState = { name: "", email: "", subject: "", message: "" };

function SendAMessage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [status, setStatus] = useState<Status>("idle");

  function updateField(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;

    setStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data: { error?: string } = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong.");
      }

      setStatus("success");
      setForm(EMPTY_FORM);
    } catch {
      setStatus("error");
    }
  }

  const isLoading = status === "loading";

  return (
    <GlassCard className="h-full p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="contact-name" className="text-xs font-medium uppercase tracking-wide text-foreground/60">
            Name
          </label>
          <input
            id="contact-name"
            type="text"
            required
            autoComplete="name"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            disabled={isLoading}
            placeholder="Your name"
            className={INPUT_CLASS}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="contact-email" className="text-xs font-medium uppercase tracking-wide text-foreground/60">
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            disabled={isLoading}
            placeholder="you@company.com"
            className={INPUT_CLASS}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="contact-subject" className="text-xs font-medium uppercase tracking-wide text-foreground/60">
            Subject
          </label>
          <input
            id="contact-subject"
            type="text"
            required
            value={form.subject}
            onChange={(e) => updateField("subject", e.target.value)}
            disabled={isLoading}
            placeholder="What's this about?"
            className={INPUT_CLASS}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="contact-message" className="text-xs font-medium uppercase tracking-wide text-foreground/60">
            Message
          </label>
          <textarea
            id="contact-message"
            required
            rows={4}
            value={form.message}
            onChange={(e) => updateField("message", e.target.value)}
            disabled={isLoading}
            placeholder="Tell me a little about the opportunity…"
            className={`${INPUT_CLASS} min-h-[120px] resize-y`}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="glass mt-2 inline-flex items-center justify-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-5 py-3 text-sm font-semibold text-cream transition-all duration-300 hover:border-accent hover:bg-accent hover:text-background hover:shadow-[0_0_24px_rgba(41,151,255,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 0 1 8-8V0C5.37 0 0 5.37 0 12h4z"
                />
              </svg>
              Sending…
            </>
          ) : (
            "Send Message"
          )}
        </button>

        {status === "success" && (
          <p
            role="status"
            className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-accent"
          >
            Message sent! I&apos;ll get back to you soon.
          </p>
        )}

        {status === "error" && (
          <p
            role="alert"
            className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
          >
            Something went wrong. Please try again.
          </p>
        )}
      </form>
    </GlassCard>
  );
}

/* -------------------------------------------------------------------------- */
/* Combined section                                                           */
/* -------------------------------------------------------------------------- */

export default function GetInTouch() {
  return (
    <section
      id="contact"
      aria-label="Get In Touch"
      className="relative isolate w-full scroll-mt-20 overflow-hidden py-28 sm:py-36"
    >
      <BloomOrbs orbs={ORBS} />

      <div className="mx-auto w-full max-w-6xl px-6">
        <motion.div {...fadeIn} className="mb-12 text-center sm:mb-16">
          <h2 className="inline-block text-3xl font-bold tracking-tight text-cream sm:text-4xl">
            Get In Touch
            <span className="mt-3 block h-1 w-16 rounded-full bg-accent" />
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm text-foreground/60 sm:text-base">
            I&apos;m open to Full Stack and SDE internship opportunities.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Left — Ask My AI */}
          <motion.div {...fadeIn} className="flex flex-col">
            <div className="mb-3 flex items-center gap-3">
              <h3 className="text-lg font-semibold text-cream">Ask My AI</h3>
              <span className="glass inline-flex items-center gap-1.5 rounded-full border border-accent/30 px-2.5 py-1 text-[0.65rem] font-medium text-accent">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
                Powered by Groq
              </span>
            </div>
            <AskMyAI />
          </motion.div>

          {/* Right — Send a Message */}
          <motion.div
            {...fadeIn}
            transition={{ ...fadeIn.transition, delay: 0.08 }}
            className="flex flex-col"
          >
            <div className="mb-3 flex items-center gap-3">
              <h3 className="text-lg font-semibold text-cream">Send a Message</h3>
            </div>
            <SendAMessage />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
