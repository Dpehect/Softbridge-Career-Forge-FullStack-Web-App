const PRINCIPLES = [
  {
    number: "01",
    title: "İki puan, iki ayrı soru",
    body: "Genel ATS puanı belgenin yapısını ve kanıt kalitesini; rol uyumu ise yalnızca eklediğiniz ilanla örtüşmeyi ölçer.",
  },
  {
    number: "02",
    title: "Bilinmeyen veri puan kazandırmaz",
    body: "İlanda deneyim yılı, çalışma modeli veya dil şartı yoksa sistem bunları tam uyum kabul etmez; güven seviyesini düşürür.",
  },
  {
    number: "03",
    title: "Skor karar değil, açıklanabilir tahmin",
    body: "Her puan kategori dökümü, eksik girdiler ve düzeltme önerileriyle gösterilir. Son işe alım kararını temsil etmez.",
  },
] as const;

export function ScoreMethodology() {
  return (
    <section className="border-b border-[var(--ld-border)] bg-[var(--ld-surface)] py-16 sm:py-24">
      <div className="landing-shell">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-14">
          <div>
            <p className="landing-eyebrow">Skor metodolojisi</p>
            <h2 className="landing-h2 mt-3">Rakam gösteriyorsak, sınırını da gösteririz</h2>
            <p className="landing-lede mt-4">
              CareerForge işe alınma olasılığı vaat etmez. Amacı, CV&apos;nizdeki gözlenebilir
              sinyalleri tutarlı bir rubrikle görünür kılmaktır.
            </p>
          </div>

          <ol className="border-t border-[var(--ld-border)]">
            {PRINCIPLES.map((principle) => (
              <li
                key={principle.number}
                className="grid gap-3 border-b border-[var(--ld-border)] py-6 sm:grid-cols-[3rem_0.8fr_1.2fr] sm:items-start"
              >
                <span className="font-mono text-sm font-bold text-[var(--ld-teal)]">{principle.number}</span>
                <h3 className="text-base font-extrabold leading-snug text-[var(--ld-ink)]">{principle.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--ld-ink-2)]">{principle.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
