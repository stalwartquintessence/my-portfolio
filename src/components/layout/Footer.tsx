const SOCIAL_LINKS = [
  {
    label: "GitHub",
    href: "https://github.com/stalwartquintessence",
    ariaLabel: "Abhi's GitHub profile",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/abhishek-amkamgari-23b854219/",
    ariaLabel: "Abhi's LinkedIn profile",
  },
] as const;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 px-6 py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-foreground/60">
          © {year} Abhi. All rights reserved.
        </p>
        <nav aria-label="Social links">
          <ul className="flex items-center gap-6">
            {SOCIAL_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.ariaLabel}
                  className="text-sm text-foreground/70 transition-colors hover:text-accent"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
