"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/forge", label: "CV Oluştur" },
  { href: "/jobs", label: "İşler" },
  { href: "/paths", label: "Araçlar" },
  { href: "/#pricing", label: "Fiyatlandırma" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b bg-white/85 backdrop-blur-xl transition-shadow duration-300",
        scrolled
          ? "border-slate-200/80 shadow-lg shadow-slate-900/5"
          : "border-transparent shadow-none"
      )}
    >
      <div className="mx-auto flex h-[4.25rem] w-[min(100%-1.25rem,75rem)] items-center justify-between gap-4 sm:h-[4.75rem] sm:w-[min(100%-2.5rem,75rem)]">
        <Link href="/" className="group flex shrink-0 items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#0F766E] text-sm font-bold text-white shadow-md shadow-teal-800/20 transition group-hover:bg-[#0D9488]">
            CF
          </span>
          <span className="text-xl font-bold tracking-tight text-[#0F766E]">CareerForge</span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Ana menü">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl px-3.5 py-2.5 text-[0.9375rem] font-semibold text-slate-700 transition-colors hover:bg-teal-50 hover:text-[#0F766E]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 sm:flex">
          <Link
            href="/login"
            className="text-[0.9375rem] font-semibold text-slate-700 transition-colors hover:text-[#0F766E]"
          >
            Giriş Yap
          </Link>
          <Link
            href="/forge"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#FBBF24] px-6 text-[0.9375rem] font-bold text-slate-900 shadow-lg shadow-amber-400/35 transition hover:scale-[1.03] hover:bg-[#F59E0B] hover:shadow-xl active:scale-[0.98]"
          >
            Ücretsiz Başla
          </Link>
        </div>

        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-xl text-slate-800 lg:hidden"
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-white shadow-xl lg:hidden">
          <div className="mx-auto flex w-[min(100%-1.25rem,75rem)] flex-col gap-1 py-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3.5 text-base font-semibold text-slate-800 hover:bg-teal-50"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-4">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3.5 text-center text-base font-semibold text-slate-700"
              >
                Giriş Yap
              </Link>
              <Link
                href="/forge"
                onClick={() => setOpen(false)}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#FBBF24] px-5 text-base font-bold text-slate-900"
              >
                Ücretsiz Başla
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
