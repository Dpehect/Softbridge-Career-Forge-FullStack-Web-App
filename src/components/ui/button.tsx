import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cosmic-teal/40 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-star-white text-midnight-void shadow-[0_8px_24px_rgba(92,46,31,0.12)] hover:bg-cosmic-teal hover:text-midnight-void",
        accent:
          "bg-cosmic-teal text-midnight-void shadow-[0_8px_24px_rgba(232,93,59,0.25)] hover:bg-sunset-coral",
        primary:
          "bg-gradient-to-r from-[#6B21A8] to-[#A855F7] text-white shadow-lg hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 rounded-xl",
        outline:
          "border border-black/10 bg-transparent text-star-white hover:border-cosmic-teal/40 hover:text-cosmic-teal",
        ghost: "bg-transparent text-muted-steel hover:bg-black/[0.04] hover:text-star-white",
        ghostBorder:
          "border-2 border-slate-200 bg-transparent text-slate-700 hover:bg-slate-50 dark:border-slate-500 dark:text-slate-200 dark:hover:bg-white/5",
        soft: "bg-abyss-panel text-star-white hover:bg-black/[0.06]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-2xl px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  )
);
Button.displayName = "Button";

export { buttonVariants };
