"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import { lightenHex, type PulseProvider } from "@/lib/providers";

type UsernameFormProps = {
  provider: PulseProvider;
  value: string;
  error: string | null;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export function UsernameForm({
  provider,
  value,
  error,
  onChange,
  onSubmit,
}: UsernameFormProps) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit();
  }

  const accent = provider.accent;
  const accentHover = lightenHex(accent, 0.14);

  const inputStyle: CSSProperties = focused
    ? {
        borderColor: accent,
        boxShadow: `0 0 0 1px ${accent}`,
      }
    : {};

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2">
      <label
        htmlFor="pulse-username"
        className="text-xs font-medium uppercase tracking-wide text-[#7d8590]"
      >
        {provider.usernameLabel}
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="pulse-username"
          type="text"
          autoComplete="username"
          spellCheck={false}
          placeholder={provider.usernamePlaceholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="min-w-0 flex-1 rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2.5 text-sm text-[#e6edf3] outline-none placeholder:text-[#484f58]"
          style={inputStyle}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "pulse-username-error" : undefined}
        />
        <button
          type="submit"
          className="shrink-0 rounded-md px-5 py-2.5 text-sm font-medium text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            backgroundColor: hovered ? accentHover : accent,
            outlineColor: accent,
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          Generate
        </button>
      </div>
      {error && (
        <p id="pulse-username-error" className="text-xs text-[#f85149]" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
