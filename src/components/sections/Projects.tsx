"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import BloomOrbs, { type BloomOrb } from "@/components/ui/BloomOrbs";

const ORBS: BloomOrb[] = [
  {
    color: "pink",
    drift: "a",
    className: "-left-40 -top-24 h-[528px] w-[528px] opacity-[0.30] blur-[110px]",
  },
  {
    color: "teal",
    drift: "d",
    className: "-right-40 bottom-0 h-[552px] w-[552px] opacity-[0.28] blur-[110px]",
  },
  {
    color: "blue",
    drift: "b",
    className: "right-0 top-1/3 h-[432px] w-[432px] opacity-[0.25] blur-[100px]",
  },
];

interface Project {
  title: string;
  subtitle: string;
  description: string;
  /** Category tags — also drive the filter bar. */
  categories: string[];
  tech: string[];
  /** Optional highlight badge, e.g. a competition placement. */
  badge?: string;
  github: string;
  demo?: string;
}

const PROJECTS: Project[] = [
  {
    title: "Doly",
    subtitle: "Legal Tech Platform",
    description:
      "AI-powered legal document platform built for the Northeastern University Global Innovation Challenge. Features document analysis, intelligent Q&A, and real-time collaboration.",
    categories: ["Legal Tech", "Full Stack", "AI"],
    tech: ["Next.js", "TypeScript", "Supabase", "Groq AI", "Vercel"],
    badge: "NUGIC Finalist",
    github: "https://github.com/GeorgeDavidson2/Doly_Dentons",
    demo: "#",
  },
  {
    title: "Vibes",
    subtitle: "Gamification Platform",
    description:
      "Gamification platform built during CS 6966 Practicum for KidzHack. Engagement mechanics, real-time leaderboards, and reward systems.",
    categories: ["Full Stack"],
    tech: ["React", "Node.js", "PostgreSQL", "Redis"],
    // TODO: replace with the real Vibes repository URL once available.
    github: "#",
  },
  {
    title: "SellCRE",
    subtitle: "Real Estate Platform",
    description:
      "Commercial real estate platform for Gorin Systems. Property listings, advanced search, and broker management tools.",
    categories: ["Full Stack"],
    tech: ["React", "TypeScript", "Node.js", "PostgreSQL"],
    // TODO: replace with the real SellCRE repository URL once available.
    github: "#",
  },
  {
    title: "Healthcare AI Research",
    subtitle: "Medical Imaging & Deep Learning",
    description:
      "Deep learning models for early detection of Parkinson's disease and breast cancer using medical imaging and signal processing.",
    categories: ["AI/ML", "Healthcare"],
    tech: ["Python", "TensorFlow", "Medical Imaging"],
    github: "https://github.com/stalwartquintessence",
  },
  {
    title: "Serverless Cloud Architecture",
    subtitle: "AWS Infrastructure",
    description:
      "Scalable serverless application on AWS with Lambda, API Gateway, S3, and automated CI/CD pipelines via GitHub Actions.",
    categories: ["Full Stack"],
    tech: ["AWS Lambda", "API Gateway", "S3", "Docker", "GitHub Actions"],
    github: "https://github.com/CloudComputingMIA2025/team_awj",
  },
];

const FILTERS = ["All", "Full Stack", "AI/ML", "Healthcare", "Legal Tech"];

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4">
      <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17 4.6 18 4.9 18 4.9c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

function LinkButton({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className="glass inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-foreground/90 transition-all duration-300 hover:border-accent/50 hover:bg-accent/10 hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
    >
      {icon}
      {label}
    </a>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

function ProjectCard({ project }: { project: Project }) {
  return (
    <motion.article
      variants={cardVariants}
      whileHover={{ y: -8 }}
      transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
      className="h-full"
    >
      <GlassCard className="group relative flex h-full flex-col p-7 transition-colors duration-300 hover:border-accent/30">
        {project.badge ? (
          <span className="absolute right-5 top-5 rounded-full border border-accent/40 bg-accent/15 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-accent">
            {project.badge}
          </span>
        ) : null}

        <h3 className="pr-24 text-xl font-semibold text-cream">
          {project.title}
        </h3>
        <p className="mt-0.5 text-sm font-medium text-accent">
          {project.subtitle}
        </p>

        <p className="mt-4 text-sm leading-relaxed text-foreground/70">
          {project.description}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {project.tech.map((tech) => (
            <span
              key={tech}
              className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[0.7rem] text-foreground/70"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Spacer pushes categories + links to the bottom for even card heights. */}
        <div className="mt-auto" />

        <div className="mt-5 flex flex-wrap gap-2">
          {project.categories.map((category) => (
            <span
              key={category}
              className="rounded-full bg-accent/10 px-2.5 py-1 text-[0.7rem] font-medium text-accent/90"
            >
              {category}
            </span>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <LinkButton
            href={project.github}
            label="GitHub"
            icon={<GithubIcon />}
          />
          {project.demo ? (
            <LinkButton
              href={project.demo}
              label="Live Demo"
              icon={<ExternalLinkIcon />}
            />
          ) : null}
        </div>
      </GlassCard>
    </motion.article>
  );
}

export default function Projects() {
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const filtered =
    activeFilter === "All"
      ? PROJECTS
      : PROJECTS.filter((project) =>
          project.categories.includes(activeFilter),
        );

  return (
    <section
      id="projects"
      aria-label="Projects"
      className="relative isolate w-full scroll-mt-20 overflow-hidden py-28 sm:py-36"
    >
      <BloomOrbs orbs={ORBS} />

      <div className="mx-auto w-full max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-12 text-center"
        >
          <h2 className="inline-block text-3xl font-bold tracking-tight text-cream sm:text-4xl">
            Projects
            <span className="mt-3 block h-1 w-16 rounded-full bg-accent" />
          </h2>
        </motion.div>

        {/* Filter bar */}
        <div
          role="group"
          aria-label="Filter projects by category"
          className="mb-12 flex flex-wrap justify-center gap-3"
        >
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                aria-pressed={isActive}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
                  isActive
                    ? "bg-accent text-background shadow-[0_0_24px_rgba(41,151,255,0.4)]"
                    : "glass border border-white/15 text-foreground/80 hover:border-accent/40 hover:text-cream"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        {/* Project grid. Keyed by the active filter so the list remounts cleanly
            on each change and re-runs the staggered reveal. */}
        <motion.div
          key={activeFilter}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((project) => (
            <ProjectCard key={project.title} project={project} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
