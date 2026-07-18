"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { id: "ats", label: "CV Analizi", href: "/forge", blurb: "Şeffaf ATS skoru ve aksiyon listesi." },
  { id: "track", label: "İş Takibi", href: "/jobs", blurb: "Başvuru aşamalarını tek panelde yönetin." },
  { id: "jobs", label: "İş İlanları", href: "/jobs", blurb: "Uyum skoruna göre roller bulun." },
  { id: "saved", label: "Kaydedilenler", href: "/dashboard", blurb: "Kaydettiğiniz ilanlar ve ilerlemeniz." },
] as const;

export function ProductSwitcher() {
  const [active, setActive] = useState<(typeof ITEMS)[number]["id"]>("ats");
  const current = ITEMS.find((i) => i.id === active)!;

  return (
    <section className="border-b border-[var(--ld-border)] bg-[var(--ld-surface)] py-10">
      <div className="landing-shell">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div
            role="tablist"
            aria-label="Ürün geçişi"
            className="flex max-w-full gap-1 overflow-x-auto rounded-xl border border-[var(--ld-border)] bg-[var(--ld-bg)] p-1"
          >
            {ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active === item.id}
                className={cn(
                  "shrink-0 rounded-lg px-3 py-2 text-xs font-bold transition sm:text-sm",
                  active === item.id
                    ? "bg-[var(--ld-ink)] text-[var(--ld-offwhite)]"
                    : "text-[var(--ld-ink-2)] hover:bg-black/5 hover:text-[var(--ld-ink)]"
                )}
                onClick={() => setActive(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-medium text-[var(--ld-ink-2)]">{current.blurb}</p>
            <Link href={current.href} className="landing-cta-primary !min-h-9 !px-3.5 !text-xs">
              Aç
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
