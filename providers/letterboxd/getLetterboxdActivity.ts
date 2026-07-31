import { parsePeriod } from "@/lib/period";
import type { ContributionData, ContributionPeriod } from "@/types";
import { fetchDiary } from "./fetchDiary";
import { mapDiaryToContributionData } from "./mapper";

/**
 * Provider-independent activity entrypoint for Letterboxd.
 * Returns the shared ContributionData model used by the heatmap renderer.
 */
export async function getLetterboxdActivity(
  username: string,
  period: ContributionPeriod = "1y"
): Promise<ContributionData> {
  const resolvedPeriod = parsePeriod(period);
  const diary = await fetchDiary(username);
  return mapDiaryToContributionData(
    diary.username,
    diary.entries,
    resolvedPeriod,
    {
      displayName: diary.displayName,
      avatarUrl: diary.avatarUrl,
    }
  );
}
