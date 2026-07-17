"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMessages } from "@/i18n/useMessages";
import { useReducedMotionPreference } from "@/motion/useReducedMotionPreference";

/* ─── Mini preview panels ─────────────────────────────────── */

function StepPanel({ step }: { step: number }) {
  switch (step) {
    case 1:
      return (
        <div className="h-full flex flex-col items-center justify-center p-8 gap-3">
          <div className="w-16 h-16 rounded-full bg-[var(--bg-surface-subtle)] flex items-center justify-center text-[var(--fg-tertiary)]">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div className="text-sm font-semibold text-[var(--fg-primary)]">CV dosyası yükle</div>
          <div className="text-xs text-[var(--fg-secondary)]">PDF, DOCX veya TXT — 5 MB'ye kadar</div>
          <div className="mt-2 px-4 py-2 rounded-[var(--radius-control)] border border-dashed border-[var(--action-primary)] text-xs text-[var(--action-primary)] font-medium">
            Dosya seç
          </div>
        </div>
      );
    case 2:
      return (
        <div className="h-full flex flex-col justify-center p-8 gap-4">
          <div className="text-sm font-semibold text-[var(--fg-primary)]">ATS Uyum Puanı</div>
          {[
            { label: "Anahtar kelimeler", pct: 85, color: "var(--status-positive)" },
            { label: "Biçimlendirme", pct: 65, color: "var(--status-caution)" },
            { label: "Deneyim", pct: 78, color: "var(--action-primary)" },
            { label: "İletişim", pct: 92, color: "var(--status-positive)" },
          ].map((bar) => (
            <div key={bar.label} className="flex items-center gap-3">
              <div className="text-xs text-[var(--fg-secondary)] w-28 shrink-0">{bar.label}</div>
              <div className="flex-1 h-1.5 bg-[var(--bg-surface-subtle)] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${bar.pct}%`, background: bar.color }} />
              </div>
              <div className="text-xs font-semibold tabular-nums" style={{ color: bar.color }}>{bar.pct}%</div>
            </div>
          ))}
        </div>
      );
    case 3:
      return (
        <div className="h-full flex flex-col justify-center p-8 gap-4">
          <div className="p-3 bg-[var(--caution-wash)] rounded-lg border border-[var(--status-caution)]/20">
            <div className="text-[10px] font-semibold text-[var(--status-caution)] uppercase mb-1.5 tracking-wide">Önce</div>
            <div className="text-xs text-[var(--fg-secondary)]">Satış projelerinde çalıştım ve geliri artırdım.</div>
          </div>
          <div className="flex justify-center text-[var(--fg-tertiary)] text-lg">↓</div>
          <div className="p-3 bg-[var(--positive-wash)] rounded-lg border border-[var(--status-positive)]/20">
            <div className="text-[10px] font-semibold text-[var(--status-positive)] uppercase mb-1.5 tracking-wide">Sonra · doğrulanmış</div>
            <div className="text-xs text-[var(--fg-primary)]">Yıllar arası %34 gelir artışı sağlayan hedefli satış kampanyaları yönettim.</div>
          </div>
        </div>
      );
    case 4:
      return (
        <div className="h-full flex flex-col justify-center p-8 gap-3">
          {[{ role: "Senior Frontend Engineer", company: "TechCorp", match: 92 }, { role: "Staff Product Engineer", company: "Harbor", match: 81 }].map((job) => (
            <div key={job.role} className="bg-[var(--bg-surface)] rounded-lg border border-[var(--border-default)] p-3 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs font-semibold text-[var(--fg-primary)]">{job.role}</div>
                  <div className="text-[10px] text-[var(--fg-secondary)]">{job.company}</div>
                </div>
                <div className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--positive-wash)] text-[var(--status-positive)]">{job.match}%</div>
              </div>
            </div>
          ))}
        </div>
      );
    case 5:
      return (
        <div className="h-full flex flex-col justify-center p-6 gap-3">
          <div className="self-start max-w-[85%] bg-[var(--bg-surface-subtle)] p-3 rounded-2xl rounded-tl-sm">
            <div className="text-[10px] text-[var(--fg-tertiary)] mb-1">Mülakat koçu</div>
            <div className="text-xs text-[var(--fg-primary)]">Performans kazanımını nasıl ölçtünüz?</div>
          </div>
          <div className="self-end max-w-[85%] bg-[var(--action-primary)] p-3 rounded-2xl rounded-tr-sm">
            <div className="text-[10px] text-[var(--action-primary-ink)]/70 mb-1">Siz</div>
            <div className="text-xs text-[var(--action-primary-ink)]">Lighthouse ile 4,2 saniyeden 2,7 saniyeye indirdim...</div>
          </div>
        </div>
      );
    case 6:
      return (
        <div className="h-full flex flex-col items-center justify-center p-8 gap-8">
          <div className="relative w-full flex justify-between items-center">
            <div className="absolute inset-x-0 top-2 h-0.5 bg-[var(--border-default)]" />
            {["Özet", "ATS", "Rol eşleşme", "Mülakat", "Başvuru"].map((label, i) => (
              <div key={label} className="flex flex-col items-center gap-2 z-10">
                <div className={`w-4 h-4 rounded-full ring-4 ring-[var(--bg-canvas)] ${i < 3 ? "bg-[var(--action-primary)]" : "bg-[var(--bg-surface-subtle)] border-2 border-[var(--border-default)]"}`} />
                <div className="text-[9px] font-medium text-[var(--fg-secondary)]">{label}</div>
              </div>
            ))}
          </div>
          <div className="text-xs text-[var(--fg-tertiary)] text-center">Kariyer planı tamamlanıyor…</div>
        </div>
      );
    default:
      return null;
  }
}

