"use client";

import { useTheme } from "./ThemeProvider";

type LegendProps = {
  cellSize?: number;
  radius?: number;
};

export function Legend({ cellSize = 10, radius = 2 }: LegendProps) {
  const theme = useTheme();

  return (
    <div
      className="flex items-center justify-end gap-1.5 text-[10px]"
      style={{ color: "var(--pulse-text-muted)" }}
      aria-label="Contribution level legend"
    >
      <span>Less</span>
      {theme.levels.map((color, index) => (
        <span
          key={color}
          className="inline-block"
          style={{
            width: cellSize,
            height: cellSize,
            borderRadius: radius,
            backgroundColor: color,
          }}
          aria-label={`Level ${index}`}
        />
      ))}
      <span>More</span>
    </div>
  );
}
