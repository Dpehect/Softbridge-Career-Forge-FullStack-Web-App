import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "btn-micro inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-control)] text-sm font-semibold transition-[background-color,color,border-color,transform,box-shadow] duration-200 focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)] disabled:pointer-events-none disabled:opacity-45 cursor-pointer",
  {
    variants: {
      variant: {
        default: "border border-line-strong bg-surface text-ink hover:bg-surface-2 hover:shadow-sm",
        accent: "border border-transparent bg-signal text-[var(--action-primary-ink)] hover:brightness-95 hover:shadow-md",
        primary:
          "border border-transparent bg-brand text-[var(--action-primary-ink)] shadow-sm hover:bg-brand-strong hover:shadow-md hover:shadow-brand/20",
        outline: "border border-line-strong bg-transparent text-ink hover:bg-surface-2 hover:border-brand/40",
        ghost: "border border-transparent bg-transparent text-ink-2 hover:bg-surface-2 hover:text-ink",
        ghostBorder: "border border-line bg-transparent text-ink-2 hover:border-line-strong hover:bg-surface-2 hover:text-ink",
        soft: "border border-transparent bg-surface-2 text-ink hover:bg-surface-3",
      },
      size: {
        default: "h-11 px-4",
        sm: "min-h-11 px-3 text-xs",
        lg: "h-12 px-5 text-base",
        icon: "h-11 w-11 p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
  )
);
Button.displayName = "Button";

export { buttonVariants };
