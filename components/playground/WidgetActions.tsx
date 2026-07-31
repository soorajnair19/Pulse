"use client";

import { useRef, useState, type RefObject } from "react";
import { Check, Copy, Download, Loader2 } from "lucide-react";
import { downloadWidgetImage } from "@/lib/download-widget-image";

type WidgetActionsProps = {
  code: string | null;
  filename: string;
  iframeRef: RefObject<HTMLIFrameElement | null>;
  canDownload: boolean;
};

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.setAttribute("readonly", "");
      el.style.position = "fixed";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(el);
      return ok;
    } catch {
      return false;
    }
  }
}

const buttonClassName =
  "inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-[#30363d] bg-[#161b22] px-3 py-2.5 text-sm font-medium text-[#e6edf3] transition-colors hover:border-[#484f58] disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none";

export function WidgetActions({
  code,
  filename,
  iframeRef,
  canDownload,
}: WidgetActionsProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const copyResetRef = useRef<number | null>(null);

  async function handleCopy() {
    if (!code) return;
    const ok = await copyText(code);
    if (!ok) return;

    setCopied(true);
    if (copyResetRef.current) window.clearTimeout(copyResetRef.current);
    copyResetRef.current = window.setTimeout(() => setCopied(false), 1800);
  }

  async function handleDownload() {
    const iframe = iframeRef.current;
    if (!iframe || !canDownload || downloading) return;

    setDownloadError(null);
    setDownloading(true);
    try {
      await downloadWidgetImage(iframe, filename);
    } catch (error) {
      setDownloadError(
        error instanceof Error
          ? error.message
          : "Could not download image. Try again after the preview loads."
      );
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          disabled={!code}
          onClick={handleCopy}
          className={buttonClassName}
        >
          {copied ? (
            <>
              <Check size={16} aria-hidden="true" />
              Copied
            </>
          ) : (
            <>
              <Copy size={16} aria-hidden="true" />
              Copy embed code
            </>
          )}
        </button>

        <button
          type="button"
          disabled={!canDownload || downloading}
          onClick={handleDownload}
          className={buttonClassName}
        >
          {downloading ? (
            <>
              <Loader2 size={16} aria-hidden="true" className="animate-spin" />
              Downloading…
            </>
          ) : (
            <>
              <Download size={16} aria-hidden="true" />
              Download as image
            </>
          )}
        </button>
      </div>

      {downloadError && (
        <p className="text-xs text-[#f85149]" role="alert">
          {downloadError}
        </p>
      )}
    </div>
  );
}
