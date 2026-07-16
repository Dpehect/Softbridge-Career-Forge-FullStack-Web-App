import { cn } from "@/lib/utils";

export function StatPill({
  label,
  value,
  className,
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div className={cn("glass-panel rounded-2xl px-4 py-3 min-w-[120px]", className)}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-steel">{label}</p>
      <p className="text-2xl font-display font-semibold mt-1 tabular-nums">{value}</p>
    </div>
  );
}
