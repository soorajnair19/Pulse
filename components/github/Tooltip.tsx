"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ActivityItem, CountNoun } from "@/types";
import {
  formatActivityCount,
  formatContributionDate,
} from "@/lib/utils";
import { useTheme } from "./ThemeProvider";

type TooltipProps = {
  date: string;
  count: number;
  x: number;
  y: number;
  visible: boolean;
  items?: ActivityItem[];
  countNoun?: CountNoun;
};

const VIEWPORT_PAD = 8;
const GAP_ABOVE = 8;

export function Tooltip({
  date,
  count,
  x,
  y,
  visible,
  items,
  countNoun,
}: TooltipProps) {
  const theme = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({ left: x, top: y, ready: false });

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!visible || !ref.current) {
      setCoords((prev) => ({ ...prev, ready: false }));
      return;
    }

    const el = ref.current;
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Prefer centered above the cell, then clamp so the full tooltip stays on screen.
    let left = x - rect.width / 2;
    let top = y - rect.height - GAP_ABOVE;

    left = Math.max(
      VIEWPORT_PAD,
      Math.min(left, vw - rect.width - VIEWPORT_PAD)
    );

    if (top < VIEWPORT_PAD) {
      // Not enough room above — place just below the cell.
      top = y + GAP_ABOVE + 12;
    }
    top = Math.max(
      VIEWPORT_PAD,
      Math.min(top, vh - rect.height - VIEWPORT_PAD)
    );

    setCoords({ left, top, ready: true });
  }, [visible, x, y, date, count, items, countNoun]);

  if (!visible || !mounted) return null;

  const tooltip = (
    <div
      ref={ref}
      role="tooltip"
      className="pointer-events-none fixed z-[9999] w-max max-w-[min(420px,calc(100vw-16px))] rounded-md px-2.5 py-1.5 text-xs shadow-lg"
      style={{
        left: coords.left,
        top: coords.top,
        opacity: coords.ready ? 1 : 0,
        background: theme.tooltipBg,
        color: theme.tooltipText,
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
            <li
              key={`${item.title}-${index}`}
              className="flex items-baseline gap-1.5 whitespace-nowrap leading-snug"
            >
              <span className="shrink-0 opacity-70">•</span>
              <span>{item.title}</span>
              {item.ratingLabel && (
                <span
                  className="shrink-0"
                  style={{ color: "#00E054" }}
                >
                  {item.ratingLabel}
                </span>
              )}
              {item.liked && (
                <span
                  className="shrink-0"
                  style={{ color: "#FF8000" }}
                  aria-label="Liked"
                >
                  ♥
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return createPortal(tooltip, document.body);
}
