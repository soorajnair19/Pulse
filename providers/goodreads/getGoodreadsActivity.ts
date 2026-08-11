import { currentGoodreadsYearPeriod, parsePeriod } from "@/lib/period";
import type { ContributionData, ContributionPeriod } from "@/types";
import { fetchReadShelf } from "./fetchShelf";
import { mapShelfToContributionData } from "./mapper";

/**
 * Provider entrypoint for Goodreads finish-date activity.
 * Returns the shared ContributionData model used by the heatmap renderer.
 */
export async function getGoodreadsActivity(
  userId: string,
  period: ContributionPeriod = currentGoodreadsYearPeriod()
): Promise<ContributionData> {
  const resolvedPeriod = parsePeriod(period, "goodreads");
  const shelf = await fetchReadShelf(userId);
  return mapShelfToContributionData(
    shelf.userId,
    shelf.entries,
    resolvedPeriod,
    {
      displayName: shelf.displayName,
      avatarUrl: shelf.avatarUrl,
    }
  );
}
