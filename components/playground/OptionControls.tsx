"use client";

import type { ContributionPeriod, ThemeId, WidgetVariant } from "@/types";
import { PERIOD_OPTIONS } from "@/lib/period";
import { themes } from "@/lib/themes";

const VARIANTS: Array<{ id: WidgetVariant; label: string }> = [
  { id: "compact", label: "Compact" },
  { id: "default", label: "Default" },
  { id: "detailed", label: "Detailed" },
];

const selectClassName =
  "rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-[#e6edf3] outline-none focus:border-[#39d353] focus:ring-1 focus:ring-[#39d353]";

type OptionControlsProps = {
  variant: WidgetVariant;
  period: ContributionPeriod;
  theme: ThemeId;
  onVariantChange: (variant: WidgetVariant) => void;
  onPeriodChange: (period: ContributionPeriod) => void;
  onThemeChange: (theme: ThemeId) => void;
};

export function OptionControls({
  variant,
  period,
  theme,
  onVariantChange,
  onPeriodChange,
  onThemeChange,
}: OptionControlsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="pulse-variant"
          className="text-xs font-medium uppercase tracking-wide text-[#7d8590]"
        >
          Variant
        </label>
        <select
          id="pulse-variant"
          value={variant}
          onChange={(event) =>
            onVariantChange(event.target.value as WidgetVariant)
          }
          className={selectClassName}
        >
          {VARIANTS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="pulse-period"
          className="text-xs font-medium uppercase tracking-wide text-[#7d8590]"
        >
          Duration
        </label>
        <select
          id="pulse-period"
          value={period}
          onChange={(event) =>
            onPeriodChange(event.target.value as ContributionPeriod)
          }
          className={selectClassName}
        >
          {PERIOD_OPTIONS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="pulse-theme"
          className="text-xs font-medium uppercase tracking-wide text-[#7d8590]"
        >
          Theme
        </label>
        <select
          id="pulse-theme"
          value={theme}
          onChange={(event) => onThemeChange(event.target.value as ThemeId)}
          className={selectClassName}
        >
          {Object.values(themes).map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
