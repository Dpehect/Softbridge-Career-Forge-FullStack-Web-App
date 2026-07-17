import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-10 w-full rounded-[var(--radius-control)] border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-3 outline-none transition-[border-color,box-shadow,background-color] duration-200 hover:border-line-strong focus:border-brand focus:shadow-[var(--focus-ring)] disabled:cursor-not-allowed disabled:bg-surface-2 disabled:opacity-60",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
