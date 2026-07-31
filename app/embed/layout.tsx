import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Pulse Embed",
  robots: { index: false, follow: false },
};

/**
 * Embed layout: widget-only surface — no chrome, no scroll, no margins.
 */
export default function EmbedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="pulse-embed-root h-full w-full overflow-hidden">
      {children}
    </div>
  );
}
