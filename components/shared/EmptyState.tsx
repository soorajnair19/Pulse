import { AlertCircle } from "lucide-react";

type EmptyStateProps = {
  title: string;
  message: string;
};

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <div
      className="flex h-full min-h-[120px] w-full items-center justify-center gap-3 px-4 py-6"
      role="alert"
      style={{
        background: "var(--pulse-bg, #0d1117)",
        color: "var(--pulse-text, #e6edf3)",
      }}
    >
      <AlertCircle
        className="shrink-0 opacity-70"
        size={20}
        aria-hidden="true"
      />
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p
          className="text-xs mt-0.5"
          style={{ color: "var(--pulse-text-muted, #7d8590)" }}
        >
          {message}
        </p>
      </div>
    </div>
  );
}
