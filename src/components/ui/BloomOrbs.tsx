type BloomColor = "purple" | "blue" | "pink" | "teal";
type BloomDrift = "a" | "b" | "c" | "d";

export interface BloomOrb {
  /** Palette color, mapped to a --color-bloom-* token. */
  color: BloomColor;
  /** Drift animation variant so neighbouring orbs float out of sync. */
  drift: BloomDrift;
  /** Tailwind position + size + blur + opacity classes for this orb. */
  className: string;
}

interface BloomOrbsProps {
  orbs: BloomOrb[];
}

const COLOR_CLASS: Record<BloomColor, string> = {
  purple: "bg-[var(--color-bloom-purple)]",
  blue: "bg-[var(--color-bloom-blue)]",
  pink: "bg-[var(--color-bloom-pink)]",
  teal: "bg-[var(--color-bloom-teal)]",
};

/**
 * Decorative color-bloom layer. Renders large blurred orbs pinned behind the
 * content (`-z-10`) inside an `overflow-hidden` box so the heavy blur never
 * spills out and triggers horizontal scroll. Purely atmospheric — hidden from
 * assistive tech and non-interactive.
 *
 * The host element must establish a stacking context (`relative isolate`) so
 * the `-z-10` orbs sit above its background but below its content.
 */
export default function BloomOrbs({ orbs }: BloomOrbsProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {orbs.map((orb, index) => (
        <span
          key={index}
          className={`bloom-orb bloom-orb--${orb.drift} absolute rounded-full ${COLOR_CLASS[orb.color]} ${orb.className}`}
        />
      ))}
    </div>
  );
}
