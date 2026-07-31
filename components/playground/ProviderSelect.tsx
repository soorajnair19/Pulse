"use client";

import { providers, type ProviderId } from "@/lib/providers";
import { cn } from "@/lib/utils";
import { ProviderIcon } from "./ProviderIcon";

type ProviderSelectProps = {
  value: ProviderId;
  onChange: (id: ProviderId) => void;
};

function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "");
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;
  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function ProviderSelect({ value, onChange }: ProviderSelectProps) {
  return (
    <div role="radiogroup" aria-label="Provider" className="flex flex-wrap gap-2">
      {providers.map((provider) => {
        const selected = provider.id === value;
        const disabled = !provider.enabled;

        return (
          <button
            key={provider.id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => {
              if (provider.enabled) onChange(provider.id);
            }}
            className={cn(
              "relative inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors",
              disabled && "cursor-not-allowed opacity-45",
              !selected &&
                !disabled &&
                "border-[#30363d] bg-[#161b22] text-[#7d8590] hover:border-[#484f58] hover:text-[#e6edf3]",
              selected && !disabled && "text-[#e6edf3]",
              disabled && "border-[#30363d] bg-[#161b22] text-[#7d8590]"
            )}
            style={
              selected && !disabled
                ? {
                    borderColor: provider.accent,
                    backgroundColor: hexToRgba(provider.accent, 0.12),
                    color: "#e6edf3",
                    boxShadow: `inset 0 0 0 1px ${hexToRgba(provider.accent, 0.35)}`,
                  }
                : undefined
            }
          >
            <ProviderIcon id={provider.id} className="shrink-0" />
            <span>{provider.label}</span>
            {disabled && (
              <span className="text-[10px] uppercase tracking-wide text-[#7d8590]">
                Soon
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
