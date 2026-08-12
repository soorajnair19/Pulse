import type { WidgetVariant } from "@/types";

/** Columns per row for the Letterboxd filmstrip mosaic. */
export const FILMSTRIP_COLUMNS: Record<WidgetVariant, number> = {
  compact: 8,
  default: 8,
  detailed: 7,
};

const GAP_PX = 6;

/**
 * Estimate total widget height so the filmstrip fits without scrolling.
 * `contentWidth` should match the iframe/widget width when known.
 */
export function estimateFilmstripHeight(
  filmCount: number,
  variant: WidgetVariant,
  contentWidth = 680
): number {
  const columns = FILMSTRIP_COLUMNS[variant];
  const count = Math.max(1, filmCount);
  const rows = Math.ceil(count / columns);

  const padX = variant === "compact" ? 28 : 32;
  const padY = variant === "compact" ? 24 : variant === "detailed" ? 36 : 30;
  const chrome =
    variant === "compact" ? 32 : variant === "detailed" ? 130 : 72;

  const innerW = Math.max(160, contentWidth - padX);
  const posterW = (innerW - GAP_PX * (columns - 1)) / columns;
  const posterH = posterW * (3 / 2);
  const gridH = rows * posterH + Math.max(0, rows - 1) * GAP_PX;

  return Math.ceil(padY + chrome + gridH + 8);
}
