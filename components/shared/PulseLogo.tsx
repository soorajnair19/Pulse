import type { CSSProperties } from "react";
import { accentHeatmapLevels } from "@/lib/themes";

type PulseLogoProps = {
  className?: string;
  /** Brand accent — builds a 4-step palette. Omit for default GitHub greens. */
  accent?: string;
};

/** 3×3 living grid mark — palette via --pulse-logo-c1…c4. */
export function PulseLogo({ className, accent }: PulseLogoProps) {
  const style = accent
    ? (() => {
        const levels = accentHeatmapLevels("#0d1117", accent);
        return {
          "--pulse-logo-c1": levels[1],
          "--pulse-logo-c2": levels[2],
          "--pulse-logo-c3": levels[3],
          "--pulse-logo-c4": levels[4],
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
