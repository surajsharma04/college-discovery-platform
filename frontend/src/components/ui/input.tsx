import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)]/92 px-3.5 py-2.5 text-sm text-[var(--ink-900)] shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] placeholder:text-[var(--ink-600)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35",
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";
