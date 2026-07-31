"use client";

import { ChevronRight } from "lucide-react";

type EmbedCodeProps = {
  code: string | null;
};

export function EmbedCode({ code }: EmbedCodeProps) {
  return (
    <details className="group w-full rounded-md border border-[#30363d] bg-[#0d1117] open:bg-[#161b22]/40">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 text-xs font-medium uppercase tracking-wide text-[#7d8590] marker:content-none [&::-webkit-details-marker]:hidden">
        <ChevronRight
          size={14}
          aria-hidden="true"
          className="shrink-0 transition-transform group-open:rotate-90"
        />
        Embed code
      </summary>

      <div className="border-t border-[#30363d] px-3 pb-3 pt-2">
        <textarea
          readOnly
          value={code ?? "Generate a widget to get your embed snippet."}
          rows={6}
          className="w-full resize-none rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2.5 font-mono text-xs leading-relaxed text-[#e6edf3] outline-none focus:border-[#39d353]"
          aria-label="Embed code"
        />
      </div>
    </details>
  );
}
