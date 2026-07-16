import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
  {
    variants: {
      variant: {
        default: "border-black/8 bg-black/[0.03] text-muted-steel",
        accent: "border-cosmic-teal/20 bg-cosmic-teal/10 text-cosmic-teal",
        solid: "border-transparent bg-star-white text-midnight-void",
        soft: "border-transparent bg-abyss-panel text-star-white",
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
