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

const fadeIn = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: "easeOut" as const },
};

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

export default function AIChat() {
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
      setError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  return (
    <section
      id="ai-chat"
      aria-label="Ask About Me"
      className="mx-auto w-full max-w-5xl scroll-mt-20 px-6 py-28 sm:py-36"
    >
      <motion.div {...fadeIn} className="mb-12 text-center sm:mb-16">
        <h2 className="inline-block text-3xl font-bold tracking-tight text-cream sm:text-4xl">
          Ask About Me
          <span className="mt-3 block h-1 w-16 rounded-full bg-accent" />
        </h2>
        <p className="mt-5 text-sm text-foreground/60 sm:text-base">
          Powered by Claude AI — ask me anything about Abhi
        </p>
      </motion.div>

      <motion.div {...fadeIn} className="mx-auto w-full max-w-[700px]">
        <GlassCard className="flex flex-col p-5 sm:p-6">
          {/* Message history */}
          <div
            ref={scrollRef}
            className="flex max-h-[400px] min-h-[260px] flex-col gap-4 overflow-y-auto px-1 py-2"
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
      </motion.div>
    </section>
  );
}
