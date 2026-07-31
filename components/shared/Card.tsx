import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn("rounded-lg border p-4", className)}
      style={{
        background: "var(--pulse-surface)",
        borderColor: "var(--pulse-border)",
      }}
    >
      {children}
    </div>
  );
}
