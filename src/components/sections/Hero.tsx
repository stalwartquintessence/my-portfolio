"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import GlassCard from "@/components/ui/GlassCard";
import BloomOrbs, { type BloomOrb } from "@/components/ui/BloomOrbs";

// Four large blurred orbs anchored to each corner, floating behind the 3D
// scene to give the hero an Apple-style vibrant glow.
const HERO_ORBS: BloomOrb[] = [
  {
    color: "purple",
    drift: "a",
    className: "-left-40 -top-40 h-[680px] w-[680px] opacity-[0.22] blur-[120px]",
  },
  {
    color: "blue",
    drift: "b",
    className: "-right-40 -top-32 h-[640px] w-[640px] opacity-[0.20] blur-[120px]",
  },
  {
    color: "pink",
    drift: "c",
    className: "-left-32 -bottom-40 h-[600px] w-[600px] opacity-[0.18] blur-[120px]",
  },
  {
    color: "teal",
    drift: "d",
    className: "-right-40 -bottom-40 h-[760px] w-[760px] opacity-[0.16] blur-[120px]",
  },
];

// Three.js scene is client-only and lazy-loaded so it never blocks first paint.
const HeroScene = dynamic(() => import("@/components/three/HeroScene"), {
  ssr: false,
});

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
          ".hero-char",
          { yPercent: 120, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.035 },
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
      {/* Ambient color blooms, pinned behind the 3D canvas (-z-10 < z-0). */}
      <BloomOrbs orbs={HERO_ORBS} />

      {/* Decorative 3D background: absolutely positioned and pinned to z-0 so
          it always sits behind the z-10 content. */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <HeroScene />
      </div>

      <GlassCard className="relative z-10 max-w-2xl px-8 py-12 text-center sm:px-12 sm:py-16">
        <h1 className="overflow-hidden text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
          {TITLE.split("").map((char, index) => (
            <span
              key={index}
              className={`hero-char inline-block ${
                index >= NAME_START ? "text-accent" : "text-cream"
              }`}
            >
              {char === " " ? " " : char}
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
