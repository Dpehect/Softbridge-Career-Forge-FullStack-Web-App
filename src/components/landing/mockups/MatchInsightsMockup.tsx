"use client";

export function MatchInsightsMockup() {
  return (
    <div className="landing-mock-strong overflow-hidden p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ld-ink-2)]">
            Rol eşleştirme
          </p>
          <p className="mt-1 text-base font-bold text-[var(--ld-ink)]">Senior Frontend Engineer</p>
        </div>
        <span className="rounded-full bg-[var(--ld-mint)] px-3 py-1 text-sm font-bold text-[var(--ld-teal-deep)]">
          %92
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--ld-border)] bg-[var(--ld-bg)] p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--ld-teal)]">
            Güçlü sinyaller
          </p>
          <ul className="mt-2 space-y-1.5 text-xs font-semibold text-[var(--ld-ink)]">
            {["React", "TypeScript", "Design systems"].map((s) => (
              <li key={s} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--ld-teal)]" />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-[var(--ld-border)] bg-[var(--ld-bg)] p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#9a5b12]">
            Eksik sinyaller
          </p>
          <ul className="mt-2 space-y-1.5 text-xs font-semibold text-[var(--ld-ink)]">
            {["GraphQL", "A/B testing"].map((s) => (
              <li key={s} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#e0a04a]" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-[var(--ld-border)] p-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--ld-ink-2)]">
          Sonraki adım
        </p>
        <p className="mt-1 text-sm font-semibold text-[var(--ld-ink)]">
          GraphQL projesini ölçülebilir bir madde olarak CV’ye ekleyin
        </p>
        <div className="mt-3 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--ld-border)]">
            <div className="h-full w-[70%] rounded-full bg-[var(--ld-amber)]" />
          </div>
          <span className="text-[10px] font-bold text-[var(--ld-ink-2)]">Mülakat hazırlığı %70</span>
        </div>
      </div>
    </div>
  );
}
