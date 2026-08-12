import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Pulse Embed",
  robots: { index: false, follow: false },
};

/**
 * Embed layout: widget-only surface — no chrome, no margins.
 * Height grows with content (e.g. Letterboxd filmstrip) so hosts / playground
 * can size the iframe to fit without clipping.
 */
export default function EmbedLayout({ children }: { children: ReactNode }) {
  return <div className="pulse-embed-root w-full">{children}</div>;
}
