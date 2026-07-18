"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, CircleDot, FileSearch, Sparkles } from "lucide-react";
import { useReducedMotionPreference } from "@/motion/useReducedMotionPreference";

const STAGES = [
  "Belge yapısı okunuyor",
  "Deneyim kanıtı inceleniyor",
  "Öncelikli iyileştirme bulundu",
  "Örnek düzenleme uygulandı",
] as const;

export function AtsWorkspaceMockup() {
  const reduced = useReducedMotionPreference();
  const [stage, setStage] = useState(reduced ? 3 : 0);

  useEffect(() => {
    if (reduced) return;
    const timers = [
      window.setTimeout(() => setStage(1), 650),
      window.setTimeout(() => setStage(2), 1450),
      window.setTimeout(() => setStage(3), 2350),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [reduced]);

  const visibleStage = reduced ? 3 : stage;
  const improved = visibleStage === 3;
  const score = improved ? 68 : 64;

  return (
    <div className="relative mx-auto w-full max-w-3xl">
      <div className="landing-mock-strong overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--ld-border)] bg-[var(--ld-bg)] px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#c94f4f]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#b7791f]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#2f855a]" />
            <span className="ml-1 truncate text-[0.8125rem] font-semibold text-[var(--ld-ink-2)]">
              CareerForge · CV Çalışma Alanı
            </span>
          </div>
          <span className="shrink-0 rounded-full border border-[var(--ld-border)] bg-[var(--ld-surface)] px-2.5 py-1 text-[0.6875rem] font-bold text-[var(--ld-ink)]">
            Örnek senaryo
          </span>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-[0.92fr_1.08fr] sm:p-5">
          <div className="relative overflow-hidden rounded-xl border border-[var(--ld-border)] bg-[var(--ld-bg)] p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[0.8125rem] font-bold uppercase tracking-[0.1em] text-[var(--ld-ink-2)]">
                Özgeçmiş önizleme
              </p>
              <FileSearch className="h-4 w-4 text-[var(--ld-teal-deep)]" aria-hidden />
            </div>
            <p className="mt-3 text-base font-bold text-[var(--ld-ink)]">Ayşe Demir</p>
            <p className="mt-0.5 text-sm font-semibold text-[var(--ld-teal-deep)]">Senior Frontend Engineer</p>
            <div className="mt-3 space-y-2" aria-hidden>
              <div className="h-2 w-full rounded bg-[var(--ld-border)]" />
              <div className="h-2 w-5/6 rounded bg-[var(--ld-border)]" />
              <div className="h-2 w-4/5 rounded bg-[var(--ld-border)]" />
            </div>
            <div className="mt-4 rounded-lg border border-[var(--ld-border)] bg-[var(--ld-surface)] p-3">
              <p className="text-[0.8125rem] font-bold text-[var(--ld-ink-2)]">Son deneyim</p>
              <p className="mt-1 text-sm leading-5 text-[var(--ld-ink)]">
                {improved
                  ? "3 hedefli A/B testiyle checkout dönüşümünü %18 artırdım."
                  : "Satış projelerinde çalıştım ve ekibi yönettim."}
              </p>
              {visibleStage >= 2 && !improved && (
                <div className="mt-2 border-l-2 border-[#9a6700] bg-[#fff8e6] px-2.5 py-2 text-[0.75rem] font-semibold leading-5 text-[#5f3f00]">
                  Ölçek ve doğrulanabilir sonuç eksik.
                </div>
              )}
            </div>
            {!reduced && stage < 2 && (
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-x-4 h-px bg-[var(--ld-teal)]"
                initial={{ top: "24%" }}
                animate={{ top: "82%" }}
                transition={{ duration: 1.35, ease: "linear" }}
              />
            )}
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border border-[var(--ld-border)] bg-[var(--ld-surface)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.8125rem] font-bold uppercase tracking-[0.08em] text-[var(--ld-teal-deep)]">
                    Tahmini CV hazırlık skoru
                  </p>
                  <div className="mt-2 flex items-end gap-1.5" aria-live="polite">
                    <span className="text-4xl font-bold tracking-tight text-[var(--ld-ink)]">{score}</span>
                    <span className="pb-1 text-sm font-semibold text-[var(--ld-ink-2)]">/100</span>
                  </div>
                </div>
                <div className="text-right text-[0.6875rem] font-semibold leading-5 text-[var(--ld-ink-2)]">
                  <p>Güven: Orta</p>
                  <p>Aralık: {improved ? "64–72" : "60–68"}</p>
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--ld-border)]">
                <motion.div
                  className="h-full rounded-full bg-[var(--ld-teal-deep)]"
                  initial={false}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: reduced ? 0 : 0.35, ease: [0.2, 0.8, 0.2, 1] }}
                />
              </div>
              <p className="mt-3 text-[0.75rem] leading-5 text-[var(--ld-ink-2)]">
                Belge yapısı, rol yakınlığı ve doğrulanabilir deneyim kanıtına dayalı tahmindir. İşveren ATS sistemleri farklı çalışabilir.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                ["Yapı", "10/15"],
                ["Rol kapsamı", "12/20"],
                ["Kanıt", improved ? "15/20" : "11/20"],
                ["Yazım", "8/10"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-[var(--ld-border)] bg-[var(--ld-bg)] px-3 py-2.5">
                  <p className="text-[0.75rem] font-semibold text-[var(--ld-ink-2)]">{label}</p>
                  <p className="mt-0.5 text-sm font-bold text-[var(--ld-ink)]">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--ld-border)] bg-[var(--ld-bg)] px-4 py-3">
          <div className="flex items-center gap-2 text-[0.75rem] font-semibold text-[var(--ld-ink-2)]" role="status" aria-live="polite">
            {improved ? <Check className="h-4 w-4 text-[var(--ld-teal-deep)]" /> : <CircleDot className="h-4 w-4 text-[var(--ld-teal-deep)]" />}
            {STAGES[visibleStage]}
          </div>
          <div className="inline-flex items-center gap-1.5 text-[0.75rem] font-bold text-[var(--ld-teal-deep)]">
            <Sparkles className="h-4 w-4" aria-hidden />
            {improved ? "Tahmini etki: +2–4 puan" : "Öncelik: ölçülebilir kanıt"}
          </div>
        </div>
      </div>
    </div>
  );
}
