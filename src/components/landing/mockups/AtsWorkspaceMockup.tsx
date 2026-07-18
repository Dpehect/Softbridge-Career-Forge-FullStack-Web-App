"use client";

import { motion } from "framer-motion";
import { useReducedMotionPreference } from "@/motion/useReducedMotionPreference";

export function AtsWorkspaceMockup() {
  const reduced = useReducedMotionPreference();

  return (
    <div className="relative mx-auto w-full max-w-3xl">
      <div className="landing-mock-strong overflow-hidden">
        <div className="flex items-center gap-2 border-b border-[var(--ld-border)] bg-[var(--ld-bg)] px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#e07a7a]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#e0b15a]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#6fbf8f]" />
          <span className="ml-2 text-xs font-semibold text-[var(--ld-ink-2)]">
            CareerForge · CV Analizi
          </span>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-[0.9fr_1.1fr] sm:p-5">
          <div className="rounded-xl border border-[var(--ld-border)] bg-[var(--ld-bg)] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ld-ink-2)]">
              Özgeçmiş önizleme
            </p>
            <p className="mt-3 text-sm font-bold text-[var(--ld-ink)]">Ayşe Demir</p>
            <p className="text-xs font-medium text-[var(--ld-teal)]">Senior Frontend Engineer</p>
            <div className="mt-3 space-y-2">
              <div className="h-2 w-full rounded bg-[var(--ld-border)]" />
              <div className="h-2 w-5/6 rounded bg-[var(--ld-border)]" />
              <div className="h-2 w-4/5 rounded bg-[var(--ld-border)]" />
            </div>
            <div className="mt-4 rounded-lg border border-[var(--ld-border)] bg-[var(--ld-surface)] p-2.5">
              <p className="text-[10px] font-bold text-[var(--ld-ink-2)]">Deneyim</p>
              <p className="mt-1 text-[11px] leading-relaxed text-[var(--ld-ink)]">
                Checkout dönüşümünü %18 artıran A/B testleri yönettim.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="rounded-xl border border-[var(--ld-border)] bg-[var(--ld-surface)] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ld-teal)]">
                ATS skoru
              </p>
              <div className="mt-2 flex items-end gap-1">
                <span className="text-4xl font-bold tracking-tight text-[var(--ld-ink)]">86</span>
                <span className="pb-1 text-sm font-semibold text-[var(--ld-ink-2)]">/100</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--ld-border)]">
                <motion.div
                  className="h-full rounded-full bg-[var(--ld-teal)]"
                  initial={{ width: reduced ? "86%" : 0 }}
                  animate={{ width: "86%" }}
                  transition={{ duration: reduced ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                ["Yapı", "18/20"],
                ["Anahtar kelime", "14/20"],
                ["Etki", "12/15"],
                ["İletişim", "10/10"],
              ].map(([label, score]) => (
                <div
                  key={label}
                  className="rounded-lg border border-[var(--ld-border)] bg-[var(--ld-bg)] px-3 py-2"
                >
                  <p className="text-[10px] font-semibold text-[var(--ld-ink-2)]">{label}</p>
                  <p className="text-xs font-bold text-[var(--ld-ink)]">{score}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <motion.div
        className="landing-mock absolute -left-2 top-16 hidden w-44 p-3 sm:block lg:-left-6"
        initial={reduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--ld-ink-2)]">
          Öneri
        </p>
        <p className="mt-1 text-xs font-semibold leading-snug text-[var(--ld-ink)]">
          “Yönettim” yerine ölçülebilir sonuç ekleyin
        </p>
      </motion.div>

      <motion.div
        className="landing-mock absolute -right-1 bottom-8 hidden w-48 p-3 sm:block lg:-right-4"
        initial={reduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
      >
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--ld-teal)]">
          Anahtar kelimeler
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {["React", "TypeScript", "ATS"].map((t) => (
            <span
              key={t}
              className="rounded-full bg-[var(--ld-mint)] px-2 py-0.5 text-[10px] font-bold text-[var(--ld-teal-deep)]"
            >
              {t}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
