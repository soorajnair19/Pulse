import type { ActivityItem, WidgetVariant } from "@/types";

/** Horizontal gap between book cards. */
export const SHELF_CARD_GAP: Record<WidgetVariant, number> = {
  compact: 12,
  default: 16,
  detailed: 18,
};

/** Cover width per variant (portrait covers). */
export const SHELF_COVER_WIDTH: Record<WidgetVariant, number> = {
  compact: 56,
  default: 72,
  detailed: 84,
};

/** Approximate height of title + stars above the cover. */
const META_HEIGHT: Record<WidgetVariant, number> = {
  compact: 36,
  default: 40,
  detailed: 44,
};

/** Wood plank thickness at the bottom of each shelf row. */
export const SHELF_PLANK_HEIGHT = 10;

/** Vertical gap between shelf rows. */
export const SHELF_ROW_GAP = 18;

export type ShelfRow = {
  items: ActivityItem[];
};

export function coverWidthPx(variant: WidgetVariant): number {
  return SHELF_COVER_WIDTH[variant];
}

/** Portrait cover height from width (≈ 2:3). */
export function coverHeightPx(variant: WidgetVariant): number {
  return Math.round(coverWidthPx(variant) * 1.5);
}

export function cardWidthPx(variant: WidgetVariant): number {
  return coverWidthPx(variant);
}

export function cardHeightPx(variant: WidgetVariant): number {
  return META_HEIGHT[variant] + coverHeightPx(variant);
}

/**
 * Pack books oldest→newest left-to-right, wrapping onto lower shelves.
 */
export function packShelfRows(
  items: ActivityItem[],
  contentWidth: number,
  variant: WidgetVariant
): ShelfRow[] {
  const sorted = [...items].sort((a, b) => {
    const da = a.date ?? "";
    const db = b.date ?? "";
    if (da === db) return 0;
    return da < db ? -1 : 1;
  });

  const rows: ShelfRow[] = [];
  let current: ActivityItem[] = [];
  let usedWidth = 0;
  const innerWidth = Math.max(120, contentWidth);
  const cardW = cardWidthPx(variant);
  const gap = SHELF_CARD_GAP[variant];

  for (const item of sorted) {
    const needed = (current.length > 0 ? gap : 0) + cardW;

    if (current.length > 0 && usedWidth + needed > innerWidth) {
      rows.push({ items: current });
      current = [item];
      usedWidth = cardW;
    } else {
      current.push(item);
      usedWidth += needed;
    }
  }

  if (current.length > 0) {
    rows.push({ items: current });
  }

  return rows;
}

/**
 * Estimate total widget height so the shelf fits without scrolling.
 */
export function estimateShelfHeight(
  bookCount: number,
  variant: WidgetVariant,
  contentWidth = 680
): number {
  const count = Math.max(1, bookCount);
  const padX = variant === "compact" ? 28 : 32;
  const padY = variant === "compact" ? 24 : variant === "detailed" ? 36 : 30;
  const chrome =
    variant === "compact" ? 32 : variant === "detailed" ? 130 : 72;

  const innerW = Math.max(160, contentWidth - padX);
  const placeholderItems: ActivityItem[] = Array.from({ length: count }, () => ({
    title: "",
  }));
  const rows = packShelfRows(placeholderItems, innerW, variant);
  const rowCount = Math.max(1, rows.length);

  const rowHeight = cardHeightPx(variant) + SHELF_PLANK_HEIGHT;
  const gridH =
    rowCount * rowHeight + Math.max(0, rowCount - 1) * SHELF_ROW_GAP;

  return Math.ceil(padY + chrome + gridH + 8);
}
