"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, useInView, animate, useReducedMotion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";

interface Stat {
  /** Numeric target the counter animates toward. */
  value: number;
  /** Decimal places to render (e.g. 1 → "4.0"). */
  decimals: number;
  /** Optional trailing glyph such as "+". */
  suffix?: string;
  label: string;
}

const STATS: Stat[] = [
  { value: 4.0, decimals: 1, label: "GPA" },
  { value: 110, decimals: 0, suffix: "+", label: "PRs merged" },
  { value: 3, decimals: 0, label: "Domains" },
];

interface Capability {
  title: string;
  detail: string;
  icon: ReactNode;
}

const ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  className: "h-5 w-5",
};

const CAPABILITIES: Capability[] = [
  {
    title: "Full Stack Development",
    detail: "React, Next.js, TypeScript, Node.js",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="m18 16 4-4-4-4M6 8l-4 4 4 4M14.5 4l-5 16" />
      </svg>
    ),
  },
  {
    title: "AI Integration",
    detail: "Anthropic API, Groq, medical imaging",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17l-1.9-5.1L4.5 10l5.6-1.4z" />
        <path d="M5 4v3M3.5 5.5h3M18 16v3M16.5 17.5h3" />
      </svg>
    ),
  },
  {
    title: "Cloud & DevOps",
    detail: "AWS, Supabase, Vercel, Docker",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M17.5 19a4.5 4.5 0 0 0 .3-9A6 6 0 0 0 6 8.5 4 4 0 0 0 6.5 19z" />
      </svg>
    ),
  },
  {
    title: "Teaching & Mentoring",
    detail: "TA for CS at Northeastern",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M22 10 12 5 2 10l10 5 10-5zM6 12v4.5c0 1.1 2.7 2.5 6 2.5s6-1.4 6-2.5V12" />
      </svg>
    ),
  },
];

const BIO =
  "I'm Abhi, an MS Computer Science student at Northeastern University " +
  "(GPA 4.0) with a passion for building full stack products that solve " +
  "real problems. I've built legal-tech platforms, healthcare AI tools, " +
  "and real estate software. Currently a Teaching Assistant for " +
  "Object-Oriented Design at Northeastern Miami.";

/**
 * A single stat that counts up from zero the first time it scrolls into view.
 * The animated number is written straight to the DOM node's textContent so we
 * avoid per-frame React re-renders (and the set-state-in-effect lint rule).
 */
function StatCounter({ stat }: { stat: Stat }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(containerRef, { once: true, margin: "-80px" });
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!inView) return;
    const node = numberRef.current;
    if (!node) return;

    if (prefersReducedMotion) {
      node.textContent = stat.value.toFixed(stat.decimals);
      return;
    }

    const controls = animate(0, stat.value, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (latest) => {
        node.textContent = latest.toFixed(stat.decimals);
      },
    });
    return () => controls.stop();
  }, [inView, prefersReducedMotion, stat.value, stat.decimals]);

  return (
    <div ref={containerRef} className="text-center">
      <p className="text-3xl font-bold text-accent sm:text-4xl">
        {/* Starts at 0 so the count-up reads cleanly; JS hydrates the value. */}
        <span ref={numberRef}>{(0).toFixed(stat.decimals)}</span>
        {stat.suffix}
      </p>
      <p className="mt-1 text-xs uppercase tracking-wider text-foreground/60">
        {stat.label}
      </p>
    </div>
  );
}

const fadeIn = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: "easeOut" as const },
};

export default function About() {
  return (
    <section
      id="about"
      aria-label="About Me"
      className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-28 sm:py-36"
    >
      <motion.div {...fadeIn} className="mb-14 text-center sm:mb-20">
        <h2 className="inline-block text-3xl font-bold tracking-tight text-cream sm:text-4xl">
          About Me
          <span className="mt-3 block h-1 w-16 rounded-full bg-accent" />
        </h2>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column: bio + animated stats */}
        <motion.div
          {...fadeIn}
          transition={{ ...fadeIn.transition, delay: 0.05 }}
          className="flex flex-col gap-6"
        >
          <GlassCard className="p-8 sm:p-10">
            <p className="text-base leading-relaxed text-foreground/80 sm:text-lg">
              {BIO}
            </p>
          </GlassCard>

          <GlassCard className="p-8 sm:p-10">
            <div className="grid grid-cols-3 gap-4">
              {STATS.map((stat) => (
                <StatCounter key={stat.label} stat={stat} />
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Right column: "What I Do" capability list */}
        <motion.div
          {...fadeIn}
          transition={{ ...fadeIn.transition, delay: 0.1 }}
        >
          <GlassCard className="h-full p-8 sm:p-10">
            <h3 className="text-xl font-semibold text-cream">What I Do</h3>
            <ul className="mt-6 flex flex-col gap-3">
              {CAPABILITIES.map((capability) => (
                <li key={capability.title}>
                  <div className="group flex items-start gap-4 rounded-xl border border-transparent p-3 transition-all duration-300 hover:border-accent/30 hover:bg-accent/5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-accent/30 bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent/20">
                      {capability.icon}
                    </span>
                    <span>
                      <span className="block font-medium text-cream">
                        {capability.title}
                      </span>
                      <span className="mt-0.5 block text-sm text-foreground/60">
                        {capability.detail}
                      </span>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}
