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

async function capturePng(target: HTMLElement, filterImgs: boolean) {
  return toPng(target, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: resolveBackground(target),
    filter: filterImgs
      ? (node) => !(node instanceof HTMLElement && node.tagName === "IMG")
      : undefined,
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
    const dataUrl = await capturePng(target, false);
    triggerDownload(dataUrl, filename);
  } catch {
    // Retry without external images if CORS blocks canvas export.
    const dataUrl = await capturePng(target, true);
    triggerDownload(dataUrl, filename);
  }
}
