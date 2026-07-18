"use client";

const ROWS = [
  { company: "Harbor Labs", role: "Frontend Engineer", stage: "Mülakat", tone: "bg-[#e7f0ff] text-[#2927a8]" },
  { company: "Nimbus", role: "Product Engineer", stage: "Başvuruldu", tone: "bg-[#e7f5f2] text-[#004f49]" },
  { company: "Atlas Co", role: "Full-Stack", stage: "Teklif", tone: "bg-[#fff4d6] text-[#7a5a00]" },
  { company: "Northwind", role: "UI Engineer", stage: "Kaydedildi", tone: "bg-[#f1efe9] text-[#4a525a]" },
] as const;

export function JobTrackerMockup() {
  return (
    <div className="landing-mock-strong overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--ld-border)] px-4 py-3">
        <p className="text-sm font-bold text-[var(--ld-ink)]">İş Takibi</p>
        <div className="flex gap-1.5">
          {["Kaydedildi", "Başvuruldu", "Mülakat", "Teklif"].map((s) => (
            <span
              key={s}
              className="hidden rounded-full border border-[var(--ld-border)] px-2.5 py-1 text-xs font-semibold text-[var(--ld-ink-2)] sm:inline"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
      <div className="divide-y divide-[var(--ld-border)]">
        {ROWS.map((row) => (
          <div
            key={row.company}
            className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 sm:grid-cols-[1.1fr_1.2fr_auto]"
          >
            <div>
              <p className="text-sm font-bold text-[var(--ld-ink)]">{row.company}</p>
              <p className="text-xs text-[var(--ld-ink-2)] sm:hidden">{row.role}</p>
            </div>
            <p className="hidden text-sm text-[var(--ld-ink-2)] sm:block">{row.role}</p>
            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${row.tone}`}>
              {row.stage}
            </span>
          </div>
        ))}
      </div>
      <div className="border-t border-[var(--ld-border)] bg-[var(--ld-bg)] px-4 py-3">
        <div className="flex items-center justify-between text-xs font-semibold text-[var(--ld-ink-2)]">
          <span>Bu hafta ilerleme</span>
          <span className="text-[var(--ld-ink)]">3 / 5 başvuru</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--ld-border)]">
          <div className="h-full w-3/5 rounded-full bg-[var(--ld-cobalt)]" />
        </div>
      </div>
    </div>
  );
}
