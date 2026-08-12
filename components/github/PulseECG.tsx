"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { ContributionWeek, CountNoun, WidgetVariant } from "@/types";
import { Tooltip } from "./Tooltip";
import { useTheme } from "./ThemeProvider";

type DayPoint = {
  date: string;
  count: number;
};

type PulseECGProps = {
  weeks: ContributionWeek[];
  variant: WidgetVariant;
  countNoun?: CountNoun;
};

function flattenDays(weeks: ContributionWeek[]): DayPoint[] {
  return weeks.flatMap((week) =>
    week.contributionDays.map((day) => ({
      date: day.date,
      count: day.count,
    }))
  );
}

function buildPolyline(
  days: DayPoint[],
  width: number,
  height: number,
  padX: number,
  padY: number
): { points: string; maxCount: number } {
  const maxCount = Math.max(1, ...days.map((d) => d.count));
  const innerW = Math.max(1, width - padX * 2);
  const innerH = Math.max(1, height - padY * 2);
  const n = days.length;

  const coords = days.map((day, index) => {
    const x =
      n <= 1 ? padX + innerW / 2 : padX + (index / (n - 1)) * innerW;
    const y = padY + innerH - (day.count / maxCount) * innerH;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  return { points: coords.join(" "), maxCount };
}

export function PulseECG({ weeks, variant, countNoun }: PulseECGProps) {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{
    index: number;
    x: number;
    y: number;
  } | null>(null);

  const days = useMemo(() => flattenDays(weeks), [weeks]);

  const chartHeight =
    variant === "compact" ? 56 : variant === "detailed" ? 160 : 100;
  const viewWidth = 640;
  const padX = 8;
  const padY = 10;

  const { points } = useMemo(
    () => buildPolyline(days, viewWidth, chartHeight, padX, padY),
    [days, chartHeight]
  );

  const stroke = theme.levels[4];
  const baselineY = chartHeight - padY;

  const resolveIndex = useCallback(
    (clientX: number) => {
      const el = containerRef.current;
      if (!el || days.length === 0) return null;
      const rect = el.getBoundingClientRect();
      const ratio = (clientX - rect.left) / Math.max(1, rect.width);
      const innerRatio = Math.min(
        1,
        Math.max(0, (ratio * viewWidth - padX) / (viewWidth - padX * 2))
      );
      const index =
        days.length <= 1
          ? 0
          : Math.round(innerRatio * (days.length - 1));
      return Math.min(days.length - 1, Math.max(0, index));
    },
    [days.length]
  );

  const playheadX = useMemo(() => {
    if (hover == null || days.length === 0) return null;
    const n = days.length;
    if (n <= 1) return viewWidth / 2;
    return padX + (hover.index / (n - 1)) * (viewWidth - padX * 2);
  }, [hover, days.length]);

  const hoverDay = hover != null ? days[hover.index] : null;

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <svg
        viewBox={`0 0 ${viewWidth} ${chartHeight}`}
        className="h-full w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label="Contribution pulse chart"
        onMouseMove={(event) => {
          const index = resolveIndex(event.clientX);
          if (index == null) return;
          setHover({
            index,
            x: event.clientX,
            y: event.currentTarget.getBoundingClientRect().top,
          });
        }}
        onMouseLeave={() => setHover(null)}
      >
        <line
          x1={padX}
          y1={baselineY}
          x2={viewWidth - padX}
          y2={baselineY}
          stroke={theme.border}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
        <polyline
          fill="none"
          stroke={stroke}
          strokeWidth={variant === "compact" ? 1.5 : 2}
          strokeLinejoin="round"
          strokeLinecap="round"
          points={points}
          vectorEffect="non-scaling-stroke"
        />
        {playheadX != null && (
          <line
            x1={playheadX}
            y1={padY}
            x2={playheadX}
            y2={baselineY}
            stroke={theme.textMuted}
            strokeWidth={1}
            strokeDasharray="3 3"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>

      <Tooltip
        date={hoverDay?.date ?? ""}
        count={hoverDay?.count ?? 0}
        x={hover?.x ?? 0}
        y={hover?.y ?? 0}
        visible={Boolean(hoverDay)}
        countNoun={countNoun}
      />
    </div>
  );
}
