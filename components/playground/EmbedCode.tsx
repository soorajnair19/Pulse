"use client";

import { useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

type EmbedCodeProps = {
  code: string | null;
};

async function copyText(text: string, fallbackEl: HTMLTextAreaElement | null) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    if (!fallbackEl) return false;
    fallbackEl.focus();
    fallbackEl.select();
    try {
      return document.execCommand("copy");
    } catch {
      return false;
    }
  }
}

export function EmbedCode({ code }: EmbedCodeProps) {
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleCopy() {
    if (!code) return;
    const ok = await copyText(code, textareaRef.current);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-[#7d8590]">
          Embed code
        </p>
        <button
          type="button"
          disabled={!code}
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md border border-[#30363d] bg-[#161b22] px-2.5 py-1.5 text-xs font-medium text-[#e6edf3] transition-colors hover:border-[#484f58] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {copied ? (
            <>
              <Check size={14} aria-hidden="true" />
              Copied
            </>
          ) : (
            <>
              <Copy size={14} aria-hidden="true" />
              Copy embed code
            </>
          )}
        </button>
      </div>

      <textarea
        ref={textareaRef}
        readOnly
        value={code ?? "Generate a widget to get your embed snippet."}
        rows={6}
        className="w-full resize-none rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2.5 font-mono text-xs leading-relaxed text-[#e6edf3] outline-none focus:border-[#39d353]"
        aria-label="Embed code"
      />
    </div>
  );
}
