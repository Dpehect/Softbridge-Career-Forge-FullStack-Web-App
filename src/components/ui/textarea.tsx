import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-[100px] w-full rounded-xl border border-black/8 bg-panel-elevated/80 px-3 py-2 text-sm text-star-white placeholder:text-muted-steel/70 outline-none transition focus:border-cosmic-teal/40 focus:ring-2 focus:ring-cosmic-teal/15",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
