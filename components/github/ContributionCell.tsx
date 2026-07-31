"use client";

import { useTheme } from "./ThemeProvider";
import type { ActivityItem, ContributionLevel, CountNoun } from "@/types";
import {
  formatActivityCount,
  formatContributionDate,
} from "@/lib/utils";

export type CellHoverPayload = {
  date: string;
  count: number;
  x: number;
  y: number;
  items?: ActivityItem[];
};

type ContributionCellProps = {
  date: string;
  count: number;
  level: ContributionLevel;
  size: number;
  radius: number;
  items?: ActivityItem[];
  countNoun?: CountNoun;
  onHover?: (payload: CellHoverPayload | null) => void;
};

export function ContributionCell({
  date,
  count,
  level,
  size,
  radius,
  items,
  countNoun,
  onHover,
}: ContributionCellProps) {
  const theme = useTheme();
  const label = `${formatContributionDate(date)}: ${formatActivityCount(count, countNoun)}`;

  return (
    <button
      type="button"
      className="pulse-cell block shrink-0 border-0 p-0 outline-none transition-transform duration-150 ease-out hover:scale-125 focus-visible:scale-125 focus-visible:ring-2 focus-visible:ring-[var(--pulse-text)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--pulse-bg)]"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor: theme.levels[level],
      }}
      aria-label={label}
      onMouseEnter={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        onHover?.({
          date,
          count,
          items,
          x: rect.left + rect.width / 2,
          y: rect.top,
        });
      }}
      onMouseLeave={() => onHover?.(null)}
      onFocus={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        onHover?.({
          date,
          count,
          items,
          x: rect.left + rect.width / 2,
          y: rect.top,
        });
      }}
      onBlur={() => onHover?.(null)}
    />
  );
}
