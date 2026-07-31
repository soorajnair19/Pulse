"use client";

import { forwardRef, useEffect, useState } from "react";

type PreviewFrameProps = {
  src: string | null;
  height: number;
  title: string;
  onLoadChange?: (loaded: boolean) => void;
};

export const PreviewFrame = forwardRef<HTMLIFrameElement, PreviewFrameProps>(
  function PreviewFrame({ src, height, title, onLoadChange }, ref) {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      if (src) {
        setLoading(true);
        onLoadChange?.(false);
      } else {
        setLoading(false);
        onLoadChange?.(false);
      }
    }, [src, onLoadChange]);

    return (
      <div className="flex w-full flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-[#7d8590]">
            Preview
          </p>
          {src && loading && (
            <span className="text-xs text-[#7d8590]">Loading…</span>
          )}
        </div>

        <div
          className="relative w-full overflow-hidden rounded-lg border border-[#30363d] bg-[#0d1117]"
          style={{ minHeight: height }}
        >
          {!src ? (
            <div
              className="flex items-center justify-center px-4 text-center text-sm text-[#7d8590]"
              style={{ height }}
            >
              Enter a username and click Generate to preview your widget.
            </div>
          ) : (
            <>
              {loading && (
                <div
                  className="absolute inset-0 z-10 flex items-center justify-center bg-[#0d1117]/80"
                  aria-hidden="true"
                >
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#7d8590] border-t-transparent" />
                </div>
              )}
              <iframe
                ref={ref}
                key={src}
                src={src}
                title={title}
                width="100%"
                height={height}
                className="block w-full border-0"
                loading="lazy"
                onLoad={() => {
                  setLoading(false);
                  onLoadChange?.(true);
                }}
              />
            </>
          )}
        </div>
      </div>
    );
  }
);
