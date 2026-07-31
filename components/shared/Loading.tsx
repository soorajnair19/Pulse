export function Loading() {
  return (
    <div
      className="flex h-full min-h-[120px] w-full items-center justify-center"
      role="status"
      aria-label="Loading"
      style={{
        background: "var(--pulse-bg, #0d1117)",
        color: "var(--pulse-text-muted, #7d8590)",
      }}
    >
      <div
        className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"
        aria-hidden="true"
      />
      <span className="sr-only">Loading contribution data…</span>
    </div>
  );
}
