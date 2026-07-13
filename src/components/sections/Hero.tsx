"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import {
  siNextdotjs,
  siReact,
  siTypescript,
  siNodedotjs,
  siPython,
  siDocker,
  type SimpleIcon,
} from "simple-icons";
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

// Vibrant glass pills floating around the hero card, each showing a real tech
// logo (simple-icons) above its short name. Each drifts on its own timing so
// the cluster feels organic. Hidden on mobile (the card fills the viewport).
interface TechBadge {
  /** Brand logo from simple-icons (supplies the SVG path). */
  icon: SimpleIcon;
  /** Short display name shown under the icon. */
  name: string;
  /**
   * Static Tailwind `fill-[#hex]` class for the brand color. Next.js is forced
   * light (its brand mark is black) so it reads on the dark glass pill.
   */
  iconClass: string;
  /** Tailwind absolute-position classes, relative to the card wrapper. */
  position: string;
  /** Float animation variant + timing class. */
  float: string;
}

// Positions are anchored to the card wrapper (not the viewport) with small
// negative offsets, so each pill hugs just outside the card edge and reads as
// belonging to the card rather than drifting across the screen.
const TECH_BADGES: TechBadge[] = [
  { icon: siNextdotjs, name: "Next.js", iconClass: "fill-[#f5f5f7]", position: "-left-12 top-12", float: "tech-badge--1" },
  { icon: siReact, name: "React", iconClass: "fill-[#61DAFB]", position: "-right-12 top-12", float: "tech-badge--2" },
  { icon: siTypescript, name: "TypeScript", iconClass: "fill-[#3178C6]", position: "-left-20 top-[44%]", float: "tech-badge--3" },
  { icon: siNodedotjs, name: "Node.js", iconClass: "fill-[#5FA04E]", position: "-right-20 top-1/2", float: "tech-badge--4" },
  { icon: siPython, name: "Python", iconClass: "fill-[#3776AB]", position: "-left-10 bottom-14", float: "tech-badge--5" },
  { icon: siDocker, name: "Docker", iconClass: "fill-[#2496ED]", position: "-right-10 bottom-14", float: "tech-badge--6" },
];

const TITLE = "Hi, I'm Abhi";
const NAME_START = TITLE.indexOf("Abhi");

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const memojiParallaxRef = useRef<HTMLDivElement>(null);
  const pillsParallaxRef = useRef<HTMLDivElement>(null);
  const orbsParallaxRef = useRef<HTMLDivElement>(null);

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
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Mouse parallax: memoji leans toward the cursor, the card tech pills drift
  // the opposite way (counter-parallax), and the bloom orbs shift a hair for
  // depth. Desktop / fine-pointer only, and disabled under reduced-motion.
  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!finePointer || prefersReducedMotion) {
      return;
    }

    const handleMove = (event: MouseEvent) => {
      // Normalized -1..1 offset from the viewport center.
      const nx = (event.clientX / window.innerWidth) * 2 - 1;
      const ny = (event.clientY / window.innerHeight) * 2 - 1;

      const memoji = memojiParallaxRef.current;
      const pills = pillsParallaxRef.current;
      const orbs = orbsParallaxRef.current;

      // Memoji: toward the cursor, capped at 8px.
      if (memoji) {
        memoji.style.transform = `translate3d(${nx * 8}px, ${ny * 8}px, 0)`;
      }
      // Tech pills: opposite direction, slightly larger for a layered feel.
      if (pills) {
        pills.style.transform = `translate3d(${nx * -12}px, ${ny * -12}px, 0)`;
      }
      // Bloom orbs: barely there (max ~2px) for subtle depth.
      if (orbs) {
        orbs.style.transform = `translate3d(${nx * 2}px, ${ny * 2}px, 0)`;
      }
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      aria-label="Introduction"
      className="relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden px-6"
    >
      {/* Ambient color blooms, pinned behind everything (-z-10). Wrapped in a
          parallax layer that drifts a couple pixels with the cursor. */}
      <div
        ref={orbsParallaxRef}
        className="pointer-events-none absolute inset-0 -z-10 transition-transform duration-100 ease-out [will-change:transform]"
      >
        <BloomOrbs orbs={HERO_ORBS} />
      </div>

      {/* Card + its orbiting tech pills share one sized wrapper so the pills
          are positioned relative to the card, not the viewport. */}
      <div className="relative z-10 w-full max-w-2xl">
        {/* Floating tech pills hugging the card edges. Decorative, desktop-only.
            Counter-parallax: drifts opposite the cursor. */}
        <div
          ref={pillsParallaxRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[5] hidden transition-transform duration-100 ease-out [will-change:transform] md:block"
        >
          {TECH_BADGES.map((badge) => (
            <span
              key={badge.name}
              className={`hero-badge tech-badge glass absolute flex flex-col items-center gap-1 rounded-2xl border border-white/15 px-4 py-3 shadow-[0_6px_24px_rgba(0,0,0,0.4)] ${badge.position} ${badge.float}`}
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className={`h-6 w-6 ${badge.iconClass}`}
              >
                <path d={badge.icon.path} />
              </svg>
              <span className="text-[0.7rem] font-medium text-foreground/80">
                {badge.name}
              </span>
            </span>
          ))}
        </div>

        <GlassCard className="relative w-full overflow-hidden px-8 py-12 text-center sm:px-12 sm:py-16">
          {/* Full-bleed Memoji "movie poster" backdrop: anchored to the top,
              bleeding to the card edges, fading into the card at the bottom via
              a gradient mask so the text below reads over the faded lower half.
              Its own parallax layer leans it toward the cursor. Decorative. */}
          <div
            ref={memojiParallaxRef}
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-8 -top-12 z-0 h-80 transition-transform duration-100 ease-out [will-change:transform] sm:-inset-x-12 sm:-top-16 sm:h-[26rem]"
          >
            <div className="hero-memoji memoji-poster relative h-full w-full">
              <Image
                src="/memoji.png"
                alt=""
                fill
                priority
                sizes="(max-width: 640px) 100vw, 42rem"
                className="object-contain object-top"
              />
            </div>
          </div>

          {/* Text content sits on top of the faded lower half of the poster. */}
          <div className="relative z-10 pt-40 sm:pt-52">
            <h1 className="overflow-hidden text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
              {TITLE.split("").map((char, index) => (
                <span
                  key={index}
                  className={`hero-char inline-block ${
                    index >= NAME_START ? "text-accent" : "text-cream"
                  }`}
                >
                  {char === " " ? "\u00A0" : char}
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
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
