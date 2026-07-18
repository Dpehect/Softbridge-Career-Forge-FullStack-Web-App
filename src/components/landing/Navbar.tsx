"use client";

import { useState } from "react";
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

  return (
    <header className="sticky top-0 z-50 border-b border-teal-900/5 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-[min(100%-1.5rem,72rem)] items-center justify-between gap-4 sm:h-[4.25rem] sm:w-[min(100%-2rem,72rem)]">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-700 text-sm font-bold text-white shadow-sm shadow-teal-700/25">
            CF
          </span>
          <span className="text-lg font-bold tracking-tight text-teal-800">CareerForge</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Ana menü">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-teal-50 hover:text-teal-800"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-700 transition-colors hover:text-teal-800"
          >
            Giriş Yap
          </Link>
          <Link
            href="/forge"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-amber-400 px-5 text-sm font-bold text-slate-900 shadow-md shadow-amber-400/30 transition hover:bg-amber-300 hover:shadow-lg hover:shadow-amber-400/40 active:scale-[0.98]"
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

      <div
        className={cn(
          "border-t border-slate-100 bg-white lg:hidden",
          open ? "block" : "hidden"
        )}
      >
        <div className="mx-auto flex w-[min(100%-1.5rem,72rem)] flex-col gap-1 py-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-800 hover:bg-teal-50"
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-2 border-t border-slate-100 pt-3">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-center text-sm font-semibold text-slate-700"
            >
              Giriş Yap
            </Link>
            <Link
              href="/forge"
              onClick={() => setOpen(false)}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-amber-400 px-5 text-sm font-bold text-slate-900"
            >
              Ücretsiz Başla
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
