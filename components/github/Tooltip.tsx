"use client";

import type { ActivityItem, CountNoun } from "@/types";
import {
  formatActivityCount,
  formatContributionDate,
} from "@/lib/utils";

type TooltipProps = {
  date: string;
  count: number;
  x: number;
  y: number;
  visible: boolean;
  items?: ActivityItem[];
  countNoun?: CountNoun;
};

export function Tooltip({
  date,
  count,
  x,
  y,
  visible,
  items,
  countNoun,
}: TooltipProps) {
  if (!visible) return null;

  return (
    <div
      role="tooltip"
      className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-[calc(100%+8px)] rounded-md px-2.5 py-1.5 text-xs shadow-lg max-w-[240px]"
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
        {formatActivityCount(count, countNoun)}
      </div>
      {items && items.length > 0 && (
        <ul className="mt-1.5 space-y-0.5 border-t border-white/10 pt-1.5">
          {items.map((item, index) => (
            <li key={`${item.title}-${index}`} className="leading-snug">
              <span className="opacity-70">• </span>
              <span>{item.title}</span>
              {item.ratingLabel && (
                <span className="ml-1.5 opacity-90">{item.ratingLabel}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
