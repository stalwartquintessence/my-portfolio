import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Projects from "@/components/sections/Projects";
import Skills from "@/components/sections/Skills";

const SECTIONS = [
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
] as const;

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Projects />
      <Skills />
      {SECTIONS.map((section) => (
        <section
          key={section.id}
          id={section.id}
          aria-label={section.label}
          className="mx-auto flex min-h-[60vh] w-full max-w-5xl scroll-mt-20 items-center px-6 py-24"
        >
          <h2 className="text-2xl font-semibold tracking-tight text-cream/40">
            {section.label}
          </h2>
        </section>
      ))}
    </>
  );
}
