import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-[var(--radius-round)] border px-2 py-0.5 text-[0.6875rem] font-semibold leading-5",
  {
    variants: {
      variant: {
        default: "border-line bg-surface-2 text-ink-2",
        accent: "border-brand/25 bg-[var(--accent-wash)] text-brand-strong",
        solid: "border-transparent bg-ink text-background",
        soft: "border-transparent bg-surface-2 text-ink-2",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
