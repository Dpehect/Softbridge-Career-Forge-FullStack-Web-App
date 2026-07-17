"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "CV Yükle", href: "/forge", match: ["/forge"] },
  { id: 2, label: "Analiz Al", href: "/forge", match: ["/forge"], hash: "feedback" },
  { id: 3, label: "İyileştir", href: "/resume", match: ["/resume", "/jobs", "/dashboard"] },
] as const;

function resolveActive(pathname: string): number {
  if (pathname.startsWith("/resume") || pathname.startsWith("/jobs")) return 3;
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/coach") || pathname.startsWith("/paths"))
    return 3;
  if (pathname.startsWith("/forge")) return 2;
  if (pathname === "/") return 1;
  return 1;
}

/**
 * Global product journey — under header so users never ask "şimdi ne yapmalıyım?"
 */
export function JourneyStepper({ className }: { className?: string }) {
  const pathname = usePathname();
  const active = resolveActive(pathname);

  return (
    <nav
      aria-label="Kariyer yol haritası"
      className={cn("w-full", className)}
    >
      <ol className="max-w-6xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-center gap-2 sm:gap-3">
        {STEPS.map((step, i) => {
          const isActive = active === step.id;
          const isDone = active > step.id;
          return (
            <li key={step.id} className="flex items-center gap-2 sm:gap-3">
              {i > 0 && (
                <span
                  className={cn(
                    "w-4 sm:w-8 h-px rounded-full",
                    isDone || isActive
                      ? "bg-purple-400/80"
                      : "bg-slate-200 dark:bg-white/10"
                  )}
                  aria-hidden
                />
              )}
              <Link
                href={step.href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] sm:text-xs font-semibold tracking-tight transition-colors",
                  isActive && "bg-purple-50 text-purple-800 dark:bg-purple-500/15 dark:text-purple-300",
                  isDone &&
                    !isActive &&
                    "text-purple-800 dark:text-purple-400/90",
                  !isActive &&
                    !isDone &&
                    "text-slate-800 hover:text-purple-700 dark:text-slate-400"
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                    isActive
                      ? "text-white"
                      : isDone
                        ? "bg-purple-200 text-purple-900 dark:bg-purple-500/30 dark:text-purple-200"
                        : "bg-slate-200 text-slate-800 dark:bg-white/10 dark:text-slate-400"
                  )}
                  style={isActive ? { background: "linear-gradient(135deg, #6B21A8, #A855F7)" } : {}}
                >
                  {step.id}
                </span>
                <span className="hidden sm:inline">{step.label}</span>
              </Link>
            </li>
          );

        })}
      </ol>
    </nav>
  );
}

export default JourneyStepper;
