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
  onLoadChange?: (loaded: boolean) => void;
};

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (!ref) return;
  if (typeof ref === "function") ref(value);
  else ref.current = value;
}

export const PreviewFrame = forwardRef<HTMLIFrameElement, PreviewFrameProps>(
  function PreviewFrame({ cacheKey, src, height, title, onLoadChange }, ref) {
    const [cache, setCache] = useState<Record<string, CacheEntry>>({});
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

    const showLoading = Boolean(src && (!active || !active.ready));

    return (
      <div className="flex w-full flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-[#7d8590]">
            Preview
          </p>
          {showLoading && (
            <span className="text-xs text-[#7d8590]">Loading…</span>
          )}
        </div>

        <div
          className="relative w-full overflow-hidden rounded-lg border border-[#30363d] bg-[#0d1117]"
          style={{ minHeight: height }}
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
                height={height}
                className={cn("block w-full border-0", !isActive && "hidden")}
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
