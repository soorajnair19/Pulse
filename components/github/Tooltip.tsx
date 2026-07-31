"use client";

import {
  formatContributionCount,
  formatContributionDate,
} from "@/lib/utils";

type TooltipProps = {
  date: string;
  count: number;
  x: number;
  y: number;
  visible: boolean;
};

export function Tooltip({ date, count, x, y, visible }: TooltipProps) {
  if (!visible) return null;

  return (
    <div
      role="tooltip"
      className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-[calc(100%+8px)] rounded-md px-2.5 py-1.5 text-xs shadow-lg"
      style={{
        left: x,
        top: y,
        background: "var(--pulse-tooltip-bg)",
        color: "var(--pulse-tooltip-text)",
      }}
    >
      <div className="font-medium whitespace-nowrap">
        {formatContributionDate(date)}
      </div>
      <div className="opacity-80 whitespace-nowrap">
        {formatContributionCount(count)}
      </div>
    </div>
  );
}
