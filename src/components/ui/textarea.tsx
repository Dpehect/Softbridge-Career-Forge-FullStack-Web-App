import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-28 w-full resize-y rounded-[var(--radius-control)] border border-line bg-surface px-3 py-2.5 text-sm leading-6 text-ink placeholder:text-ink-3 outline-none transition-[border-color,box-shadow,background-color] duration-200 hover:border-line-strong focus:border-brand focus:shadow-[var(--focus-ring)] disabled:cursor-not-allowed disabled:bg-surface-2 disabled:opacity-60",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
