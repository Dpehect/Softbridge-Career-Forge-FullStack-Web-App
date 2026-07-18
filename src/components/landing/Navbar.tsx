"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const PRIMARY = [
  { href: "/forge", label: "CV Oluştur" },
  { href: "/jobs", label: "İş Takibi" },
  { href: "/#pricing", label: "Fiyatlandırma" },
] as const;

const TOOLS = [
  { href: "/forge", label: "CV Analizi" },
  { href: "/resume", label: "CV Editörü" },
  { href: "/coach", label: "Mülakat Koçu" },
  { href: "/paths", label: "Kariyer Yol Haritası" },
] as const;

const RESOURCES = [
  { href: "/#ornekler", label: "CV Örnekleri" },
  { href: "/#nasil-calisir", label: "Nasıl Çalışır" },
  { href: "/privacy", label: "Gizlilik" },
  { href: "/contact", label: "İletişim" },
] as const;

function Dropdown({
  label,
  items,
}: {
  label: string;
  items: readonly { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="inline-flex min-h-9 items-center gap-1 rounded-md px-2.5 text-[0.8125rem] font-semibold text-[var(--ld-ink)] hover:bg-black/5"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
      >
        {label}
        <ChevronDown className={cn("h-3.5 w-3.5 transition", open && "rotate-180")} />
      </button>
      {open && (
        <div
          id={id}
          role="menu"
          className="absolute left-0 top-full z-50 mt-1 min-w-[12rem] rounded-xl border border-[var(--ld-border)] bg-[var(--ld-surface)] p-1.5 shadow-lg"
        >
          {items.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              role="menuitem"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-[var(--ld-ink)] hover:bg-black/5"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // mobile menu closes on route via link onClick

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b bg-[var(--ld-surface)]/95 backdrop-blur-sm transition-shadow",
        scrolled
          ? "border-[var(--ld-border)] shadow-[0_4px_16px_rgba(16,20,24,0.06)]"
          : "border-[var(--ld-border)]"
      )}
    >
      <div className="landing-shell flex h-14 items-center justify-between gap-3 sm:h-[3.75rem]">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-[var(--ld-teal)] text-[0.65rem] font-bold text-[var(--ld-offwhite)]">
            CF
          </span>
          <span className="text-[0.95rem] font-bold tracking-tight text-[var(--ld-ink)]">
            CareerForge
          </span>
        </Link>

        <nav
          className="hidden items-center gap-0.5 lg:flex"
          aria-label="Ana menü"
        >
          {PRIMARY.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-2.5 py-1.5 text-[0.8125rem] font-semibold text-[var(--ld-ink)] hover:bg-black/5"
            >
              {item.label}
            </Link>
          ))}
          <Dropdown label="Araçlar" items={TOOLS} />
          <Dropdown label="Kaynaklar" items={RESOURCES} />
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          <Link href="/login" className="landing-cta-secondary !min-h-9 !px-3.5 !text-[0.8125rem]">
            Giriş Yap
          </Link>
          <Link href="/forge" className="landing-cta-primary !min-h-9 !px-4 !text-[0.8125rem]">
            Ücretsiz Başla
          </Link>
        </div>

        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-lg text-[var(--ld-ink)] lg:hidden"
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-[var(--ld-border)] bg-[var(--ld-surface)] lg:hidden">
          <div className="landing-shell flex flex-col gap-1 py-3">
            {[...PRIMARY, ...TOOLS, ...RESOURCES].map((item) => (
              <Link
                key={item.href + item.label}
                href={item.href}
                className="rounded-lg px-3 py-3 text-sm font-semibold text-[var(--ld-ink)] hover:bg-black/5"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-[var(--ld-border)] pt-3">
              <Link href="/login" className="landing-cta-secondary w-full" onClick={() => setOpen(false)}>
                Giriş Yap
              </Link>
              <Link href="/forge" className="landing-cta-primary w-full" onClick={() => setOpen(false)}>
                Ücretsiz Başla
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
