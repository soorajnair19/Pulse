"use client";

import {
  createContext,
  useContext,
  useMemo,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  resolveTheme,
  themeToCssVars,
  type ThemeTokens,
} from "@/lib/themes";

type ThemeContextValue = {
  theme: ThemeTokens;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  themeId,
  heatmapAccent,
  children,
  className,
  style,
}: {
  themeId: string;
  /** When set, remaps heatmap levels 1–4 toward this accent. */
  heatmapAccent?: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const theme = useMemo(
    () => resolveTheme(themeId, heatmapAccent),
    [themeId, heatmapAccent]
  );
  const cssVars = themeToCssVars(theme) as CSSProperties;

  return (
    <ThemeContext.Provider value={{ theme }}>
      <div
        className={className}
        style={{
          ...cssVars,
          background: "var(--pulse-bg)",
          color: "var(--pulse-text)",
          ...style,
        }}
        data-theme={theme.id}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeTokens {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx.theme;
}
