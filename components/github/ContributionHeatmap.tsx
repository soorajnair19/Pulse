"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ContributionWeek } from "@/types";
import { ContributionCell } from "./ContributionCell";
import { MonthLabels } from "./MonthLabels";
import { Tooltip } from "./Tooltip";

const WEEKDAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

type HoverState = {
  date: string;
  count: number;
  x: number;
  y: number;
} | null;

type ContributionHeatmapProps = {
  weeks: ContributionWeek[];
  cellSize?: number;
  gap?: number;
  radius?: number;
  showMonths?: boolean;
  showWeekdays?: boolean;
};

export function ContributionHeatmap({
  weeks,
  cellSize = 11,
  gap = 3,
  radius = 2,
  showMonths = true,
  showWeekdays = false,
}: ContributionHeatmapProps) {
  const [hover, setHover] = useState<HoverState>(null);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const weekdayGutter = showWeekdays ? 28 : 0;
  const naturalWidth =
    weeks.length * cellSize + Math.max(0, weeks.length - 1) * gap + weekdayGutter;
  const naturalHeight =
    7 * cellSize + 6 * gap + (showMonths ? 16 : 0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateScale = () => {
      const available = container.clientWidth;
      if (available <= 0 || naturalWidth <= 0) {
        setScale(1);
        return;
      }
      setScale(Math.min(1, available / naturalWidth));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(container);
    return () => observer.disconnect();
  }, [naturalWidth]);

  const handleHover = useCallback((payload: HoverState) => {
    setHover(payload);
  }, []);

  const gridStyle = useMemo(
    () => ({
      display: "grid" as const,
      gridAutoFlow: "column" as const,
      gridTemplateRows: `repeat(7, ${cellSize}px)`,
      gridAutoColumns: `${cellSize}px`,
      gap: `${gap}px`,
    }),
    [cellSize, gap]
  );

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden"
      style={{ height: naturalHeight * scale }}
    >
      <div
        style={{
          width: naturalWidth,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {showMonths && (
          <div style={{ paddingLeft: weekdayGutter }}>
            <MonthLabels weeks={weeks} cellSize={cellSize} gap={gap} />
          </div>
        )}

        <div className="flex items-start">
          {showWeekdays && (
            <div
              className="flex flex-col justify-between pr-1.5 text-[9px] shrink-0"
              style={{
                color: "var(--pulse-text-muted)",
                height: 7 * cellSize + 6 * gap,
                width: weekdayGutter - 4,
              }}
              aria-hidden="true"
            >
              {WEEKDAY_LABELS.map((label, index) => (
                <span
                  key={`wd-${index}`}
                  style={{
                    height: cellSize,
                    lineHeight: `${cellSize}px`,
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
          )}

          <div
            ref={gridRef}
            style={gridStyle}
            role="grid"
            aria-label="Contribution calendar"
          >
            {weeks.map((week) =>
              week.contributionDays.map((day) => (
                <ContributionCell
                  key={day.date}
                  date={day.date}
                  count={day.count}
                  level={day.level}
                  size={cellSize}
                  radius={radius}
                  onHover={handleHover}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <Tooltip
        date={hover?.date ?? ""}
        count={hover?.count ?? 0}
        x={hover?.x ?? 0}
        y={hover?.y ?? 0}
        visible={hover !== null}
      />
    </div>
  );
}
