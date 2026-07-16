import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  size?: "sm" | "md";
};

/** Tiny CSS spinner for button loading states */
export function LoadingSpinner({ className, size = "sm" }: Props) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-current border-t-transparent",
        size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5",
        className
      )}
    />
  );
}

export default LoadingSpinner;
