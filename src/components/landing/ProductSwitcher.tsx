"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

const ITEMS = [
  {
    id: "ats",
    label: "CV Analizi",
    href: "/forge",
    blurb: "Şeffaf ATS skoru, kategori dökümü ve aksiyon listesi.",
    cta: "CV Analizini Aç",
  },
  {
    id: "track",
    label: "İş Takibi",
    href: "/jobs",
    blurb: "Başvuru aşamalarını tek panelde yönetin.",
    cta: "İş Takibini Aç",
  },
  {
    id: "jobs",
    label: "İş İlanları",
    href: "/jobs",
    blurb: "Uyum skoruna göre roller bulun.",
    cta: "Uygun Rolleri Gör",
  },
  {
    id: "saved",
    label: "Kaydedilenler",
    href: "/dashboard",
    blurb: "Kaydettiğiniz ilanlar ve ilerlemeniz.",
    cta: "Kaydedilenleri Gör",
  },
] as const;

export function ProductSwitcher() {
  const [active, setActive] = useState<(typeof ITEMS)[number]["id"]>("ats");
  const current = ITEMS.find((i) => i.id === active)!;

  return (
    <section className="border-b border-[var(--ld-border)] bg-[var(--ld-surface)] py-8 sm:py-10">
      <div className="landing-shell">
        <div className="flex flex-col gap-5 rounded-2xl border border-[var(--ld-border)] bg-[var(--ld-bg)] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div
            role="tablist"
            aria-label="Ürün geçişi"
            className="flex max-w-full gap-1 overflow-x-auto pb-1"
          >
            {ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active === item.id}
                className={cn(
                  "shrink-0 rounded-xl px-3.5 py-2.5 text-sm font-bold transition min-h-11",
                  active === item.id
                    ? "bg-[var(--ld-ink)] text-[var(--ld-offwhite)] shadow-sm"
                    : "text-[var(--ld-ink-2)] hover:bg-black/5 hover:text-[var(--ld-ink)]"
                )}
                onClick={() => setActive(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-3 sm:max-w-md sm:items-end sm:text-right">
            <p className="text-base font-semibold text-[var(--ld-ink)]">{current.blurb}</p>
            <Link
              href={current.href}
              className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-[var(--ld-teal)] px-4 text-sm font-bold text-[var(--ld-teal)] transition hover:bg-[var(--ld-mint)]"
            >
              {current.cta}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
