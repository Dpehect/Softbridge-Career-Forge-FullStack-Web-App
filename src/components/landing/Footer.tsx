import Link from "next/link";

const COLS = [
  {
    title: "Araçlar",
    links: [
      { href: "/forge", label: "CV Analizi" },
      { href: "/resume", label: "CV Editörü" },
      { href: "/forge", label: "ATS Kontrolü" },
      { href: "/jobs", label: "İş Takibi" },
      { href: "/coach", label: "Mülakat Koçu" },
    ],
  },
  {
    title: "CV & Kaynaklar",
    links: [
      { href: "/#ornekler", label: "CV Yaklaşımları" },
      { href: "/paths", label: "Kariyer Yol Haritası" },
      { href: "/jobs", label: "İş İlanları" },
      { href: "/#nasil-calisir", label: "Nasıl Çalışır" },
      { href: "/#pricing", label: "Fiyatlandırma" },
    ],
  },
  {
    title: "Şirket",
    links: [
      { href: "/contact", label: "İletişim" },
      { href: "/dashboard", label: "Panel" },
      { href: "/login", label: "Giriş Yap" },
      { href: "/privacy", label: "Gizlilik" },
      { href: "/terms", label: "Kullanım Koşulları" },
    ],
  },
] as const;

export function LandingFooter() {
  return (
    <footer className="rounded-t-[1.75rem] bg-[var(--ld-burgundy)] text-[var(--ld-cream)] sm:rounded-t-[2.25rem]">
      <div className="landing-shell py-14 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-md bg-[var(--ld-cream)] text-xs font-bold text-[var(--ld-burgundy)]">
                CF
              </span>
              <span className="text-lg font-bold text-[var(--ld-cream)]">CareerForge</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#e8d9cc]">
              SoftBridge CareerForge — CV analizi, iş eşleştirme ve mülakat hazırlığını tek
              güvenli çalışma alanında birleştirir.
            </p>
            <p className="mt-4 text-xs font-semibold leading-relaxed text-[#d4c0b0]">
              Standart analiz tarayıcıda çalışır. Orijinal CV dosyanız siz kaydetmeyi
              seçmedikçe sunucuya yüklenmez. İsteğe bağlı hesap senkronu 256-bit TLS ile
              korunur.
            </p>
          </div>

          {COLS.map((col) => (
            <div key={col.title}>
              <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-[#c9a894]">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-[var(--ld-cream)] transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-[#d4c0b0] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} SoftBridge Solutions · CareerForge</p>
          <p>Türkçe öncelikli · şeffaf ATS · yerel analiz</p>
        </div>
      </div>
    </footer>
  );
}
