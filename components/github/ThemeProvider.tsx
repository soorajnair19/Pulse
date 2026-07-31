"use client";

import {
  createContext,
  useContext,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  getTheme,
  themeToCssVars,
  type ThemeTokens,
} from "@/lib/themes";

type ThemeContextValue = {
  theme: ThemeTokens;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  themeId,
  children,
  className,
  style,
}: {
  themeId: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const theme = getTheme(themeId);
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
