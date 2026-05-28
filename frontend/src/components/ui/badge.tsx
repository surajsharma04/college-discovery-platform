import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[var(--brand)]/10 bg-[var(--brand-soft)]/35 px-2.5 py-1 text-xs font-medium text-[var(--ink-900)]",
        className
      )}
      {...props}
    />
  );
}
