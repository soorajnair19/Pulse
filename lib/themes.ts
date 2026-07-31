import type { ThemeId } from "@/types";

export type ThemeTokens = {
  id: ThemeId;
  name: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  levels: [string, string, string, string, string];
  tooltipBg: string;
  tooltipText: string;
};

export const themes: Record<ThemeId, ThemeTokens> = {
  "github-dark": {
    id: "github-dark",
    name: "Dark",
    background: "#0d1117",
    surface: "#161b22",
    text: "#e6edf3",
    textMuted: "#7d8590",
    border: "#30363d",
    levels: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"],
    tooltipBg: "#1f2428",
    tooltipText: "#e6edf3",
  },
  "github-light": {
    id: "github-light",
    name: "Light",
    background: "#ffffff",
    surface: "#f6f8fa",
    text: "#1f2328",
    textMuted: "#656d76",
    border: "#d0d7de",
    levels: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
    tooltipBg: "#24292f",
    tooltipText: "#ffffff",
  },
  minimal: {
    id: "minimal",
    name: "Minimal",
    background: "#fafafa",
    surface: "#ffffff",
    text: "#171717",
    textMuted: "#737373",
    border: "#e5e5e5",
    levels: ["#f0f0f0", "#c6e48b", "#7bc96f", "#239a3b", "#196127"],
    tooltipBg: "#171717",
    tooltipText: "#fafafa",
  },
  glass: {
    id: "glass",
    name: "Glass",
    background: "rgba(15, 23, 42, 0.85)",
    surface: "rgba(30, 41, 59, 0.6)",
    text: "#f8fafc",
    textMuted: "#94a3b8",
    border: "rgba(148, 163, 184, 0.25)",
    levels: [
      "rgba(148, 163, 184, 0.15)",
      "#0d9488",
      "#14b8a6",
      "#2dd4bf",
      "#5eead4",
    ],
    tooltipBg: "rgba(15, 23, 42, 0.95)",
    tooltipText: "#f8fafc",
  },
  figma: {
    id: "figma",
    name: "Violet",
    background: "#1e1e1e",
    surface: "#2c2c2c",
    text: "#ffffff",
    textMuted: "#a0a0a0",
    border: "#444444",
    levels: ["#2c2c2c", "#4a3aff", "#7b61ff", "#a259ff", "#c77dff"],
    tooltipBg: "#333333",
    tooltipText: "#ffffff",
  },
  nord: {
    id: "nord",
    name: "Arctic",
    background: "#2e3440",
    surface: "#3b4252",
    text: "#eceff4",
    textMuted: "#d8dee9",
    border: "#4c566a",
    levels: ["#3b4252", "#5e81ac", "#81a1c1", "#88c0d0", "#8fbcbb"],
    tooltipBg: "#434c5e",
    tooltipText: "#eceff4",
  },
  dracula: {
    id: "dracula",
    name: "Twilight",
    background: "#282a36",
    surface: "#21222c",
    text: "#f8f8f2",
    textMuted: "#6272a4",
    border: "#44475a",
    levels: ["#21222c", "#44475a", "#bd93f9", "#ff79c6", "#50fa7b"],
    tooltipBg: "#44475a",
    tooltipText: "#f8f8f2",
  },
  catppuccin: {
    id: "catppuccin",
    name: "Pastel",
    background: "#1e1e2e",
    surface: "#181825",
    text: "#cdd6f4",
    textMuted: "#a6adc8",
    border: "#313244",
    levels: ["#313244", "#1e66f5", "#89b4fa", "#a6e3a1", "#94e2d5"],
    tooltipBg: "#313244",
    tooltipText: "#cdd6f4",
  },
};

export const DEFAULT_THEME: ThemeId = "github-dark";

function parseCssColor(input: string): [number, number, number] | null {
  const hex = input.trim();
  if (hex.startsWith("#")) {
    const normalized = hex.slice(1);
    const full =
      normalized.length === 3
        ? normalized
            .split("")
            .map((c) => c + c)
            .join("")
        : normalized;
    if (full.length !== 6) return null;
    return [
      Number.parseInt(full.slice(0, 2), 16),
      Number.parseInt(full.slice(2, 4), 16),
      Number.parseInt(full.slice(4, 6), 16),
    ];
  }

  const rgb = hex.match(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i
  );
  if (!rgb) return null;
  return [
    Number.parseFloat(rgb[1]),
    Number.parseFloat(rgb[2]),
    Number.parseFloat(rgb[3]),
  ];
}

function mixRgb(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): string {
  const mix = (i: number) => Math.round(a[i] + (b[i] - a[i]) * t);
  return `rgb(${mix(0)}, ${mix(1)}, ${mix(2)})`;
}

/** Build heatmap levels 0–4 tinted toward a brand accent (keeps empty cell from theme). */
export function accentHeatmapLevels(
  emptyLevel: string,
  accent: string
): [string, string, string, string, string] {
  const empty = parseCssColor(emptyLevel) ?? [22, 27, 34];
  const accentRgb = parseCssColor(accent) ?? [255, 128, 1];
  return [
    emptyLevel,
    mixRgb(empty, accentRgb, 0.35),
    mixRgb(empty, accentRgb, 0.55),
    mixRgb(empty, accentRgb, 0.75),
    accent.startsWith("#") ? accent : mixRgb(empty, accentRgb, 1),
  ];
}

export function getTheme(id: string | undefined | null): ThemeTokens {
  if (id && id in themes) {
    return themes[id as ThemeId];
  }
  return themes[DEFAULT_THEME];
}

export function resolveTheme(
  id: string | undefined | null,
  heatmapAccent?: string | null
): ThemeTokens {
  const theme = getTheme(id);
  if (!heatmapAccent) return theme;
  return {
    ...theme,
    levels: accentHeatmapLevels(theme.levels[0], heatmapAccent),
  };
}

export function themeToCssVars(theme: ThemeTokens): Record<string, string> {
  return {
    "--pulse-bg": theme.background,
    "--pulse-surface": theme.surface,
    "--pulse-text": theme.text,
    "--pulse-text-muted": theme.textMuted,
    "--pulse-border": theme.border,
    "--pulse-level-0": theme.levels[0],
    "--pulse-level-1": theme.levels[1],
    "--pulse-level-2": theme.levels[2],
    "--pulse-level-3": theme.levels[3],
    "--pulse-level-4": theme.levels[4],
    "--pulse-tooltip-bg": theme.tooltipBg,
    "--pulse-tooltip-text": theme.tooltipText,
  };
}
