"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import GlassCard from "@/components/ui/GlassCard";
import BloomOrbs, { type BloomOrb } from "@/components/ui/BloomOrbs";

// Four large blurred orbs anchored to each corner, floating behind the hero
// content to give it an Apple-style vibrant glow.
const HERO_ORBS: BloomOrb[] = [
  {
    color: "purple",
    drift: "a",
    className: "-left-40 -top-40 h-[816px] w-[816px] opacity-[0.35] blur-[120px]",
  },
  {
    color: "blue",
    drift: "b",
    className: "-right-40 -top-32 h-[768px] w-[768px] opacity-[0.32] blur-[120px]",
  },
  {
    color: "pink",
    drift: "c",
    className: "-left-32 -bottom-40 h-[720px] w-[720px] opacity-[0.30] blur-[120px]",
  },
  {
    color: "teal",
    drift: "d",
    className: "-right-40 -bottom-40 h-[912px] w-[912px] opacity-[0.28] blur-[120px]",
  },
];

// Small glass pills floating around the hero card. Positions are anchored to
// the section edges; each pill drifts on its own timing so the cluster feels
// organic. Hidden on mobile (the card fills the viewport there).
interface TechBadge {
  label: string;
  /** Tailwind absolute-position classes, relative to the section. */
  position: string;
  /** Float animation variant + timing class. */
  float: string;
}

const TECH_BADGES: TechBadge[] = [
  { label: "Next.js", position: "left-[10%] top-[24%]", float: "tech-badge--1" },
  { label: "TypeScript", position: "right-[9%] top-[20%]", float: "tech-badge--2" },
  { label: "React", position: "left-[6%] top-1/2", float: "tech-badge--3" },
  { label: "Node.js", position: "right-[7%] top-[58%]", float: "tech-badge--4" },
  { label: "AI/ML", position: "left-[15%] bottom-[22%]", float: "tech-badge--5" },
  { label: "Three.js", position: "right-[14%] bottom-[20%]", float: "tech-badge--6" },
];

const TITLE = "Hi, I'm Abhi";
const NAME_START = TITLE.indexOf("Abhi");

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) {
      return;
    }

    const ctx = gsap.context(() => {
      // Use fromTo with explicit end states (opacity: 1). Plain .from() infers
      // the end value from the element's current style, which can be captured
      // as 0 mid-mount and leave the element permanently invisible.
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
      timeline
        .fromTo(
          ".hero-memoji",
          { y: 24, opacity: 0, scale: 0.85 },
          { y: 0, opacity: 1, scale: 1, duration: 0.7 },
        )
        .fromTo(
          ".hero-char",
          { yPercent: 120, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.035 },
          "-=0.3",
        )
        .fromTo(
          ".hero-subtitle",
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          "-=0.35",
        )
        .fromTo(
          ".hero-cta",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.12 },
          "-=0.2",
        )
        .fromTo(
          ".hero-badge",
          { opacity: 0, scale: 0.85 },
          { opacity: 1, scale: 1, duration: 0.5, stagger: 0.1 },
          "-=0.25",
        )
        .fromTo(
          ".hero-scroll",
          { opacity: 0 },
          { opacity: 1, duration: 0.6 },
          "-=0.1",
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      aria-label="Introduction"
      className="relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden px-6"
    >
      {/* Ambient color blooms, pinned behind everything (-z-10). */}
      <BloomOrbs orbs={HERO_ORBS} />

      {/* Floating tech pills orbiting the card. Decorative, desktop-only. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[5] hidden md:block"
      >
        {TECH_BADGES.map((badge) => (
          <span
            key={badge.label}
            className={`hero-badge tech-badge glass absolute rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-foreground/80 shadow-[0_4px_20px_rgba(0,0,0,0.35)] ${badge.position} ${badge.float}`}
          >
            {badge.label}
          </span>
        ))}
      </div>

      <GlassCard className="relative z-10 max-w-2xl px-8 py-12 text-center sm:px-12 sm:py-16">
        {/* Memoji: soft bloom glow + rotating iridescent ring + bobbing image. */}
        <div className="hero-memoji relative mx-auto mb-8 h-[180px] w-[180px]">
          <span aria-hidden="true" className="memoji-glow" />
          <div className="memoji-bob relative h-full w-full">
            <div className="memoji-ring h-full w-full">
              <div className="memoji-inner flex h-full w-full items-center justify-center">
                <Image
                  src="/memoji.png"
                  alt="Abhi's Memoji avatar"
                  width={180}
                  height={180}
                  priority
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        <h1 className="overflow-hidden text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
          {TITLE.split("").map((char, index) => (
            <span
              key={index}
              className={`hero-char inline-block ${
                index >= NAME_START ? "text-accent" : "text-cream"
              }`}
            >
              {char === " " ? " " : char}
            </span>
          ))}
        </h1>

        <p className="hero-subtitle mx-auto mt-6 max-w-md text-base text-foreground/70 sm:text-lg">
          Full Stack Developer &amp; CS Student at Northeastern
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#projects"
            className="hero-cta glass inline-flex w-full items-center justify-center rounded-full border border-accent/40 bg-accent/15 px-7 py-3 text-sm font-medium text-cream transition-all duration-300 hover:border-accent/70 hover:bg-accent/25 hover:shadow-[0_0_30px_rgba(41,151,255,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 sm:w-auto"
          >
            View My Work
          </a>
          <a
            href="#contact"
            className="hero-cta glass inline-flex w-full items-center justify-center rounded-full border border-white/15 px-7 py-3 text-sm font-medium text-foreground/90 transition-all duration-300 hover:border-white/30 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:w-auto"
          >
            Let&apos;s Talk
          </a>
        </div>
      </GlassCard>

      <a
        href="#about"
        aria-label="Scroll to About section"
        className="hero-scroll absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-foreground/50 transition-colors hover:text-accent"
      >
        <span className="flex flex-col items-center gap-2">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 animate-bounce"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </a>
    </section>
  );
}
