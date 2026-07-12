"use client";

import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import BloomOrbs, { type BloomOrb } from "@/components/ui/BloomOrbs";

const ORBS: BloomOrb[] = [
  {
    color: "blue",
    drift: "b",
    className: "-left-32 -top-24 h-[400px] w-[400px] opacity-[0.13] blur-[100px]",
  },
  {
    color: "pink",
    drift: "d",
    className: "-right-32 bottom-0 h-[380px] w-[380px] opacity-[0.11] blur-[100px]",
  },
];

interface ExperienceEntry {
  role: string;
  org: string;
  meta: string;
  period: string;
  /** Bullet points; optional for entries that are summarised by meta alone. */
  points?: string[];
}

const ENTRIES: ExperienceEntry[] = [
  {
    role: "Teaching Assistant — Object-Oriented Design (CS 5004)",
    org: "Northeastern University",
    meta: "Miami, FL",
    period: "Jan 2025 — Present",
    points: [
      "Assist Professor with lab sessions and office hours for 60+ students",
      "Grade assignments and provide detailed feedback on OOP design patterns",
      "Hold weekly office hours covering Java, design patterns, SOLID principles",
    ],
  },
  {
    role: "Teaching Assistant — Algorithms (CS 5800)",
    org: "Northeastern University",
    meta: "Miami, FL",
    period: "Sep 2024 — Present",
    points: [
      "Support instruction for graduate-level algorithms course",
      "Help students with complexity analysis, dynamic programming, graph algorithms",
    ],
  },
  {
    role: "Full Stack Developer — Doly (Legal Tech Platform)",
    org: "Northeastern University Global Innovation Challenge",
    meta: "Miami, FL",
    period: "Jan 2025 — May 2025",
    points: [
      "Built AI-powered legal document platform from 0 to 110+ PRs merged",
      "Integrated Groq AI for document analysis and intelligent Q&A",
      "Stack: Next.js, TypeScript, Supabase, Vercel",
    ],
  },
  {
    role: "Full Stack Developer — SellCRE",
    org: "Gorin Systems",
    meta: "Remote",
    period: "2024",
    points: [
      "Built commercial real estate platform with property listings and broker tools",
      "Stack: React, TypeScript, Node.js, PostgreSQL",
    ],
  },
  {
    role: "MS Computer Science Student",
    org: "Northeastern University",
    meta: "Khoury College of Computer Sciences",
    period: "2024 — Present",
    points: ["GPA: 4.0"],
  },
];

const fadeIn = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: "easeOut" as const },
};

/**
 * A single timeline entry. On desktop it sits in one half of the two-column
 * grid and slides in from its own side; on mobile every entry is left-aligned
 * beside a single rail. `side` ("left" | "right") drives both placement and the
 * slide-in direction.
 */
function TimelineEntry({
  entry,
  side,
}: {
  entry: ExperienceEntry;
  side: "left" | "right";
}) {
  const isLeft = side === "left";

  return (
    <div className="relative md:grid md:grid-cols-2 md:gap-12">
      {/* Glowing dot on the rail (left rail on mobile, center rail on desktop). */}
      <span
        aria-hidden="true"
        className="absolute left-[-1.875rem] top-2 z-10 h-4 w-4 rounded-full border-2 border-accent bg-background shadow-[0_0_14px_rgba(41,151,255,0.9)] md:left-1/2 md:-translate-x-1/2"
      />

      {/* Spacer keeps the card in the correct half on desktop. */}
      {!isLeft && <div className="hidden md:block" aria-hidden="true" />}

      <motion.div
        initial={{ opacity: 0, x: isLeft ? -48 : 48 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={isLeft ? "md:text-right" : ""}
      >
        <GlassCard className="p-7 sm:p-8">
          <h3 className="text-lg font-semibold text-cream">{entry.role}</h3>
          <p className="mt-1 text-sm font-medium text-accent">{entry.org}</p>
          <p className="mt-1 text-xs text-foreground/60">
            {entry.period} · {entry.meta}
          </p>

          {entry.points && (
            <ul
              className={`mt-4 flex flex-col gap-2 text-sm leading-relaxed text-foreground/75 ${
                isLeft ? "md:items-end" : ""
              }`}
            >
              {entry.points.map((point) => (
                <li
                  key={point}
                  className={`relative pl-4 ${isLeft ? "md:pl-0 md:pr-4 md:text-right" : ""}`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute top-2 h-1.5 w-1.5 rounded-full bg-accent/70 left-0 ${
                      isLeft ? "md:left-auto md:right-0" : ""
                    }`}
                  />
                  {point}
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}

export default function Experience() {
  return (
    <section
      id="experience"
      aria-label="Experience"
      className="relative isolate mx-auto w-full max-w-5xl scroll-mt-20 overflow-hidden px-6 py-28 sm:py-36"
    >
      <BloomOrbs orbs={ORBS} />

      <motion.div {...fadeIn} className="mb-14 text-center sm:mb-20">
        <h2 className="inline-block text-3xl font-bold tracking-tight text-cream sm:text-4xl">
          Experience
          <span className="mt-3 block h-1 w-16 rounded-full bg-accent" />
        </h2>
      </motion.div>

      {/* The rail: a vertical line on the left (mobile) / center (desktop). */}
      <div className="relative pl-8 md:pl-0">
        <span
          aria-hidden="true"
          className="absolute top-0 bottom-0 left-2 w-px bg-gradient-to-b from-transparent via-accent/40 to-transparent md:left-1/2 md:-translate-x-1/2"
        />

        <div className="flex flex-col gap-14 sm:gap-16">
          {ENTRIES.map((entry, index) => (
            <TimelineEntry
              key={entry.role}
              entry={entry}
              side={index % 2 === 0 ? "left" : "right"}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
