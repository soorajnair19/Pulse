import { accentHeatmapLevels } from "@/lib/themes";

export const PULSE_LOGO_DEFAULT_COLORS = [
  "#0e4429",
  "#006d32",
  "#26a641",
  "#39d353",
] as const;

export type PulseLogoPalette = [string, string, string, string];

export function pulseLogoPalette(accent?: string | null): PulseLogoPalette {
  if (!accent) {
    return [...PULSE_LOGO_DEFAULT_COLORS];
  }
  const levels = accentHeatmapLevels("#0d1117", accent);
  return [levels[1], levels[2], levels[3], levels[4]];
}
