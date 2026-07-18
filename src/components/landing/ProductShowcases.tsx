"use client";

import Link from "next/link";
import { motion } from "framer-motion";
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
      {/* A — CV / ATS */}
      <section className="bg-[var(--ld-bg)] py-16 sm:py-24">
        <div className="landing-shell grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="landing-eyebrow">CV Oluşturucu</p>
            <h2 className="landing-h2 mt-3">
              Her başvuru için güçlü ve ATS uyumlu bir CV oluşturun
            </h2>
            <p className="landing-lede mt-4">
              Altı kategoride şeffaf skor, eksik sinyaller ve önce/sonra önerileriyle
              CV&apos;nizi hedef role göre güçlendirin — analiz tarayıcınızda kalır.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/forge" className="landing-cta-primary">
                CV Analizine Başla
              </Link>
              <Link href="/resume" className="landing-cta-secondary">
                Editörü Aç
              </Link>
            </div>
          </Reveal>
          <Reveal>
            <div className="rounded-3xl bg-[var(--ld-cobalt)] p-5 sm:p-8">
              <AtsWorkspaceMockup />
              <div className="mt-4 rounded-xl border border-white/15 bg-white/10 p-3 text-[var(--ld-offwhite)] backdrop-blur-[1px]">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-90">
                  Önce → Sonra
                </p>
                <p className="mt-1 text-xs opacity-80 line-through">
                  Satış projelerinde çalıştım ve geliri artırdım.
                </p>
                <p className="mt-1 text-sm font-semibold">
                  Hedefli kampanyalarla yıllık geliri %34 artırdım.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* B — Job tracker */}
      <section className="bg-[var(--ld-blue-deep)] py-16 text-[var(--ld-offwhite)] sm:py-24">
        <div className="landing-shell grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal className="order-2 lg:order-1">
            <div className="rounded-3xl bg-white/10 p-4 sm:p-6">
              <div className="[&_.landing-mock-strong]:bg-white [&_.landing-mock-strong]:text-[#101418]">
                <JobTrackerMockup />
              </div>
            </div>
          </Reveal>
          <Reveal className="order-1 lg:order-2">
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-[#c5c9ff]">
              İş Takibi
            </p>
            <h2 className="mt-3 text-[clamp(1.75rem,3.2vw,2.75rem)] font-bold leading-tight tracking-tight text-[var(--ld-offwhite)] text-balance">
              İş arama sürecinizi tek bir yerde yönetin
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-[#d8daf5]">
              Kaydedildi, başvuruldu, mülakat, teklif — her aşamayı görün. Demo ilanlarla
              uyum skorunu test edin, pipeline’ınızı kaybetmeyin.
            </p>
            <div className="mt-8">
              <Link
                href="/jobs"
                className="landing-cta-primary"
              >
                İş Takibine Git
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* C — Match */}
      <section className="bg-[#fff8eb] py-16 sm:py-24 dark:bg-[#1c1810]">
        <div className="landing-shell grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="landing-eyebrow">Rol Eşleştirme</p>
            <h2 className="landing-h2 mt-3">
              Becerilerinizi doğru rollerle eşleştirin
            </h2>
            <p className="landing-lede mt-4">
              Güçlü ve eksik sinyalleri görün, sonraki adımı netleştirin. Mülakat
              hazırlığı ve yol haritası aynı çalışma alanında bağlanır.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/jobs" className="landing-cta-primary">
                Rolleri Keşfet
              </Link>
              <Link href="/paths" className="landing-cta-secondary">
                Yol Haritası
              </Link>
            </div>
          </Reveal>
          <Reveal>
            <div className="rounded-3xl bg-[var(--ld-mint)] p-5 sm:p-8">
              <MatchInsightsMockup />
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
