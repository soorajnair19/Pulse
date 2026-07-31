"use client";

import type { ContributionData, WidgetVariant } from "@/types";
import { formatActivityCount } from "@/lib/utils";
import { ContributionHeatmap } from "./ContributionHeatmap";
import { Legend } from "./Legend";
import { StatsBar } from "./StatsBar";
import { ThemeProvider } from "./ThemeProvider";

export type WidgetOptions = {
  variant: WidgetVariant;
  themeId: string;
  /** Optional brand tint for heatmap cells (e.g. Letterboxd orange). */
  heatmapAccent?: string;
  showLegend: boolean;
  showMonths: boolean;
  showWeekdays: boolean;
  cellSize: number;
  gap: number;
  radius: number;
};

type GitHubContributionWidgetProps = {
  data: ContributionData;
  options: WidgetOptions;
};

function variantMinHeight(variant: WidgetVariant): number {
  switch (variant) {
    case "compact":
      return 120;
    case "detailed":
      return 380;
    default:
      return 220;
  }
}

export function GitHubContributionWidget({
  data,
  options,
}: GitHubContributionWidgetProps) {
  const {
    variant,
    themeId,
    heatmapAccent,
    showLegend,
    showMonths,
    showWeekdays,
    cellSize,
    gap,
    radius,
  } = options;

  const minHeight = variantMinHeight(variant);
  const totalLabel = data.totalLabel ?? "Contributions";
  const hasProfileStats =
    data.followers !== undefined || data.publicRepos !== undefined;

  return (
    <ThemeProvider
      themeId={themeId}
      heatmapAccent={heatmapAccent}
      className="pulse-widget box-border flex h-full w-full flex-col justify-between overflow-hidden font-sans antialiased"
      style={{
        minHeight,
        padding:
          variant === "compact"
            ? "12px 14px"
            : variant === "detailed"
              ? "16px 18px"
              : "14px 16px",
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
            showStreaks
          />
        </div>
      )}

      <div className="min-h-0 flex-1">
        <ContributionHeatmap
          weeks={data.weeks}
          cellSize={cellSize}
          gap={gap}
          radius={radius}
          showMonths={showMonths}
          showWeekdays={showWeekdays}
          countNoun={data.countNoun}
        />
      </div>

      {showLegend && variant !== "compact" && (
        <div className="mt-2">
          <Legend cellSize={Math.max(8, cellSize - 2)} radius={radius} />
        </div>
      )}
    </ThemeProvider>
  );
}
