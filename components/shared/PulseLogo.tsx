import type { CSSProperties } from "react";
import { pulseLogoPalette } from "@/lib/pulse-logo";

type PulseLogoProps = {
  className?: string;
  /** Brand accent — builds a 4-step palette. Omit for default GitHub greens. */
  accent?: string;
};

/** 3×3 living grid mark — palette via --pulse-logo-c1…c4. */
export function PulseLogo({ className, accent }: PulseLogoProps) {
  const style = accent
    ? (() => {
        const [c1, c2, c3, c4] = pulseLogoPalette(accent);
        return {
          "--pulse-logo-c1": c1,
          "--pulse-logo-c2": c2,
          "--pulse-logo-c3": c3,
          "--pulse-logo-c4": c4,
        } as CSSProperties;
      })()
    : undefined;

  return (
    <span
      className={["pulse-logo", className].filter(Boolean).join(" ")}
      style={style}
      aria-hidden="true"
    >
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className="pulse-logo-cell" />
      ))}
    </span>
  );
}
