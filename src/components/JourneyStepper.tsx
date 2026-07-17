"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Profil", meta: "CV", href: "/resume", paths: ["/", "/resume"] },
  { label: "Kanıt", meta: "Analiz", href: "/forge", paths: ["/forge", "/coach"] },
  { label: "Fırsat", meta: "İşler", href: "/jobs", paths: ["/jobs", "/paths", "/dashboard"] },
] as const;

export function JourneyStepper({ className }: { className?: string }) {
  const pathname = usePathname();
  const currentIndex = Math.max(
    0,
    STEPS.findIndex((step) => step.paths.some((path) => pathname === path || pathname.startsWith(`${path}/`)))
  );

  return (
    <nav className={cn("h-10", className)} aria-label="Kariyer akışı">
      <ol className="mx-auto flex h-full w-[min(100%-2rem,80rem)] items-center justify-center gap-0">
        {STEPS.map((step, index) => {
          const active = index === currentIndex;
          const completed = index < currentIndex;
          return (
            <li key={step.label} className="flex items-center">
              {index > 0 && <span className={cn("mx-3 h-px w-8", index <= currentIndex ? "bg-brand" : "bg-line")} />}
              <Link
                href={step.href}
                className={cn(
                  "flex items-center gap-2 text-[0.6875rem] font-medium transition-colors",
                  active ? "text-ink" : completed ? "text-brand-strong" : "text-ink-3 hover:text-ink"
                )}
                aria-current={active ? "step" : undefined}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", active || completed ? "bg-brand" : "bg-line-strong")} />
                <span>{step.label}</span>
                <span className="font-mono text-[0.625rem] text-ink-3">{step.meta}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default JourneyStepper;
