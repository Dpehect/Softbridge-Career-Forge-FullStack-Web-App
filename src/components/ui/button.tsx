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
          "border border-slate-300 bg-transparent text-slate-800 hover:bg-slate-50 hover:border-slate-400 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-white/5 dark:hover:border-slate-600",
        ghost: "bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white",
        ghostBorder:
          "border border-slate-300 bg-transparent text-slate-800 hover:bg-slate-50 hover:border-slate-400 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-white/5 dark:hover:border-slate-600",
        soft: "bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
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
