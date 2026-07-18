"use client";

import Link from "next/link";
import { Shield } from "lucide-react";

const COLS = [
  {
    title: "Ürün",
    links: [
      { href: "/forge", label: "CV Analizi" },
      { href: "/resume", label: "CV Editörü" },
      { href: "/jobs", label: "İş İlanları" },
      { href: "/coach", label: "Mülakat Koçu" },
      { href: "/paths", label: "Yol Haritası" },
    ],
  },
  {
    title: "Şirket",
    links: [
      { href: "/contact", label: "İletişim" },
      { href: "/#pricing", label: "Fiyatlandırma" },
      { href: "/dashboard", label: "Panel" },
    ],
  },
  {
    title: "Yasal",
    links: [
      { href: "/privacy", label: "Gizlilik Politikası" },
      { href: "/terms", label: "Kullanım Koşulları" },
      { href: "/login", label: "Giriş Yap" },
    ],
  },
] as const;

export function LandingFooter() {
  return (
    <footer className="border-t border-teal-900/10 bg-slate-900 text-slate-300">
      <div className="mx-auto w-[min(100%-1.5rem,72rem)] py-14 sm:w-[min(100%-2rem,72rem)]">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-500 text-sm font-bold text-white">
                CF
              </span>
              <span className="text-lg font-bold text-white">CareerForge</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              CV analizi, iş eşleştirme ve mülakat hazırlığını tek güvenli çalışma alanında
              birleştiren SoftBridge ürünü.
            </p>
            <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-teal-500/15 px-3 py-1.5 text-xs font-semibold text-teal-200">
              <Shield className="h-3.5 w-3.5" />
              Private &amp; Local · 256-bit TLS senkron (isteğe bağlı)
            </p>
          </div>

          {COLS.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-slate-300 transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} SoftBridge Solutions · CareerForge</p>
          <p>Türkçe öncelikli · şeffaf ATS · yerel analiz</p>
        </div>
      </div>
    </footer>
  );
}
