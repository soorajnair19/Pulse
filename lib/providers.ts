import type { ContributionPeriod, ThemeId, WidgetVariant } from "@/types";

export type ProviderId = "github" | "letterboxd" | "figma" | "goodreads";

export type EmbedOptions = {
  variant: WidgetVariant;
  theme: ThemeId;
  period: ContributionPeriod;
};

export type PulseProvider = {
  id: ProviderId;
  label: string;
  /** Brand accent used for selected tab highlight + Generate CTA. */
  accent: string;
  /** Optional heatmap cell tint (levels 1–4). Falls back to theme greens when omitted. */
  heatmapAccent?: string;
  usernamePlaceholder: string;
  usernameLabel: string;
  enabled: boolean;
  validateUsername: (username: string) => string | null;
  buildEmbedPath: (username: string, opts: EmbedOptions) => string;
  defaultHeight: Record<WidgetVariant, number>;
};

const GITHUB_USERNAME_RE =
  /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;

const LETTERBOXD_USERNAME_RE =
  /^[a-zA-Z0-9](?:[a-zA-Z0-9_-]{0,28}[a-zA-Z0-9])?$/;

function buildQuery(opts: EmbedOptions): string {
  const params = new URLSearchParams({
    variant: opts.variant,
    theme: opts.theme,
    period: opts.period,
  });
  return params.toString();
}

export const providers: PulseProvider[] = [
  {
    id: "github",
    label: "GitHub",
    accent: "#2ea44f",
    usernamePlaceholder: "johndoe",
    usernameLabel: "GitHub username",
    enabled: true,
    validateUsername: (username) => {
      const trimmed = username.trim();
      if (!trimmed) return "Enter a username.";
      if (!GITHUB_USERNAME_RE.test(trimmed)) {
        return "Invalid GitHub username.";
      }
      return null;
    },
    buildEmbedPath: (username, opts) =>
      `/embed/github/${encodeURIComponent(username.trim())}?${buildQuery(opts)}`,
    defaultHeight: {
      compact: 120,
      default: 220,
      detailed: 380,
    },
  },
  {
    id: "letterboxd",
    label: "Letterboxd",
    accent: "#FF8001",
    heatmapAccent: "#FF8001",
    usernamePlaceholder: "johndoe",
    usernameLabel: "Letterboxd username",
    enabled: true,
    validateUsername: (username) => {
      const trimmed = username.trim();
      if (!trimmed) return "Enter a username.";
      if (!LETTERBOXD_USERNAME_RE.test(trimmed)) {
        return "Invalid Letterboxd username.";
      }
      return null;
    },
    buildEmbedPath: (username, opts) =>
      `/embed/letterboxd/${encodeURIComponent(username.trim())}?${buildQuery(opts)}`,
    defaultHeight: {
      compact: 120,
      default: 220,
      detailed: 380,
    },
  },
  {
    id: "figma",
    label: "Figma",
    accent: "#a259ff",
    usernamePlaceholder: "johndoe",
    usernameLabel: "Figma username",
    enabled: false,
    validateUsername: () => "Coming soon.",
    buildEmbedPath: () => "/",
    defaultHeight: { compact: 120, default: 220, detailed: 380 },
  },
  {
    id: "goodreads",
    label: "Goodreads",
    accent: "#372213",
    usernamePlaceholder: "johndoe",
    usernameLabel: "Goodreads user ID",
    enabled: false,
    validateUsername: () => "Coming soon.",
    buildEmbedPath: () => "/",
    defaultHeight: { compact: 120, default: 220, detailed: 380 },
  },
];

export const DEFAULT_PROVIDER_ID: ProviderId = "github";

export function getProvider(id: string | null | undefined): PulseProvider {
  const found = providers.find((p) => p.id === id && p.enabled);
  return found ?? providers.find((p) => p.id === DEFAULT_PROVIDER_ID)!;
}

export function getSiteOrigin(): string {
  if (typeof window !== "undefined") {
    const env = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
    if (env) return env;
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
}

export function buildEmbedSnippet(
  origin: string,
  path: string,
  height: number
): string {
  const src = `${origin}${path}`;
  return `<iframe\n  src="${src}"\n  width="100%"\n  height="${height}"\n  frameborder="0"\n  loading="lazy"\n></iframe>`;
}

/** Slightly lighten a hex color for hover states. */
export function lightenHex(hex: string, amount = 0.12): string {
  const normalized = hex.replace("#", "");
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;
  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);
  const mix = (channel: number) =>
    Math.min(255, Math.round(channel + (255 - channel) * amount));
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}
