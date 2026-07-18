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
    <section id="ornekler" className="border-b border-[var(--ld-border)] bg-[var(--ld-bg)] py-14 sm:py-20">
      <div className="landing-shell">
        <div className="landing-on-cobalt overflow-hidden rounded-[1.75rem] bg-[var(--ld-cobalt)] px-6 py-12 sm:rounded-[2rem] sm:px-12 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-[clamp(1.85rem,3.2vw,2.85rem)] font-bold leading-tight tracking-tight text-[#FAF5EE] text-balance">
              2026 İçin İşe Kazandıran CV Yaklaşımları
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[#F6F0E8] sm:text-[1.0625rem]">
              Sektöre göre net yapı, ölçülebilir maddeler ve ATS uyumlu format. CareerForge
              editöründe kendi profilinize uyarlayın.
            </p>
            <Link href="/resume" className="landing-cta-primary mt-8 inline-flex">
              CV Editörünü Aç
            </Link>
          </div>

          <ul className="mx-auto mt-12 flex max-w-4xl flex-wrap items-center justify-center gap-2.5">
            {CHIPS.map((chip) => (
              <li key={chip}>
                <Link
                  href="/forge"
                  className="inline-flex min-h-11 items-center rounded-full border border-[rgba(250,245,238,0.5)] bg-[rgba(16,20,24,0.2)] px-3.5 text-sm font-bold text-white transition-colors hover:bg-[rgba(16,20,24,0.32)]"
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
