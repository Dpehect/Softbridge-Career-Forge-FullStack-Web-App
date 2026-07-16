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
      className={cn(
        "w-full border-b border-white/10 bg-white/40 backdrop-blur-sm dark:bg-black/20",
        className
      )}
    >
      <ol className="max-w-6xl mx-auto px-4 md:px-8 py-2.5 flex items-center justify-center gap-1 sm:gap-2">
        {STEPS.map((step, i) => {
          const isActive = active === step.id;
          const isDone = active > step.id;
          return (
            <li key={step.id} className="flex items-center gap-1 sm:gap-2">
              {i > 0 && (
                <span
                  className={cn(
                    "hidden sm:block w-6 md:w-10 h-0.5 rounded-full",
                    isDone || isActive ? "bg-indigo-400" : "bg-slate-200 dark:bg-white/10"
                  )}
                  aria-hidden
                />
              )}
              <Link
                href={step.href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-bold tracking-tight transition-colors",
                  isActive && "bg-indigo-600 text-white shadow-sm",
                  isDone && !isActive && "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
                  !isActive && !isDone && "bg-white/60 text-slate-500 border border-slate-200/80 dark:bg-white/5 dark:border-white/10"
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-extrabold",
                    isActive ? "bg-white/20 text-white" : isDone ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"
                  )}
                >
                  {step.id}
                </span>
                <span className="hidden xs:inline sm:inline">{step.label}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default JourneyStepper;
