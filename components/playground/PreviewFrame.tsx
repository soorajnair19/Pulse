"use client";

import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type Ref,
} from "react";
import { cn } from "@/lib/utils";

type CacheEntry = {
  src: string;
  ready: boolean;
};

type PreviewFrameProps = {
  /** Stable key (e.g. provider id) so previews survive tab switches. */
  cacheKey: string;
  src: string | null;
  height: number;
  title: string;
  /** Grow iframe to fit widget content (e.g. Letterboxd filmstrip). */
  autoHeight?: boolean;
  onLoadChange?: (loaded: boolean) => void;
  onHeightChange?: (height: number) => void;
};

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (!ref) return;
  if (typeof ref === "function") ref(value);
  else ref.current = value;
}

function measureWidgetHeight(iframe: HTMLIFrameElement): number | null {
  const doc = iframe.contentDocument;
  if (!doc) return null;
  const widget =
    (doc.querySelector(".pulse-widget") as HTMLElement | null) ??
    (doc.querySelector(".pulse-embed-root") as HTMLElement | null) ??
    doc.body;
  if (!widget) return null;
  const height = Math.ceil(
    Math.max(widget.scrollHeight, widget.getBoundingClientRect().height)
  );
  return height > 0 ? height : null;
}

export const PreviewFrame = forwardRef<HTMLIFrameElement, PreviewFrameProps>(
  function PreviewFrame(
    {
      cacheKey,
      src,
      height,
      title,
      autoHeight = false,
      onLoadChange,
      onHeightChange,
    },
    ref
  ) {
    const [cache, setCache] = useState<Record<string, CacheEntry>>({});
    const [measuredHeight, setMeasuredHeight] = useState<number | null>(null);
    const nodeRefs = useRef<Record<string, HTMLIFrameElement | null>>({});

    // Keep per-key iframes mounted; only replace an entry when its src changes.
    let displayCache = cache;
    if (src) {
      const existing = cache[cacheKey];
      if (!existing || existing.src !== src) {
        displayCache = { ...cache, [cacheKey]: { src, ready: false } };
        setCache(displayCache);
      }
    } else if (cacheKey in cache) {
      displayCache = { ...cache };
      delete displayCache[cacheKey];
      setCache(displayCache);
    }

    const active = src ? displayCache[cacheKey] : undefined;
    const activeReady = Boolean(active && active.src === src && active.ready);

    useEffect(() => {
      onLoadChange?.(Boolean(src) && activeReady);
    }, [src, activeReady, onLoadChange]);

    useEffect(() => {
      const node =
        src && activeReady ? (nodeRefs.current[cacheKey] ?? null) : null;
      assignRef(ref, node);
    }, [ref, cacheKey, src, activeReady, displayCache]);

    // Reset measured height when the preview source changes.
    useEffect(() => {
      setMeasuredHeight(null);
    }, [src, autoHeight]);

    // Auto-size iframe to the widget's natural height (no internal scroll).
    useEffect(() => {
      if (!autoHeight || !src || !activeReady) return;

      const iframe = nodeRefs.current[cacheKey];
      if (!iframe?.contentDocument) return;

      let cancelled = false;
      let frame = 0;

      const publish = (next: number) => {
        if (cancelled) return;
        setMeasuredHeight((prev) => (prev === next ? prev : next));
        onHeightChange?.(next);
      };

      const measure = () => {
        const next = measureWidgetHeight(iframe);
        if (next != null) publish(next);
      };

      const schedule = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(measure);
      };

      schedule();

      const doc = iframe.contentDocument;
      const widget =
        (doc.querySelector(".pulse-widget") as HTMLElement | null) ?? doc.body;

      const observer =
        typeof ResizeObserver !== "undefined" && widget
          ? new ResizeObserver(schedule)
          : null;
      if (observer && widget) observer.observe(widget);

      const imgs = Array.from(doc.querySelectorAll("img"));
      imgs.forEach((img) => {
        img.addEventListener("load", schedule);
        img.addEventListener("error", schedule);
      });

      // Catch late layout after fonts/images.
      const t1 = window.setTimeout(schedule, 250);
      const t2 = window.setTimeout(schedule, 1000);

      return () => {
        cancelled = true;
        cancelAnimationFrame(frame);
        observer?.disconnect();
        window.clearTimeout(t1);
        window.clearTimeout(t2);
        imgs.forEach((img) => {
          img.removeEventListener("load", schedule);
          img.removeEventListener("error", schedule);
        });
      };
    }, [autoHeight, src, activeReady, cacheKey, onHeightChange]);

    const showLoading = Boolean(src && (!active || !active.ready));
    const iframeHeight =
      autoHeight && measuredHeight != null
        ? Math.max(height, measuredHeight)
        : height;

    return (
      <div className="mt-6 flex w-full flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-[#7d8590]">
            Preview
          </p>
          {showLoading && (
            <span className="text-xs text-[#7d8590]">Loading…</span>
          )}
        </div>

        <div
          className="relative w-full overflow-hidden rounded-lg border border-[#30363d] bg-[#0d1117] p-4 pl-5"
          style={{ minHeight: iframeHeight + 32 }}
        >
          {!src && (
            <div
              className="flex items-center justify-center px-4 text-center text-sm text-[#7d8590]"
              style={{ height }}
            >
              Enter a username and click Generate to preview your widget.
            </div>
          )}

          {showLoading && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center bg-[#0d1117]/80"
              aria-hidden="true"
            >
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#7d8590] border-t-transparent" />
            </div>
          )}

          {Object.entries(displayCache).map(([key, entry]) => {
            const isActive = key === cacheKey && Boolean(src);
            return (
              <iframe
                key={key}
                ref={(el) => {
                  nodeRefs.current[key] = el;
                }}
                src={entry.src}
                title={isActive ? title : `${key} preview`}
                width="100%"
                height={isActive ? iframeHeight : height}
                className={cn(
                  "block w-full rounded-md border-0",
                  !isActive && "hidden"
                )}
                onLoad={() => {
                  setCache((prev) => {
                    const cur = prev[key];
                    if (!cur || cur.ready) return prev;
                    return { ...prev, [key]: { ...cur, ready: true } };
                  });
                }}
              />
            );
          })}
        </div>
      </div>
    );
  }
);
