import { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
      "min-h-[120px] w-full rounded-xl border border-[var(--line)] bg-[var(--surface)]/92 px-3.5 py-3 text-sm text-[var(--ink-900)] shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] placeholder:text-[var(--ink-600)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/40",
        className
      )}
      {...props}
  />
));

Textarea.displayName = "Textarea";
