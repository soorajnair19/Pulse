import type { CountNoun, WidgetVariant } from "@/types";

export function cn(
  ...inputs: Array<string | false | null | undefined>
): string {
  return inputs.filter(Boolean).join(" ");
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function parseBooleanParam(
  value: string | string[] | undefined,
  defaultValue: boolean
): boolean {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === undefined) return defaultValue;
  if (raw === "true" || raw === "1") return true;
  if (raw === "false" || raw === "0") return false;
  return defaultValue;
}

export function parseNumberParam(
  value: string | string[] | undefined,
  defaultValue: number,
  min: number,
  max: number
): number {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === undefined) return defaultValue;
  const parsed = Number(raw);
  if (Number.isNaN(parsed)) return defaultValue;
  return clamp(parsed, min, max);
}

export function parseVariant(
  value: string | string[] | undefined
): WidgetVariant {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "compact" || raw === "detailed" || raw === "default") {
    return raw;
  }
  return "default";
}

export function formatContributionDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00Z`);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

const DEFAULT_COUNT_NOUN: CountNoun = {
  singular: "contribution",
  plural: "contributions",
};

export function formatActivityCount(
  count: number,
  countNoun: CountNoun = DEFAULT_COUNT_NOUN
): string {
  if (count === 1) return `1 ${countNoun.singular}`;
  return `${count.toLocaleString()} ${countNoun.plural}`;
}

export function formatContributionCount(count: number): string {
  return formatActivityCount(count);
}
