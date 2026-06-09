"use client";

import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";

interface Skill {
  name: string;
  /** Proficiency as a percentage (0–100); drives the bar fill width. */
  level: number;
}

interface SkillCategory {
  title: string;
  skills: Skill[];
}

const CATEGORIES: SkillCategory[] = [
  {
    title: "Frontend",
    skills: [
      { name: "React / Next.js", level: 95 },
      { name: "TypeScript", level: 90 },
      { name: "Tailwind CSS", level: 90 },
      { name: "Three.js / WebGL", level: 75 },
      { name: "Framer Motion", level: 80 },
    ],
  },
  {
    title: "Backend",
    skills: [
      { name: "Node.js", level: 88 },
      { name: "PostgreSQL", level: 85 },
      { name: "MongoDB", level: 80 },
      { name: "Redis", level: 75 },
      { name: "REST APIs", level: 92 },
    ],
  },
  {
    title: "Cloud & DevOps",
    skills: [
      { name: "AWS (Lambda, S3, API Gateway)", level: 82 },
      { name: "Docker", level: 78 },
      { name: "GitHub Actions CI/CD", level: 85 },
      { name: "Vercel", level: 90 },
      { name: "Supabase", level: 88 },
    ],
  },
  {
    title: "AI & Other",
    skills: [
      { name: "Python", level: 85 },
      { name: "TensorFlow", level: 75 },
      { name: "Anthropic API", level: 88 },
      { name: "Java", level: 85 },
      { name: "C++", level: 80 },
    ],
  },
];

const fadeIn = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: "easeOut" as const },
};

/**
 * A labelled proficiency bar. The fill animates from 0 to its target width the
 * first time it scrolls into view, staggered by its index within the category.
 */
function SkillBar({ skill, index }: { skill: Skill; index: number }) {
  return (
    <li>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium text-cream">{skill.name}</span>
        <span className="text-foreground/60">{skill.level}%</span>
      </div>
      <div
        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-label={skill.name}
        aria-valuenow={skill.level}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          className="h-full rounded-full bg-accent shadow-[0_0_12px_rgba(41,151,255,0.5)]"
          initial={{ width: 0 }}
          whileInView={{ width: `${skill.level}%` }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{
            duration: 1,
            ease: "easeOut",
            delay: index * 0.08,
          }}
        />
      </div>
    </li>
  );
}

export default function Skills() {
  return (
    <section
      id="skills"
      aria-label="Skills"
      className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-28 sm:py-36"
    >
      <motion.div {...fadeIn} className="mb-14 text-center sm:mb-20">
        <h2 className="inline-block text-3xl font-bold tracking-tight text-cream sm:text-4xl">
          Skills
          <span className="mt-3 block h-1 w-16 rounded-full bg-accent" />
        </h2>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {CATEGORIES.map((category, categoryIndex) => (
          <motion.div
            key={category.title}
            {...fadeIn}
            transition={{ ...fadeIn.transition, delay: categoryIndex * 0.08 }}
          >
            <GlassCard className="h-full p-8 sm:p-10">
              <h3 className="text-xl font-semibold text-cream">
                {category.title}
              </h3>
              <ul className="mt-6 flex flex-col gap-5">
                {category.skills.map((skill, index) => (
                  <SkillBar key={skill.name} skill={skill} index={index} />
                ))}
              </ul>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
