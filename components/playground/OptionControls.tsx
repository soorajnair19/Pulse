"use client";

import type { ContributionPeriod, ThemeId, WidgetVariant } from "@/types";
import type { ProviderId } from "@/lib/providers";
import { getPeriodOptions } from "@/lib/period";
import { themes } from "@/lib/themes";
import { GoodreadsYearSelect } from "./GoodreadsYearSelect";

const VARIANTS: Array<{ id: WidgetVariant; label: string }> = [
  { id: "compact", label: "Compact" },
  { id: "default", label: "Default" },
  { id: "detailed", label: "Detailed" },
];

/** Matches Lucide ChevronDown at 16px / #7d8590 so native <select>s match GoodreadsYearSelect. */
const SELECT_CHEVRON = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7d8590" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>'
)}")`;

const selectClassName =
  "w-full appearance-none rounded-md border border-[#30363d] bg-[#0d1117] bg-[length:1rem] bg-[position:right_0.75rem_center] bg-no-repeat py-2 pl-3 pr-9 text-sm text-[#e6edf3] outline-none focus:border-[#39d353] focus:ring-1 focus:ring-[#39d353]";

const selectStyle = { backgroundImage: SELECT_CHEVRON } as const;

type OptionControlsProps = {
  providerId: ProviderId;
  variant: WidgetVariant;
  period: ContributionPeriod;
  theme: ThemeId;
  onVariantChange: (variant: WidgetVariant) => void;
  onPeriodChange: (period: ContributionPeriod) => void;
  onThemeChange: (theme: ThemeId) => void;
};

export function OptionControls({
  providerId,
  variant,
  period,
  theme,
  onVariantChange,
  onPeriodChange,
  onThemeChange,
}: OptionControlsProps) {
  const periodOptions = getPeriodOptions(providerId);
  const usesYearSelect =
    providerId === "goodreads" || providerId === "letterboxd";
  const durationLabel = usesYearSelect ? "Year" : "Duration";

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
          style={selectStyle}
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
          {durationLabel}
        </label>
        {usesYearSelect ? (
          <GoodreadsYearSelect value={period} onChange={onPeriodChange} />
        ) : (
          <select
            id="pulse-period"
            value={period}
            onChange={(event) =>
              onPeriodChange(event.target.value as ContributionPeriod)
            }
            className={selectClassName}
            style={selectStyle}
          >
            {periodOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        )}
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
          style={selectStyle}
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
