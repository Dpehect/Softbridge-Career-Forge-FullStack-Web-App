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
    <footer className="border-t border-white/5 bg-[#0B1220] text-slate-300">
      <div className="mx-auto w-[min(100%-1.25rem,75rem)] py-16 sm:w-[min(100%-2.5rem,75rem)] sm:py-20">
        <div className="grid gap-12 md:grid-cols-[1.35fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#14B8A6] text-sm font-bold text-white">
                CF
              </span>
              <span className="text-xl font-bold text-white">CareerForge</span>
            </Link>
            <p className="mt-5 max-w-sm text-[0.975rem] leading-relaxed text-slate-400">
              CV analizi, iş eşleştirme ve mülakat hazırlığını tek güvenli çalışma alanında
              birleştiren SoftBridge ürünü.
            </p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-teal-500/15 px-3.5 py-2 text-xs font-semibold text-teal-200">
              <Shield className="h-3.5 w-3.5" />
              Private &amp; Local · isteğe bağlı 256-bit TLS senkron
            </p>
          </div>

          {COLS.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                {col.title}
              </p>
              <ul className="mt-5 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[0.975rem] font-medium text-slate-300 transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} SoftBridge Solutions · CareerForge</p>
          <p>Türkçe öncelikli · şeffaf ATS · yerel analiz</p>
        </div>
      </div>
    </footer>
  );
}
