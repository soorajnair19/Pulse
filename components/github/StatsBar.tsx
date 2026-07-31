"use client";

import type { ActivityStat } from "@/types";

type StatsBarProps = {
  totalContributions: number;
  currentStreak: number;
  longestStreak: number;
  showStreaks?: boolean;
  totalLabel?: string;
  extraStats?: ActivityStat[];
};

function Stat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span
        className="text-[10px] uppercase tracking-wide"
        style={{ color: "var(--pulse-text-muted)" }}
      >
        {label}
      </span>
      <span className="text-sm font-semibold tabular-nums truncate">
        {typeof value === "number" ? value.toLocaleString() : value}
      </span>
    </div>
  );
}

export function StatsBar({
  totalContributions,
  currentStreak,
  longestStreak,
  showStreaks = true,
  totalLabel = "Contributions",
  extraStats,
}: StatsBarProps) {
  return (
    <div className="flex items-end gap-6 flex-wrap">
      <Stat label={totalLabel} value={totalContributions} />
      {showStreaks && (
        <>
          <Stat label="Current streak" value={`${currentStreak}d`} />
          <Stat label="Longest streak" value={`${longestStreak}d`} />
        </>
      )}
      {extraStats?.map((stat) => (
        <Stat key={stat.label} label={stat.label} value={stat.value} />
      ))}
    </div>
  );
}
