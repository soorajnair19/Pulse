"use client";

import { useState, type MouseEvent } from "react";
import type { ActivityItem, WidgetVariant } from "@/types";
import { FILMSTRIP_COLUMNS } from "@/lib/filmstrip-layout";
import { proxiedImageUrl } from "@/lib/image-proxy";
import { Tooltip } from "@/components/github/Tooltip";
import { useTheme } from "@/components/github/ThemeProvider";

const DEFAULT_RATING_ACCENT = "#00E054";
const PLACEHOLDER_BG = "rgba(255, 128, 1, 0.18)";

type PosterFilmstripProps = {
  items: ActivityItem[];
  variant: WidgetVariant;
  ratingAccent?: string;
};

function FilmstripPoster({
  item,
  themeText,
}: {
  item: ActivityItem;
  themeText: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const src = proxiedImageUrl(item.posterUrl);
  const showPoster = Boolean(src) && !imgFailed;

  if (!showPoster) {
    return (
      <div
        className="flex h-full w-full items-end p-1 text-[9px] font-medium leading-tight"
        style={{ background: PLACEHOLDER_BG, color: themeText }}
      >
        <span className="line-clamp-3">{item.title}</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={item.title}
      className="h-full w-full object-cover"
      crossOrigin="anonymous"
      onError={() => setImgFailed(true)}
    />
  );
}

export function PosterFilmstrip({
  items,
  variant,
  ratingAccent = DEFAULT_RATING_ACCENT,
}: PosterFilmstripProps) {
  const theme = useTheme();
  const columns = FILMSTRIP_COLUMNS[variant];
  const [hover, setHover] = useState<{
    item: ActivityItem;
    x: number;
    y: number;
  } | null>(null);

  if (items.length === 0) {
    return (
      <div
        className="flex w-full items-center justify-center py-6 text-center text-xs"
        style={{ color: "var(--pulse-text-muted)" }}
      >
        No films logged this year.
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2">
      {variant === "detailed" && (
        <p
          className="shrink-0 text-[10px] font-medium uppercase tracking-wide"
          style={{ color: theme.textMuted }}
        >
          {items.length} film{items.length === 1 ? "" : "s"}
        </p>
      )}

      <div
        className="grid w-full content-start gap-1.5"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        }}
      >
        {items.map((item, index) => {
          const key = `${item.date ?? "nodate"}-${item.title}-${index}`;

          const sharedClass =
            "relative aspect-[2/3] w-full overflow-hidden rounded-sm outline-none transition-transform hover:scale-[1.03] focus-visible:scale-[1.03]";
          const sharedStyle = {
            border: `1px solid ${theme.border}`,
            background: theme.surface,
          } as const;

          const handlers = {
            onMouseEnter: (event: MouseEvent<HTMLElement>) => {
              const rect = event.currentTarget.getBoundingClientRect();
              setHover({
                item,
                x: rect.left + rect.width / 2,
                y: rect.top,
              });
            },
            onMouseLeave: () => setHover(null),
          };

          const content = (
            <FilmstripPoster item={item} themeText={theme.text} />
          );

          if (item.url) {
            return (
              <a
                key={key}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={sharedClass}
                style={sharedStyle}
                aria-label={item.title}
                {...handlers}
              >
                {content}
              </a>
            );
          }

          return (
            <div
              key={key}
              className={sharedClass}
              style={sharedStyle}
              {...handlers}
            >
              {content}
            </div>
          );
        })}
      </div>

      <Tooltip
        date={hover?.item.date ?? ""}
        count={1}
        x={hover?.x ?? 0}
        y={hover?.y ?? 0}
        visible={Boolean(hover)}
        items={
          hover
            ? [
                {
                  title: hover.item.title,
                  ratingLabel: hover.item.ratingLabel,
                  liked: hover.item.liked,
                  url: hover.item.url,
                },
              ]
            : undefined
        }
        countNoun={{ singular: "Film Logged", plural: "Films Logged" }}
        ratingAccent={ratingAccent}
      />
    </div>
  );
}
