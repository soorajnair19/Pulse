"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import {
  CALENDAR_YEAR_MIN,
  calendarYearMax,
  getRecentCalendarYears,
  isCalendarYearPeriod,
} from "@/lib/period";
import { cn } from "@/lib/utils";

const triggerClassName =
  "flex w-full items-center justify-between rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-[#e6edf3] outline-none focus:border-[#39d353] focus:ring-1 focus:ring-[#39d353]";

type GoodreadsYearSelectProps = {
  value: string;
  onChange: (year: string) => void;
};

export function GoodreadsYearSelect({
  value,
  onChange,
}: GoodreadsYearSelectProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recentYears = useMemo(() => getRecentCalendarYears(), []);
  const maxYear = calendarYearMax();
  const isPreset = recentYears.includes(value);

  const close = useCallback(() => {
    setOpen(false);
    setError(null);
  }, []);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        close();
      }
    }

    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") close();
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    setDraft(isPreset ? "" : value);
    setError(null);
    // Focus custom field when the active year isn't in the recent list.
    const frame = requestAnimationFrame(() => {
      if (!isPreset) inputRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [open, value, isPreset]);

  function selectYear(year: string) {
    onChange(year);
    close();
  }

  function commitCustomYear(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) {
      setError("Enter a year.");
      return;
    }
    if (!isCalendarYearPeriod(trimmed)) {
      setError(`Use a year from ${CALENDAR_YEAR_MIN}–${maxYear}.`);
      return;
    }
    selectYear(trimmed);
  }

  function handleCustomSubmit(event: FormEvent) {
    event.preventDefault();
    commitCustomYear(draft);
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        id="pulse-period"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleTriggerKeyDown}
        className={triggerClassName}
      >
        <span>{value}</span>
        <span className="text-[#7d8590]" aria-hidden>
          ▾
        </span>
      </button>

      {open && (
        <div
          id={listId}
          role="listbox"
          aria-label="Year"
          className="absolute left-0 right-0 z-20 mt-1 overflow-hidden rounded-md border border-[#30363d] bg-[#0d1117] shadow-lg"
        >
          <ul className="max-h-56 overflow-y-auto py-1">
            {recentYears.map((year) => {
              const selected = year === value;
              return (
                <li key={year} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onClick={() => selectYear(year)}
                    className={cn(
                      "flex w-full px-3 py-1.5 text-left text-sm text-[#e6edf3] hover:bg-[#21262d]",
                      selected && "bg-[#21262d] text-[#39d353]"
                    )}
                  >
                    {year}
                  </button>
                </li>
              );
            })}
          </ul>

          <div
            className="border-t border-[#30363d] px-3 py-2"
            role="presentation"
          >
            <form onSubmit={handleCustomSubmit} className="flex flex-col gap-1.5">
              <label
                htmlFor="pulse-period-custom-year"
                className="text-[10px] font-medium uppercase tracking-wide text-[#7d8590]"
              >
                Custom year
              </label>
              <input
                ref={inputRef}
                id="pulse-period-custom-year"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                placeholder={`${CALENDAR_YEAR_MIN}–${maxYear}`}
                value={draft}
                onChange={(event) => {
                  setDraft(event.target.value.replace(/\D/g, "").slice(0, 4));
                  if (error) setError(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    event.stopPropagation();
                    close();
                  }
                }}
                className="rounded-md border border-[#30363d] bg-[#161b22] px-2.5 py-1.5 text-sm text-[#e6edf3] outline-none placeholder:text-[#484f58] focus:border-[#39d353] focus:ring-1 focus:ring-[#39d353]"
              />
              {error && (
                <p className="text-[11px] text-[#f85149]" role="alert">
                  {error}
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
