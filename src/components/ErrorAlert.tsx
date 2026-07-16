import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ErrorAlertProps = {
  title?: string;
  message: string;
  className?: string;
  onDismiss?: () => void;
};

/**
 * Recoverable error surface — feels fixable, not "app crashed".
 */
export function ErrorAlert({
  title = "Bir şey ters gitti — düzeltilebilir",
  message,
  className,
  onDismiss,
}: ErrorAlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 border-l-4 border-red-500 bg-red-50 p-4 text-red-700",
        "dark:border-red-400 dark:bg-red-500/10 dark:text-red-300",
        className
      )}
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold tracking-tight">{title}</p>
        <p className="mt-1 text-sm leading-relaxed opacity-90">{message}</p>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-lg p-1 opacity-70 transition hover:bg-red-100 hover:opacity-100 dark:hover:bg-red-500/20"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default ErrorAlert;
