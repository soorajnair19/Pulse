import type {
  CalendarYearPeriod,
  ContributionPeriod,
  RollingPeriod,
} from "@/types";
import type { ProviderId } from "@/lib/providers";

export const DEFAULT_PERIOD: RollingPeriod = "1y";

/** Earliest year accepted for calendar-year providers. */
export const CALENDAR_YEAR_MIN = 1900;

/** How many recent calendar years to list above the custom field. */
export const CALENDAR_YEAR_RECENT_COUNT = 7;

/** @deprecated Use CALENDAR_YEAR_MIN. */
export const GOODREADS_YEAR_MIN = CALENDAR_YEAR_MIN;

/** @deprecated Use CALENDAR_YEAR_RECENT_COUNT. */
export const GOODREADS_RECENT_YEAR_COUNT = CALENDAR_YEAR_RECENT_COUNT;

export const ROLLING_PERIOD_OPTIONS: Array<{
  id: RollingPeriod;
  label: string;
}> = [
  { id: "1m", label: "1 month" },
  { id: "3m", label: "3 months" },
  { id: "6m", label: "6 months" },
  { id: "1y", label: "1 year" },
];

/** @deprecated Use ROLLING_PERIOD_OPTIONS or getPeriodOptions(providerId). */
export const PERIOD_OPTIONS = ROLLING_PERIOD_OPTIONS;

export function calendarYearMax(now = new Date()): number {
  return now.getUTCFullYear();
}

/** @deprecated Use calendarYearMax. */
export const goodreadsYearMax = calendarYearMax;

/** Newest → oldest recent years for the calendar-year dropdown. */
export function getRecentCalendarYears(
  count = CALENDAR_YEAR_RECENT_COUNT,
  now = new Date()
): CalendarYearPeriod[] {
  const max = calendarYearMax(now);
  const years: CalendarYearPeriod[] = [];
  for (let i = 0; i < count; i += 1) {
    const year = max - i;
    if (year < CALENDAR_YEAR_MIN) break;
    years.push(String(year));
  }
  return years;
}

/** @deprecated Prefer getRecentCalendarYears(). */
export const getGoodreadsRecentYears = getRecentCalendarYears;

/** @deprecated Prefer getRecentCalendarYears(). */
export const GOODREADS_YEAR_PERIODS = getRecentCalendarYears();

export function isRollingPeriod(value: string): value is RollingPeriod {
  return value === "1m" || value === "3m" || value === "6m" || value === "1y";
}

export function isCalendarYearPeriod(
  value: string
): value is CalendarYearPeriod {
  if (!/^\d{4}$/.test(value)) return false;
  const year = Number.parseInt(value, 10);
  return year >= CALENDAR_YEAR_MIN && year <= calendarYearMax();
}

/** @deprecated Use isCalendarYearPeriod. */
export const isGoodreadsYearPeriod = isCalendarYearPeriod;

export function currentCalendarYearPeriod(
  now = new Date()
): CalendarYearPeriod {
  return String(calendarYearMax(now));
}

/** @deprecated Use currentCalendarYearPeriod. */
export const currentGoodreadsYearPeriod = currentCalendarYearPeriod;

function usesCalendarYear(providerId: ProviderId): boolean {
  return providerId === "goodreads" || providerId === "letterboxd";
}

export function getPeriodOptions(providerId: ProviderId): Array<{
  id: ContributionPeriod;
  label: string;
}> {
  if (usesCalendarYear(providerId)) {
    return getRecentCalendarYears().map((year) => ({
      id: year,
      label: year,
    }));
  }
  return ROLLING_PERIOD_OPTIONS;
}

export function defaultPeriodForProvider(
  providerId: ProviderId
): ContributionPeriod {
  if (usesCalendarYear(providerId)) return currentCalendarYearPeriod();
  return DEFAULT_PERIOD;
}

/**
 * Coerce a period into one valid for the active provider.
 * Used when switching tabs so Duration never shows a stale incompatible value.
 */
export function coercePeriodForProvider(
  period: ContributionPeriod | string,
  providerId: ProviderId
): ContributionPeriod {
  if (usesCalendarYear(providerId)) {
    return isCalendarYearPeriod(period)
      ? period
      : currentCalendarYearPeriod();
  }
  return isRollingPeriod(period) ? period : DEFAULT_PERIOD;
}

export function parsePeriod(
  value: string | string[] | null | undefined,
  providerId?: ProviderId
): ContributionPeriod {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) {
    return providerId
      ? defaultPeriodForProvider(providerId)
      : DEFAULT_PERIOD;
  }

  if (providerId && usesCalendarYear(providerId)) {
    return isCalendarYearPeriod(raw)
      ? raw
      : currentCalendarYearPeriod();
  }

  if (isRollingPeriod(raw)) return raw;

  // Year periods when provider is unspecified (shared ContributionPeriod parsing).
  if (providerId === undefined && isCalendarYearPeriod(raw)) {
    return raw;
  }

  return providerId
    ? defaultPeriodForProvider(providerId)
    : DEFAULT_PERIOD;
}

/** ISO date range for provider lookbacks (`from`, `to`). */
export function getPeriodRange(period: ContributionPeriod): {
  from: string;
  to: string;
} {
  if (isCalendarYearPeriod(period) && !isRollingPeriod(period)) {
    const year = Number.parseInt(period, 10);
    const from = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
    const to = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
    return {
      from: from.toISOString(),
      to: to.toISOString(),
    };
  }

  const to = new Date();
  const from = new Date(to);

  switch (period) {
    case "1m":
      from.setUTCMonth(from.getUTCMonth() - 1);
      break;
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
