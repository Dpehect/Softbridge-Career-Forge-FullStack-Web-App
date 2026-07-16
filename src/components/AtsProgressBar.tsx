import { cn } from "@/lib/utils";

type AtsProgressBarProps = {
  score: number; // 0–100
  label?: string;
  className?: string;
  showValue?: boolean;
};

function tone(score: number) {
  if (score >= 75) return { bar: "bg-emerald-500", track: "bg-emerald-500/15", text: "text-emerald-600 dark:text-emerald-400" };
  if (score >= 50) return { bar: "bg-amber-400", track: "bg-amber-400/15", text: "text-amber-600 dark:text-amber-400" };
  return { bar: "bg-rose-500", track: "bg-rose-500/15", text: "text-rose-600 dark:text-rose-400" };
}

/**
 * Visual ATS score — filled width tracks the percentage.
 */
export function AtsProgressBar({
  score,
  label = "ATS Skoru",
  className,
  showValue = true,
}: AtsProgressBarProps) {
  const value = Math.min(100, Math.max(0, Math.round(Number.isFinite(score) ? score : 0)));
  const t = tone(value);

  return (
    <div className={cn("w-full space-y-2", className)}>
      <div className="flex items-end justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        {showValue && (
          <p className={cn("text-sm font-extrabold tabular-nums tracking-tighter", t.text)}>
            {value}%
          </p>
        )}
      </div>
      <div className={cn("h-2.5 w-full overflow-hidden rounded-full", t.track)}>
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out", t.bar)}
          style={{ width: `${value}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
        />
      </div>
    </div>
  );
}

export default AtsProgressBar;
