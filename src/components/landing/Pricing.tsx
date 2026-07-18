import Link from "next/link";
import { Check } from "lucide-react";

const FREE = [
  "Sınırsız yerel ATS analizi",
  "CV editörü ve A4 önizleme",
  "Demo iş ilanları ve uyum skoru",
  "Temel mülakat soruları",
  "Tarayıcıda kalıcı veri",
] as const;

const PRO = [
  "Free planın tümü",
  "Hesap ile bulut senkronizasyonu",
  "Gelişmiş STAR koç akışları",
  "Sürüm geçmişi ve yedekler",
  "Çoklu cihaz çalışma alanı",
] as const;

export function Pricing() {
  return (
    <section id="pricing" className="border-b border-[var(--ld-border)] bg-[var(--ld-bg)] py-14 sm:py-20">
      <div className="landing-shell">
        <div className="mx-auto max-w-2xl text-center">
          <p className="landing-eyebrow">Fiyatlandırma</p>
          <h2 className="landing-h2 mt-3">Hangi plan size uygun?</h2>
          <p className="landing-lede mx-auto mt-4 text-center">
            Yerel analiz her zaman ücretsiz. Pro; senkron ve gelişmiş koçluk için erken
            erişim aşamasındadır.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl overflow-hidden rounded-2xl border border-[var(--ld-border)] lg:grid-cols-2">
          <div className="flex flex-col bg-[var(--ld-surface)] p-8 sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--ld-ink-2)]">
              CareerForge Free
            </p>
            <p className="mt-3 text-4xl font-bold tracking-tight text-[var(--ld-ink)]">
              ₺0
              <span className="text-base font-semibold text-[var(--ld-ink-2)]"> / sonsuza dek</span>
            </p>
            <p className="mt-3 text-base text-[var(--ld-ink-2)]">
              Bireysel iş arayanlar için tam yerel çalışma alanı.
            </p>
            <ul className="mt-8 flex-1 space-y-3.5">
              {FREE.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-base font-medium text-[var(--ld-ink)]">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-[var(--ld-teal)]" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/forge" className="landing-cta-secondary mt-10 w-full">
              Ücretsiz başla
            </Link>
          </div>

          <div className="landing-on-teal flex flex-col bg-[var(--ld-teal-deep)] p-8 sm:p-10">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#A9DDD7]">
                CareerForge Pro
              </p>
              <span className="rounded-full bg-[var(--ld-amber)] px-2.5 py-1 text-xs font-extrabold text-[#101418]">
                Yakında
              </span>
            </div>
            <p className="mt-3 text-4xl font-bold tracking-tight text-[#F6F0E8]">
              Erken erişim
            </p>
            <p className="mt-3 text-base text-[#CFE8E4]">
              Fiyat henüz yayınlanmadı. Hesap bağlayarak senkronu kullanın.
            </p>
            <ul className="mt-8 flex-1 space-y-3.5">
              {PRO.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-base font-medium text-[#F1E9DF]">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-[var(--ld-amber)]" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/login" className="landing-cta-primary mt-10 w-full">
              Hesap oluştur / Giriş yap
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
