import type { WidgetVisualization } from "@/types";
import type { ProviderId } from "@/lib/providers";

export type VisualizationOption = {
  id: WidgetVisualization;
  label: string;
};

const ALL_VISUALIZATIONS: VisualizationOption[] = [
  { id: "heatmap", label: "Classic" },
  { id: "pulse", label: "Pulse" },
  { id: "orbit", label: "Orbit" },
  { id: "filmstrip", label: "Filmstrip" },
  { id: "shelf", label: "Shelf" },
];

const BY_PROVIDER: Record<ProviderId, WidgetVisualization[]> = {
  github: ["heatmap", "pulse", "orbit"],
  letterboxd: ["heatmap", "filmstrip"],
  goodreads: ["heatmap", "shelf"],
  figma: ["heatmap"],
};

export function getVisualizations(
  providerId: ProviderId
): VisualizationOption[] {
  const allowed = new Set(BY_PROVIDER[providerId] ?? ["heatmap"]);
  return ALL_VISUALIZATIONS.filter((option) => allowed.has(option.id));
}

export function isWidgetVisualization(
  value: string
): value is WidgetVisualization {
  return (
    value === "heatmap" ||
    value === "pulse" ||
    value === "orbit" ||
    value === "filmstrip" ||
    value === "shelf"
  );
}

export function isVisualizationSupported(
  visualization: WidgetVisualization,
  providerId: ProviderId
): boolean {
  return (BY_PROVIDER[providerId] ?? ["heatmap"]).includes(visualization);
}

/**
 * Coerce a URL/query value to a visualization allowed for the provider.
 * Unknown or unsupported values fall back to heatmap.
 */
export function parseVisualization(
  value: string | string[] | null | undefined,
  providerId: ProviderId = "github"
): WidgetVisualization {
  const raw = Array.isArray(value) ? value[0] : value;
  if (
    typeof raw === "string" &&
    isWidgetVisualization(raw) &&
    isVisualizationSupported(raw, providerId)
  ) {
    return raw;
  }
  return "heatmap";
}

export function coerceVisualizationForProvider(
  visualization: WidgetVisualization,
  providerId: ProviderId
): WidgetVisualization {
  if (isVisualizationSupported(visualization, providerId)) {
    return visualization;
  }
  return "heatmap";
}
