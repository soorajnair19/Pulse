"use client";

import type { ContributionWeek } from "@/types";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

type MonthLabelsProps = {
  weeks: ContributionWeek[];
  cellSize: number;
  gap: number;
};

export function MonthLabels({ weeks, cellSize, gap }: MonthLabelsProps) {
  const labels: Array<{ month: string; offset: number }> = [];
  let lastMonth = -1;

  weeks.forEach((week, index) => {
    const day = week.contributionDays[0];
    if (!day) return;
    const month = new Date(`${day.date}T00:00:00Z`).getUTCMonth();
    if (month !== lastMonth) {
      labels.push({
        month: MONTH_LABELS[month],
        offset: index * (cellSize + gap),
      });
      lastMonth = month;
    }
  });

  // Drop labels that would overlap (too close to previous)
  const filtered: typeof labels = [];
  for (const label of labels) {
    const prev = filtered[filtered.length - 1];
    if (!prev || label.offset - prev.offset >= cellSize * 2.5) {
      filtered.push(label);
    }
  }

  return (
    <div
      className="relative mb-1 text-[10px] leading-none"
      style={{
        color: "var(--pulse-text-muted)",
        height: 12,
        marginLeft: 0,
      }}
      aria-hidden="true"
    >
      {filtered.map((label) => (
        <span
          key={`${label.month}-${label.offset}`}
          className="absolute top-0"
          style={{ left: label.offset }}
        >
          {label.month}
        </span>
      ))}
    </div>
  );
}
