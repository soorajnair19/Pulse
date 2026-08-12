import { toPng } from "html-to-image";

function triggerDownload(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

function resolveBackground(el: HTMLElement): string {
  const bg = getComputedStyle(el).backgroundColor;
  if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") return bg;
  return "#0d1117";
}

/** Tiny transparent GIF — used when an external image can't be inlined. */
const TRANSPARENT_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

function toError(error: unknown, fallback: string): Error {
  if (error instanceof Error) return error;
  if (typeof error === "string" && error.trim()) return new Error(error);
  return new Error(fallback);
}

/**
 * Exclude images from the clone. Use nodeName (not instanceof) so it works
 * for nodes owned by an iframe document.
 */
function excludeImages(node: Node): boolean {
  const name = node.nodeName;
  return name !== "IMG" && name !== "IMAGE";
}

async function capturePng(
  target: HTMLElement,
  opts: { skipImages: boolean }
): Promise<string> {
  return toPng(target, {
    // cacheBust appends ?t=… which breaks some CDNs (e.g. Letterboxd).
    cacheBust: false,
    pixelRatio: 2,
    backgroundColor: resolveBackground(target),
    imagePlaceholder: TRANSPARENT_PIXEL,
    // Don't reject the whole capture when a single poster fails to inline.
    onImageErrorHandler: () => undefined,
    filter: opts.skipImages ? excludeImages : undefined,
  });
}

/**
 * Capture a same-origin preview iframe's widget as a PNG and download it.
 */
export async function downloadWidgetImage(
  iframe: HTMLIFrameElement,
  filename: string
): Promise<void> {
  const doc = iframe.contentDocument;
  if (!doc?.body) {
    throw new Error("Preview is not ready yet.");
  }

  const target =
    (doc.querySelector(".pulse-widget") as HTMLElement | null) ??
    (doc.querySelector(".pulse-embed-root") as HTMLElement | null) ??
    doc.body;

  try {
    const dataUrl = await capturePng(target, { skipImages: false });
    triggerDownload(dataUrl, filename);
  } catch (firstError) {
    try {
      // Retry without <img> nodes — Letterboxd/CDN posters often block canvas export.
      const dataUrl = await capturePng(target, { skipImages: true });
      triggerDownload(dataUrl, filename);
    } catch (secondError) {
      throw toError(
        secondError ?? firstError,
        "Could not download image. Try again after the preview loads."
      );
    }
  }
}
