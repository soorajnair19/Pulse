"use client";

import { useMemo } from "react";
import type {
  ContributionData,
  WidgetVariant,
  WidgetVisualization,
} from "@/types";
import { flattenDiaryItems } from "@/lib/diary-items";
import { estimateFilmstripHeight } from "@/lib/filmstrip-layout";
import { cn, formatActivityCount } from "@/lib/utils";
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
  filmCount = 0
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
    return estimateFilmstripHeight(filmCount, variant);
  }
  switch (variant) {
    case "compact":
      return 120;
    case "detailed":
      return 380;
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
  if (variant === "compact") return "12px 14px";
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

  const diaryItems = useMemo(() => {
    if (visualization !== "filmstrip") {
      return [];
    }
    return flattenDiaryItems(data.weeks);
  }, [data.weeks, visualization]);

  const isFilmstrip = visualization === "filmstrip";
  const minHeight = widgetMinHeight(
    variant,
    visualization,
    diaryItems.length
  );
  const totalLabel = data.totalLabel ?? "Contributions";
  const hasProfileStats =
    data.followers !== undefined || data.publicRepos !== undefined;
  const isHeatmap = visualization === "heatmap";

  return (
    <ThemeProvider
      themeId={themeId}
      heatmapAccent={heatmapAccent}
      className={cn(
        "pulse-widget box-border flex w-full flex-col font-sans antialiased",
        isFilmstrip
          ? "h-auto overflow-visible"
          : "h-full justify-between overflow-hidden"
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
          {hasProfileStats && (
            <div
              className="flex shrink-0 gap-4 text-right text-xs"
              style={{ color: "var(--pulse-text-muted)" }}
            >
              {data.followers !== undefined && (
                <div>
                  <div
                    className="font-semibold tabular-nums"
                    style={{ color: "var(--pulse-text)" }}
                  >
                    {data.followers.toLocaleString()}
                  </div>
                  <div>followers</div>
                </div>
              )}
              {data.publicRepos !== undefined && (
                <div>
                  <div
                    className="font-semibold tabular-nums"
                    style={{ color: "var(--pulse-text)" }}
                  >
                    {data.publicRepos.toLocaleString()}
                  </div>
                  <div>repos</div>
                </div>
              )}
            </div>
          )}
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
            extraStats={data.extraStats}
            showStreaks={showStreaks}
          />
        </div>
      )}

      <div className={isFilmstrip ? "w-full" : "min-h-0 flex-1"}>
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
            items={diaryItems}
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
      </div>

      {isHeatmap && showLegend && variant !== "compact" && (
        <div className="mt-2">
          <Legend cellSize={Math.max(8, cellSize - 2)} radius={radius} />
        </div>
      )}
    </ThemeProvider>
  );
}
