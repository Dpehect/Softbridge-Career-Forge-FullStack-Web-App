"use client";

const QUOTES = [
  {
    name: "Elif K.",
    role: "Frontend Developer",
    text: "ATS skorunun neden 72 kaldığını ilk kez net anladım. Eksik anahtar kelimeleri ekleyince 89’a çıktı.",
  },
  {
    name: "Mert A.",
    role: "Ürün Yöneticisi",
    text: "Deneyim maddelerimi ölçülebilir kanıta çevirmek çok hızlı oldu. Demo profil ilk kullanım için yeterliydi.",
  },
  {
    name: "Zeynep T.",
    role: "Veri Analisti",
    text: "Verilerimin tarayıcıda kalması güven verdi. Uyum skoru sayesinde hangi ilana odaklanacağımı seçtim.",
  },
  {
    name: "Can Y.",
    role: "Full-Stack Engineer",
    text: "Mülakat koçu, CV’mdeki projelere özel STAR iskeleti çıkardı. Hazırlık sürem kısaldı.",
  },
] as const;

export function Testimonials() {
  const [featured, ...rest] = QUOTES;

  return (
    <section className="border-b border-[var(--ld-border)] bg-[var(--ld-surface)] py-16 sm:py-24">
      <div className="landing-shell">
        <div className="max-w-2xl">
          <p className="landing-eyebrow">Güven</p>
          <h2 className="landing-h2 mt-3">İş arayanların tercih ettiği şeffaf çalışma alanı</h2>
          <p className="landing-lede mt-4">
            Abartısız metrikler, yerel gizlilik ve net sonraki adımlar. Aşağıdaki geri
            bildirimler ürün akışını yansıtan örnek kullanımlardır.
          </p>
        </div>

        <figure className="mt-10 rounded-2xl border border-[var(--ld-border)] bg-[var(--ld-mint)] p-6 sm:p-8">
          <blockquote className="text-lg font-semibold leading-relaxed text-[var(--ld-ink)] sm:text-xl">
            “{featured!.text}”
          </blockquote>
          <figcaption className="mt-5 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--ld-teal)] text-sm font-bold text-[var(--ld-offwhite)]">
              {featured!.name.slice(0, 1)}
            </span>
            <div>
              <p className="text-sm font-bold text-[var(--ld-ink)]">{featured!.name}</p>
              <p className="text-xs font-medium text-[var(--ld-ink-2)]">{featured!.role}</p>
            </div>
          </figcaption>
        </figure>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {rest.map((q) => (
            <figure
              key={q.name}
              className="rounded-2xl border border-[var(--ld-border)] bg-[var(--ld-bg)] p-5"
            >
              <blockquote className="text-sm leading-relaxed text-[var(--ld-ink)]">
                “{q.text}”
              </blockquote>
              <figcaption className="mt-4 flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--ld-border)] text-xs font-bold text-[var(--ld-ink)]">
                  {q.name.slice(0, 1)}
                </span>
                <div>
                  <p className="text-xs font-bold text-[var(--ld-ink)]">{q.name}</p>
                  <p className="text-[11px] font-medium text-[var(--ld-ink-2)]">{q.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
