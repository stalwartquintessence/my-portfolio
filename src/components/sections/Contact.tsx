"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";

const fadeIn = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: "easeOut" as const },
};

interface ContactLink {
  label: string;
  value: string;
  href: string;
  icon: ReactNode;
}

const CONTACT_LINKS: ContactLink[] = [
  {
    label: "GitHub",
    value: "github.com/stalwartquintessence",
    href: "https://github.com/stalwartquintessence",
    icon: (
      <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.72-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.57 2.34 1.12 2.91.85.09-.66.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.05a9.36 9.36 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.46.1 2.72.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2z" />
    ),
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/placeholder",
    href: "https://linkedin.com/in/placeholder",
    icon: (
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3V9zm6 0h3.83v1.64h.05c.53-1 1.84-2.06 3.79-2.06 4.05 0 4.8 2.67 4.8 6.14V21h-4v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.07 1.4-2.07 2.85V21H9V9z" />
    ),
  },
];

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

export default function Contact() {
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
    <section
      id="contact"
      aria-label="Get In Touch"
      className="mx-auto w-full max-w-5xl scroll-mt-20 px-6 py-28 sm:py-36"
    >
      <motion.div {...fadeIn} className="mb-12 text-center sm:mb-16">
        <h2 className="inline-block text-3xl font-bold tracking-tight text-cream sm:text-4xl">
          Get In Touch
          <span className="mt-3 block h-1 w-16 rounded-full bg-accent" />
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-sm text-foreground/60 sm:text-base">
          I&apos;m currently open to Full Stack and SDE internship/co-op
          opportunities. Let&apos;s talk.
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left — connect / links */}
        <motion.div {...fadeIn}>
          <GlassCard className="flex h-full flex-col p-6 sm:p-8">
            <h3 className="text-xl font-semibold text-cream">Let&apos;s Connect</h3>
            <p className="mt-3 text-sm leading-relaxed text-foreground/70">
              Whether you&apos;re a recruiter, collaborator, or just want to say
              hi — my inbox is always open.
            </p>

            <ul className="mt-8 flex flex-col gap-5">
              {CONTACT_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 rounded-xl outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent/60"
                    aria-label={`${link.label}: ${link.value}`}
                  >
                    <span className="glass inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 text-accent transition-all duration-300 group-hover:border-accent/50 group-hover:bg-accent/10">
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                        className="h-5 w-5"
                      >
                        {link.icon}
                      </svg>
                    </span>
                    <span className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-foreground/50">
                        {link.label}
                      </span>
                      <span className="text-sm text-foreground/90 transition-colors group-hover:text-cream">
                        {link.value}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </GlassCard>
        </motion.div>

        {/* Right — contact form */}
        <motion.div {...fadeIn}>
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
                  className={`${INPUT_CLASS} resize-y`}
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
        </motion.div>
      </div>
    </section>
  );
}
