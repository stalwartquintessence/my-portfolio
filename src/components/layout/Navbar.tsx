"use client";

import { useState } from "react";

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
] as const;

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-black/40 backdrop-blur-[20px] backdrop-saturate-[1.8]">
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4"
      >
        <a
          href="#hero"
          className="text-lg font-semibold tracking-tight text-cream"
          aria-label="Abhi — back to top"
        >
          Abhi
        </a>

        {/* Desktop links + resume pill */}
        <div className="hidden items-center gap-8 md:flex">
          <ul className="flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm text-foreground/70 transition-colors hover:text-accent"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Download résumé (PDF)"
            className="glass inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/15 px-4 py-1.5 text-sm font-medium text-accent transition-all duration-300 hover:border-accent/70 hover:bg-accent/25 hover:text-cream hover:shadow-[0_0_20px_rgba(41,151,255,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
          >
            Resume
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-cream transition-colors hover:bg-white/5 md:hidden"
        >
          <span className="relative block h-4 w-5" aria-hidden="true">
            <span
              className={`absolute left-0 block h-0.5 w-5 bg-current transition-transform duration-300 ${
                isMenuOpen ? "top-1.5 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 top-1.5 block h-0.5 w-5 bg-current transition-opacity duration-300 ${
                isMenuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 block h-0.5 w-5 bg-current transition-transform duration-300 ${
                isMenuOpen ? "top-1.5 -rotate-45" : "top-3"
              }`}
            />
          </span>
        </button>
      </nav>

      {/* Mobile menu panel */}
      {isMenuOpen && (
        <ul
          id="mobile-menu"
          className="flex flex-col gap-1 border-t border-white/10 px-6 py-4 md:hidden"
        >
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="block rounded-lg px-2 py-3 text-base text-foreground/80 transition-colors hover:bg-white/5 hover:text-accent"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="mt-2">
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Download résumé (PDF)"
              className="glass block rounded-full border border-accent/40 bg-accent/15 px-4 py-3 text-center text-base font-medium text-accent transition-colors hover:bg-accent/25 hover:text-cream"
            >
              Resume
            </a>
          </li>
        </ul>
      )}
    </header>
  );
}
