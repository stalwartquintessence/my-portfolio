import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

/**
 * Reusable liquid-glass surface: frosted backdrop blur, subtle gradient border,
 * and a soft top highlight. Compose layout/spacing via the `className` prop.
 */
export default function GlassCard({ children, className = "" }: GlassCardProps) {
  return (
    <div className={`glass-card rounded-2xl p-6 ${className}`}>{children}</div>
  );
}
