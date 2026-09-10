import type { ReactNode } from "react";
import { CornerTicks } from "./CornerTicks";

export const LABEL_CLASS = "font-mono text-[0.65rem] uppercase tracking-[0.25em] text-foreground sm:text-xs";
export const DIVIDER_CLASS = "h-px w-full max-w-sm bg-foreground/20";

export function Panel({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`relative border border-foreground/25 ${className}`}>
      <CornerTicks />
      {children}
    </div>
  );
}