/* ─── Main component ──────────────────────────────────────── */

export function CareerWorkflow() {
  const { page } = useMessages();
  const copy = page.home;
  const prefersReduced = useReducedMotionPreference();
  const [activeStep, setActiveStep] = useState(1);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  const steps = [
    { id: 1, title: copy.workflowStep1Title, body: copy.workflowStep1Body },
    { id: 2, title: copy.workflowStep2Title, body: copy.workflowStep2Body },
    { id: 3, title: copy.workflowStep3Title, body: copy.workflowStep3Body },
    { id: 4, title: copy.workflowStep4Title, body: copy.workflowStep4Body },
    { id: 5, title: copy.workflowStep5Title, body: copy.workflowStep5Body },
    { id: 6, title: copy.workflowStep6Title, body: copy.workflowStep6Body },
  ];

  /* Scroll-based active step detection */
  useEffect(() => {
    if (prefersReduced) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = stepRefs.current.findIndex((r) => r === entry.target);
            if (idx !== -1) setActiveStep(idx + 1);
          }
        });
      },
      { rootMargin: "-35% 0px -35% 0px", threshold: 0 }
    );
    stepRefs.current.forEach((r) => r && observer.observe(r));
    return () => observer.disconnect();
  }, [prefersReduced]);

  /* ── Reduced-motion fallback ── */
  if (prefersReduced) {
    return (
      <section className="py-24 bg-[var(--bg-canvas)]">
        <div className="max-w-[80rem] mx-auto px-4 sm:px-8">
          <div className="mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--fg-primary)] text-balance">{copy.workflowTitle}</h2>
            <p className="mt-4 text-[var(--fg-secondary)] max-w-2xl leading-relaxed">{copy.workflowSub}</p>
          </div>
          <div className="flex flex-col gap-14">
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col gap-4">
                <div className="inline-flex items-center gap-2">
                  <span className="w-7 h-7 flex items-center justify-center rounded-full bg-[var(--action-primary)] text-[var(--action-primary-ink)] text-xs font-bold">{step.id}</span>
                  <h3 className="text-lg font-semibold text-[var(--fg-primary)]">{step.title}</h3>
                </div>
                <p className="text-sm text-[var(--fg-secondary)] leading-relaxed pl-9">{step.body}</p>
                <div className="h-56 rounded-xl overflow-hidden border border-[var(--border-default)] bg-[var(--bg-surface)]">
                  <StepPanel step={step.id} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  /* ── Animated layout ── */
  return (
    <section className="py-24 bg-[var(--bg-canvas)] home-section">
      <div className="max-w-[80rem] mx-auto px-4 sm:px-8">
        {/* Section header */}
        <div className="mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--fg-primary)] text-balance">{copy.workflowTitle}</h2>
          <p className="mt-4 text-[var(--fg-secondary)] max-w-2xl leading-relaxed">{copy.workflowSub}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* ── Left: scrollable steps ── */}
          <div className="relative">
            {/* Vertical track line */}
            <div className="hidden lg:block absolute left-3.5 top-3 bottom-32 w-0.5 bg-[var(--border-default)]" aria-hidden="true" />

            <div className="flex flex-col gap-20 lg:gap-28 pb-28">
              {steps.map((step, idx) => {
                const isActive = activeStep === step.id;
                return (
                  <motion.div
                    key={step.id}
                    ref={(el) => { stepRefs.current[idx] = el; }}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="relative lg:pl-14"
                  >
                    {/* Dot */}
                    <div
                      className="hidden lg:flex absolute left-0 top-0.5 w-7 h-7 rounded-full items-center justify-center border-2 transition-colors duration-300 z-10"
                      style={{
                        borderColor: isActive ? "var(--action-primary)" : "var(--border-default)",
                        background: isActive ? "var(--action-primary)" : "var(--bg-canvas)",
                      }}
                    >
                      <span
                        className="text-[10px] font-bold transition-colors duration-300"
                        style={{ color: isActive ? "var(--action-primary-ink)" : "var(--fg-tertiary)" }}
                      >
                        {step.id}
                      </span>
                    </div>

                    {/* Mobile step badge */}
                    <div className="flex items-center gap-2 mb-3 lg:hidden">
                      <span className="w-6 h-6 flex items-center justify-center rounded-full bg-[var(--action-primary)] text-[var(--action-primary-ink)] text-[10px] font-bold">{step.id}</span>
                    </div>

                    {/* Step text — always visible, active step gets full opacity */}
                    <h3
                      className="text-lg sm:text-xl font-semibold text-[var(--fg-primary)] transition-opacity duration-400"
                      style={{ opacity: isActive ? 1 : 0.55 }}
                    >
                      {step.title}
                    </h3>
                    <p
                      className="text-sm text-[var(--fg-secondary)] leading-relaxed mt-2 transition-opacity duration-400"
                      style={{ opacity: isActive ? 1 : 0.55 }}
                    >
                      {step.body}
                    </p>

                    {/* Mobile thumbnail */}
                    <div className="mt-4 h-48 w-full rounded-xl overflow-hidden border border-[var(--border-default)] bg-[var(--bg-surface)] lg:hidden">
                      <StepPanel step={step.id} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* ── Right: sticky preview panel ── */}
          <div className="hidden lg:block">
            <div className="sticky top-24 h-[560px] rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden shadow-sm">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="w-full h-full"
                >
                  <StepPanel step={activeStep} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
