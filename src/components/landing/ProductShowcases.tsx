"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useReducedMotionPreference } from "@/motion/useReducedMotionPreference";
import { AtsWorkspaceMockup } from "@/components/landing/mockups/AtsWorkspaceMockup";
import { JobTrackerMockup } from "@/components/landing/mockups/JobTrackerMockup";
import { MatchInsightsMockup } from "@/components/landing/mockups/MatchInsightsMockup";

function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduced = useReducedMotionPreference();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}

export function ProductShowcases() {
  return (
    <div className="border-b border-[var(--ld-border)]">
      {/* A — split editorial: CV / ATS on cobalt */}
      <section className="bg-[var(--ld-bg)] py-14 sm:py-20">
        <div className="landing-shell-wide grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <Reveal>
            <p className="landing-eyebrow">CV Oluşturucu</p>
            <h2 className="landing-h2 mt-3">
              Her başvuru için güçlü ve ATS uyumlu bir CV oluşturun
            </h2>
            <p className="landing-lede mt-4">
              Altı kategoride şeffaf skor, eksik sinyaller ve önce/sonra önerileriyle
              CV&apos;nizi hedef role göre güçlendirin — analiz tarayıcınızda kalır.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/forge" className="landing-cta-primary">
                CV Analizine Başla
              </Link>
              <Link
                href="/resume"
                className="inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-[var(--ld-teal)] hover:underline"
              >
                Editörü aç <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
          <Reveal>
            <div className="landing-on-cobalt scale-[1.02] rounded-3xl bg-[var(--ld-cobalt)] p-5 sm:p-8 sm:scale-100 lg:scale-[1.04]">
              <AtsWorkspaceMockup />
              <div className="mt-4 rounded-xl border border-[rgba(250,245,238,0.28)] bg-[rgba(16,20,24,0.18)] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#FAF5EE]">
                  Önce → Sonra
                </p>
                <p className="mt-1 text-sm text-[#E8E4F8] line-through">
                  Satış projelerinde çalıştım ve geliri artırdım.
                </p>
                <p className="mt-1 text-base font-semibold text-[#FAF5EE]">
                  Hedefli kampanyalarla yıllık geliri %34 artırdım.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* B — full-width dashboard composition on deep blue */}
      <section className="landing-on-dark bg-[var(--ld-blue-deep)] py-14 sm:py-20">
        <div className="landing-shell-wide">
          <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:max-w-xl lg:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#D6D9FF]">
              İş Takibi
            </p>
            <h2 className="mt-3 text-[clamp(1.85rem,3.2vw,2.85rem)] font-bold leading-tight tracking-tight text-[#FAF5EE] text-balance">
              İş arama sürecinizi tek bir yerde yönetin
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#E1E3FA] sm:text-[1.0625rem]">
              Kaydedildi, başvuruldu, mülakat, teklif — her aşamayı görün. Demo ilanlarla
              uyum skorunu test edin, pipeline&apos;ınızı kaybetmeyin.
            </p>
            <div className="mt-8 flex justify-center lg:justify-start">
              <Link href="/jobs" className="landing-cta-primary">
                İş Takibine Git
              </Link>
            </div>
          </div>

          <Reveal className="mt-10">
            <div className="mx-auto max-w-4xl rounded-3xl bg-white/10 p-4 sm:p-7">
              <div className="origin-top scale-[1.02] sm:scale-105 [&_.landing-mock-strong]:bg-white [&_.landing-mock-strong]:text-[#101418]">
                <JobTrackerMockup />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* C — layered match insights on warm cream */}
      <section className="bg-[#fff8eb] py-14 sm:py-20 dark:bg-[#1c1810]">
        <div className="landing-shell grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
          <Reveal>
            <p className="landing-eyebrow">Rol Eşleştirme</p>
            <h2 className="landing-h2 mt-3">
              Becerilerinizi doğru rollerle eşleştirin
            </h2>
            <p className="landing-lede mt-4">
              Güçlü ve eksik sinyalleri görün, sonraki adımı netleştirin. Mülakat
              hazırlığı ve yol haritası aynı çalışma alanında bağlanır.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/jobs" className="landing-cta-primary">
                Rolleri Keşfet
              </Link>
              <Link
                href="/paths"
                className="inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-[var(--ld-teal)] hover:underline"
              >
                Yol haritası <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
          <Reveal>
            <div className="relative">
              <div className="absolute -right-2 -top-3 z-10 hidden w-40 rounded-xl border border-[var(--ld-border)] bg-[var(--ld-surface)] p-3 shadow-[var(--ld-shadow-sm)] sm:block">
                <p className="text-xs font-bold text-[var(--ld-ink)]">Mülakat hazırlığı</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--ld-border)]">
                  <div className="h-full w-[70%] rounded-full bg-[var(--ld-amber)]" />
                </div>
              </div>
              <div className="rounded-3xl bg-[var(--ld-mint)] p-5 sm:p-8 lg:scale-[1.04]">
                <MatchInsightsMockup />
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
