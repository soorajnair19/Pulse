import type { ActivityItem, ContributionWeek } from "@/types";

/**
 * Flatten contribution weeks into diary/shelf items, newest first.
 * Uses each day's `date` as a fallback when an item has no own date.
 */
export function flattenDiaryItems(
  weeks: ContributionWeek[]
): ActivityItem[] {
  const items: ActivityItem[] = [];

  for (const week of weeks) {
    for (const day of week.contributionDays) {
      if (!day.items || day.items.length === 0) continue;
      for (const item of day.items) {
        items.push({
          ...item,
          date: item.date ?? day.date,
        });
      }
    }
  }

  return items.sort((a, b) => {
    const da = a.date ?? "";
    const db = b.date ?? "";
    if (da === db) return 0;
    return da < db ? 1 : -1;
  });
}
