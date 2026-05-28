import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "outline" | "ghost";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "interactive-press inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition duration-200 disabled:pointer-events-none disabled:opacity-75 disabled:saturate-75",
        variant === "default" &&
          "bg-[var(--solid-bg)] text-[var(--solid-fg)] shadow-[0_16px_34px_var(--shadow-soft)] hover:-translate-y-1 hover:opacity-95 disabled:bg-[var(--solid-bg-muted)] disabled:text-[var(--solid-fg)]",
        variant === "secondary" &&
          "bg-[var(--brand-soft)] text-[var(--ink-900)] shadow-[0_16px_34px_var(--shadow-soft)] hover:-translate-y-1 hover:opacity-95 disabled:bg-[var(--brand-soft)] disabled:text-[var(--ink-900)]",
        variant === "outline" &&
          "border border-[var(--line)] bg-[var(--surface)]/88 text-[var(--ink-900)] hover:-translate-y-1 hover:bg-[var(--surface-2)] disabled:text-[var(--ink-700)]",
        variant === "ghost" && "hover:bg-[var(--surface-2)]",
        className
      )}
      {...props}
    />
  )
);

Button.displayName = "Button";
