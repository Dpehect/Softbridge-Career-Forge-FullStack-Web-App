import Link from "next/link";

const CHIPS = [
  "Yazılım Geliştirme",
  "Veri Analizi",
  "Ürün Yönetimi",
  "Tasarım",
  "Pazarlama",
  "Finans",
  "İnsan Kaynakları",
  "Mühendislik",
  "Operasyon",
  "Eğitim",
  "Satış",
  "Müşteri Deneyimi",
] as const;

export function ResumeExamples() {
  return (
    <section id="ornekler" className="border-b border-[var(--ld-border)] bg-[var(--ld-bg)] py-16 sm:py-24">
      <div className="landing-shell">
        <div className="overflow-hidden rounded-[1.75rem] bg-[var(--ld-cobalt)] px-6 py-12 text-[var(--ld-offwhite)] sm:rounded-[2rem] sm:px-12 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-[clamp(1.75rem,3.2vw,2.75rem)] font-bold leading-tight tracking-tight text-balance">
              2026 İçin İşe Kazandıran CV Yaklaşımları
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[#dce0ff]">
              Sektöre göre net yapı, ölçülebilir maddeler ve ATS uyumlu format. CareerForge
              editöründe kendi profilinize uyarlayın.
            </p>
            <Link
              href="/resume"
              className="landing-cta-primary mt-8 inline-flex"
            >
              CV Editörünü Aç
            </Link>
          </div>

          <ul className="mx-auto mt-12 flex max-w-4xl flex-wrap items-center justify-center gap-2.5">
            {CHIPS.map((chip) => (
              <li key={chip}>
                <Link
                  href="/forge"
                  className="inline-flex min-h-10 items-center rounded-full border border-white/20 bg-white/10 px-3.5 text-xs font-bold text-[var(--ld-offwhite)] transition hover:bg-white/20"
                >
                  {chip}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
