"use client";

import { useMemo } from "react";
import type {
  ActivityStat,
  ContributionData,
  WidgetVariant,
  WidgetVisualization,
} from "@/types";
import { flattenDiaryItems } from "@/lib/diary-items";
import { estimateFilmstripHeight } from "@/lib/filmstrip-layout";
import { estimateShelfHeight } from "@/lib/shelf-layout";
import { cn, formatActivityCount } from "@/lib/utils";
import { BookShelf } from "@/components/goodreads/BookShelf";
import { PosterFilmstrip } from "@/components/letterboxd/PosterFilmstrip";
import { ContributionHeatmap } from "./ContributionHeatmap";
import { Legend } from "./Legend";
import { PulseECG } from "./PulseECG";
import { RepoOrbit } from "./RepoOrbit";
import { StatsBar } from "./StatsBar";
import { ThemeProvider } from "./ThemeProvider";

export type WidgetOptions = {
  variant: WidgetVariant;
  themeId: string;
  visualization?: WidgetVisualization;
  /** Optional brand tint for heatmap cells (e.g. Letterboxd orange). */
  heatmapAccent?: string;
  /** Optional color for tooltip star ratings (e.g. Letterboxd green). */
  ratingAccent?: string;
  showLegend: boolean;
  showMonths: boolean;
  showWeekdays: boolean;
  /** When false, hides current/longest streak (e.g. Goodreads). Default true. */
  showStreaks?: boolean;
  cellSize: number;
  gap: number;
  radius: number;
};

type GitHubContributionWidgetProps = {
  data: ContributionData;
  options: WidgetOptions;
};

function widgetMinHeight(
  variant: WidgetVariant,
  visualization: WidgetVisualization,
  itemCount = 0
): number {
  if (visualization === "orbit") {
    switch (variant) {
      case "compact":
        return 120;
      case "detailed":
        return 440;
      default:
        return 300;
    }
  }
  if (visualization === "filmstrip") {
    return estimateFilmstripHeight(itemCount, variant);
  }
  if (visualization === "shelf") {
    return estimateShelfHeight(itemCount, variant);
  }
  switch (variant) {
    case "compact":
      // Room for header + 7-row heatmap (cellSize 9) + bottom padding.
      return 148;
    case "detailed":
      // Classic: fit profile + stats + heatmap + legend (no dead space under grid).
      // Pulse keeps a taller chart area.
      return visualization === "pulse" ? 380 : 280;
    default:
      return 220;
  }
}

function widgetPadding(
  variant: WidgetVariant,
  visualization: WidgetVisualization
): string {
  if (visualization === "orbit" && variant !== "compact") {
    return variant === "detailed" ? "18px 18px 16px 16px" : "16px 16px 14px 16px";
  }
  if (visualization === "filmstrip" && variant !== "compact") {
    return variant === "detailed" ? "18px 18px 16px 16px" : "16px 16px 14px 16px";
  }
  if (visualization === "shelf" && variant !== "compact") {
    return variant === "detailed" ? "18px 18px 16px 16px" : "16px 16px 14px 16px";
  }
  // Extra bottom pad so compact classic cells aren't clipped at the edge.
  if (variant === "compact") return "12px 14px 18px 14px";
  if (variant === "detailed") return "16px 18px";
  return "14px 16px";
}

export function GitHubContributionWidget({
  data,
  options,
}: GitHubContributionWidgetProps) {
  const {
    variant,
    themeId,
    visualization = "heatmap",
    heatmapAccent,
    ratingAccent,
    showLegend,
    showMonths,
    showWeekdays,
    showStreaks = true,
    cellSize,
    gap,
    radius,
  } = options;

  const listItems = useMemo(() => {
    if (visualization !== "filmstrip" && visualization !== "shelf") {
      return [];
    }
    return flattenDiaryItems(data.weeks);
  }, [data.weeks, visualization]);

  const isAutoHeight =
    visualization === "filmstrip" || visualization === "shelf";
  const minHeight = widgetMinHeight(
    variant,
    visualization,
    listItems.length
  );
  const totalLabel = data.totalLabel ?? "Contributions";
  const isHeatmap = visualization === "heatmap";
  // Classic packs to content height so the legend sits under the grid (no flex gap).
  const fillFrame = !isAutoHeight && !isHeatmap;

  // Detailed: fold followers/repos into the main stats row (same style as streaks).
  const extraStats = useMemo(() => {
    if (variant !== "detailed") return data.extraStats;
    const profileStats: ActivityStat[] = [];
    if (data.followers !== undefined) {
      profileStats.push({ label: "Followers", value: data.followers });
    }
    if (data.publicRepos !== undefined) {
      profileStats.push({ label: "Repos", value: data.publicRepos });
    }
    if (profileStats.length === 0) return data.extraStats;
    return [...(data.extraStats ?? []), ...profileStats];
  }, [variant, data.extraStats, data.followers, data.publicRepos]);

  return (
    <ThemeProvider
      themeId={themeId}
      heatmapAccent={heatmapAccent}
      className={cn(
        "pulse-widget box-border flex w-full flex-col font-sans antialiased",
        fillFrame
          ? "h-full justify-between overflow-hidden"
          : "h-auto overflow-visible"
      )}
      style={{
        minHeight,
        padding: widgetPadding(variant, visualization),
      }}
    >
      {variant === "detailed" && (
        <div className="mb-3 flex items-center gap-3">
          {data.avatarUrl && (
            // Native img + crossOrigin so playground PNG export can draw the avatar.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.avatarUrl}
              alt={`${data.username} avatar`}
              width={40}
              height={40}
              className="rounded-full"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-tight">
              {data.name ?? data.username}
            </p>
            <p
              className="truncate text-xs"
              style={{ color: "var(--pulse-text-muted)" }}
            >
              @{data.username}
            </p>
          </div>
        </div>
      )}

      {variant === "compact" ? (
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <span className="text-xs font-medium tabular-nums">
            {formatActivityCount(data.totalContributions, data.countNoun)}
          </span>
        </div>
      ) : (
        <div className="mb-3">
          <StatsBar
            totalContributions={data.totalContributions}
            currentStreak={data.currentStreak}
            longestStreak={data.longestStreak}
            totalLabel={totalLabel}
            leadingStats={data.leadingStats}
            extraStats={extraStats}
            showStreaks={showStreaks}
          />
        </div>
      )}

      <div className={fillFrame ? "min-h-0 flex-1" : "w-full"}>
        {visualization === "pulse" ? (
          <PulseECG
            weeks={data.weeks}
            variant={variant}
            countNoun={data.countNoun}
          />
        ) : visualization === "orbit" ? (
          <RepoOrbit
            repos={data.repos ?? []}
            avatarUrl={data.avatarUrl}
            username={data.username}
            variant={variant}
          />
        ) : visualization === "filmstrip" ? (
          <PosterFilmstrip
            items={listItems}
            variant={variant}
            ratingAccent={ratingAccent}
          />
        ) : visualization === "shelf" ? (
          <BookShelf
            items={listItems}
            variant={variant}
            ratingAccent={ratingAccent}
          />
        ) : (
          <ContributionHeatmap
            weeks={data.weeks}
            cellSize={cellSize}
            gap={gap}
            radius={radius}
            showMonths={showMonths}
            showWeekdays={showWeekdays}
            countNoun={data.countNoun}
            ratingAccent={ratingAccent}
          />
        )}

        {isHeatmap && showLegend && variant !== "compact" && (
          <div className="mt-2.5">
            <Legend cellSize={Math.max(8, cellSize - 2)} radius={radius} />
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}
