"use client";

import { useLayoutEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import type { ActivityItem, WidgetVariant } from "@/types";
import { proxiedImageUrl } from "@/lib/image-proxy";
import {
  cardWidthPx,
  coverHeightPx,
  coverWidthPx,
  packShelfRows,
  SHELF_CARD_GAP,
  SHELF_PLANK_HEIGHT,
  SHELF_ROW_GAP,
} from "@/lib/shelf-layout";
import { formatContributionDate } from "@/lib/utils";
import { useTheme } from "@/components/github/ThemeProvider";

const DEFAULT_RATING_ACCENT = "#F4B23E";
const VIEWPORT_PAD = 8;
const GAP_ABOVE = 8;

type BookShelfProps = {
  items: ActivityItem[];
  variant: WidgetVariant;
  ratingAccent?: string;
};

type HoverState = {
  item: ActivityItem;
  x: number;
  y: number;
};

function ShelfTooltip({
  item,
  x,
  y,
  visible,
  ratingAccent,
}: {
  item: ActivityItem;
  x: number;
  y: number;
  visible: boolean;
  ratingAccent: string;
}) {
  const theme = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({ left: x, top: y, ready: false });

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!visible || !ref.current) {
      setCoords((prev) => ({ ...prev, ready: false }));
      return;
    }

    const el = ref.current;
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left = x - rect.width / 2;
    let top = y - rect.height - GAP_ABOVE;

    left = Math.max(
      VIEWPORT_PAD,
      Math.min(left, vw - rect.width - VIEWPORT_PAD)
    );

    if (top < VIEWPORT_PAD) {
      top = y + GAP_ABOVE + 12;
    }
    top = Math.max(
      VIEWPORT_PAD,
      Math.min(top, vh - rect.height - VIEWPORT_PAD)
    );

    setCoords({ left, top, ready: true });
  }, [visible, x, y, item]);

  if (!visible || !mounted) return null;

  const tooltip = (
    <div
      ref={ref}
      role="tooltip"
      className="pointer-events-none fixed z-[9999] w-max max-w-[min(280px,calc(100vw-16px))] overflow-hidden rounded-md px-2.5 py-2 text-xs shadow-lg"
      style={{
        left: coords.left,
        top: coords.top,
        opacity: coords.ready ? 1 : 0,
        background: theme.tooltipBg,
        color: theme.tooltipText,
      }}
    >
      <div className="font-medium leading-snug">{item.title}</div>
      {item.author && <div className="mt-0.5 opacity-80">{item.author}</div>}
      {item.date && (
        <div className="mt-1 opacity-70">
          Finished {formatContributionDate(item.date)}
        </div>
      )}
      {item.ratingLabel && (
        <div className="mt-1 tracking-tight" style={{ color: ratingAccent }}>
          {item.ratingLabel}
        </div>
      )}
    </div>
  );

  return createPortal(tooltip, document.body);
}

function StarRating({
  rating,
  accent,
}: {
  rating: number | undefined;
  accent: string;
}) {
  const filled = rating !== undefined ? Math.max(0, Math.min(5, rating)) : 0;

  return (
    <div className="flex items-center gap-[2px]" aria-label={rating ? `${rating} of 5 stars` : "Unrated"}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className="text-[9px] leading-none"
          style={{ color: i < filled ? accent : "rgba(255,255,255,0.28)" }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function BookCard({
  item,
  variant,
  ratingAccent,
  onHover,
  onLeave,
}: {
  item: ActivityItem;
  variant: WidgetVariant;
  ratingAccent: string;
  onHover: (event: MouseEvent<HTMLElement>) => void;
  onLeave: () => void;
}) {
  const theme = useTheme();
  const [imgFailed, setImgFailed] = useState(false);
  const coverSrc = proxiedImageUrl(item.posterUrl);
  const showCover = Boolean(coverSrc) && !imgFailed;
  const width = coverWidthPx(variant);
  const coverH = coverHeightPx(variant);

  const content = (
    <div
      className="flex flex-col transition-opacity hover:opacity-90"
      style={{ width }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div
        className="line-clamp-2 overflow-hidden text-[11px] font-medium leading-snug"
        style={{
          color: theme.text,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}
        title={item.title}
      >
        {item.title}
      </div>

      <div className="mt-1 mb-1.5">
        <StarRating rating={item.rating} accent={ratingAccent} />
      </div>

      <div
        className="overflow-hidden rounded-sm"
        style={{
          width,
          height: coverH,
          background: theme.surface,
          border: `1px solid ${theme.border}`,
        }}
      >
        {showCover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverSrc}
            alt={item.title}
            className="h-full w-full object-cover"
            crossOrigin="anonymous"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div
            className="flex h-full w-full items-end p-1.5 text-[9px] font-medium leading-tight"
            style={{ color: theme.textMuted }}
          >
            <span className="line-clamp-4">{item.title}</span>
          </div>
        )}
      </div>
    </div>
  );

  if (item.url) {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={item.title}
        className="shrink-0 outline-none focus-visible:ring-1 focus-visible:ring-white/40"
        style={{ width: cardWidthPx(variant) }}
      >
        {content}
      </a>
    );
  }

  return (
    <div className="shrink-0" style={{ width: cardWidthPx(variant) }}>
      {content}
    </div>
  );
}

export function BookShelf({
  items,
  variant,
  ratingAccent = DEFAULT_RATING_ACCENT,
}: BookShelfProps) {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(680);
  const [hover, setHover] = useState<HoverState | null>(null);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      setContentWidth(el.clientWidth || 680);
    };
    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const rows = useMemo(
    () => packShelfRows(items, contentWidth, variant),
    [items, contentWidth, variant]
  );

  if (items.length === 0) {
    return (
      <div
        className="flex w-full items-center justify-center py-6 text-center text-xs"
        style={{ color: "var(--pulse-text-muted)" }}
      >
        No books finished this year.
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex w-full flex-col">
      {variant === "detailed" && (
        <p
          className="mb-2 shrink-0 text-[10px] font-medium uppercase tracking-wide"
          style={{ color: theme.textMuted }}
        >
          {items.length} book{items.length === 1 ? "" : "s"}
        </p>
      )}

      <div className="flex w-full flex-col" style={{ gap: SHELF_ROW_GAP }}>
        {rows.map((row, rowIndex) => (
          <div key={`shelf-row-${rowIndex}`} className="w-full">
            <div
              className="flex items-end"
              style={{ gap: SHELF_CARD_GAP[variant] }}
            >
              {row.items.map((item, index) => {
                const key = `${item.date ?? "nodate"}-${item.title}-${index}`;
                return (
                  <BookCard
                    key={key}
                    item={item}
                    variant={variant}
                    ratingAccent={ratingAccent}
                    onHover={(event) => {
                      const rect = event.currentTarget.getBoundingClientRect();
                      setHover({
                        item,
                        x: rect.left + rect.width / 2,
                        y: rect.top,
                      });
                    }}
                    onLeave={() => setHover(null)}
                  />
                );
              })}
            </div>
            <div
              className="mt-1 w-full rounded-sm"
              style={{
                height: SHELF_PLANK_HEIGHT,
                background:
                  "linear-gradient(180deg, #5A4634 0%, #3D2A1C 45%, #2A1A0F 100%)",
                boxShadow:
                  "0 2px 4px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
              aria-hidden
            />
          </div>
        ))}
      </div>

      {hover && (
        <ShelfTooltip
          item={hover.item}
          x={hover.x}
          y={hover.y}
          visible={Boolean(hover)}
          ratingAccent={ratingAccent}
        />
      )}
    </div>
  );
}
