import type { ContributionPeriod } from "@/types";

export const DEFAULT_PERIOD: ContributionPeriod = "1y";

export const PERIOD_OPTIONS: Array<{
  id: ContributionPeriod;
  label: string;
}> = [
  { id: "3m", label: "3 months" },
  { id: "6m", label: "6 months" },
  { id: "1y", label: "1 year" },
];

export function parsePeriod(
  value: string | string[] | null | undefined
): ContributionPeriod {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "3m" || raw === "6m" || raw === "1y") return raw;
  return DEFAULT_PERIOD;
}

/** ISO date range for GitHub `contributionsCollection(from, to)`. */
export function getPeriodRange(period: ContributionPeriod): {
  from: string;
  to: string;
} {
  const to = new Date();
  const from = new Date(to);

  switch (period) {
    case "3m":
      from.setUTCMonth(from.getUTCMonth() - 3);
      break;
    case "6m":
      from.setUTCMonth(from.getUTCMonth() - 6);
      break;
    case "1y":
    default:
      from.setUTCFullYear(from.getUTCFullYear() - 1);
      break;
  }

  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}
