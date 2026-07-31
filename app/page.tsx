import { Suspense } from "react";
import { Playground } from "@/components/playground/Playground";

function PlaygroundFallback() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="size-9 animate-pulse rounded-sm bg-[#21262d]" />
        <div className="h-12 w-32 animate-pulse rounded bg-[#21262d]" />
      </div>
      <div className="h-5 w-72 animate-pulse rounded bg-[#21262d]" />
      <div className="mt-4 h-64 animate-pulse rounded-xl border border-[#30363d] bg-[#161b22]/60" />
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-full bg-[#0d1117] px-5 py-12 sm:px-8 sm:py-16">
      <Suspense fallback={<PlaygroundFallback />}>
        <Playground />
      </Suspense>
    </main>
  );
}
