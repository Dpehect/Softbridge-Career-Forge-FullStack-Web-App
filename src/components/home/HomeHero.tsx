"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

import { useMessages } from "@/i18n/useMessages";
import { useCareerStore } from "@/store/useCareerStore";
import { FilePickButton } from "@/components/FilePickButton";
import { AnimatedProductPreview } from "@/components/home/AnimatedProductPreview";
import { cleanExtractedText, parseCV } from "@/lib/forge";
import { staggerContainer, fadeUp } from "@/motion/variants";
import { AnimatedNumber } from "@/motion/AnimatedNumber";
import { useReducedMotionPreference } from "@/motion/useReducedMotionPreference";

export function HomeHero() {
  const router = useRouter();
  const { locale, messages, page } = useMessages();
  const copy = page.home;
  const prefersReduced = useReducedMotionPreference();

  const {
    loadDemoProfile,
    setForgeCvText,
    setForgeParsedCv,
    setLastAnalysisMeta,
    pushForgeHistory,
  } = useCareerStore();

  const handleResumeText = useCallback(
    (text: string, fileName: string, _meta: { kind: "text" | "pdf" }) => {
      try {
        const cleaned = cleanExtractedText(text);
        const parsed = parseCV(cleaned);
        setForgeCvText(cleaned);
        setForgeParsedCv(parsed);
        setLastAnalysisMeta({
          at: new Date().toISOString(),
          fileName,
          candidateName: parsed.name,
          targetTitle: parsed.title,
        });
        pushForgeHistory({
          action: "parse",
          summary:
            locale === "tr"
              ? `${parsed.name} CV'si içe aktarıldı`
              : `${parsed.name}'s resume was imported`,
          payload: parsed,
        });
        toast.success(locale === "tr" ? "CV'niz çalışma alanına alındı." : "Your resume was added to the workspace.");
        router.push("/forge");
      } catch {
        toast.error(locale === "tr" ? "Belge okunamadı. Metin içeren PDF, DOCX veya TXT deneyin." : "The document could not be read. Try a text-based PDF, DOCX, or TXT file.");
      }
    },
    [locale, copy, router, setForgeCvText, setForgeParsedCv, setLastAnalysisMeta, pushForgeHistory]
  );

  const openDemo = useCallback(() => {
    loadDemoProfile();
    toast.success(messages.demo.ready);
    router.push("/dashboard");
  }, [loadDemoProfile, messages, router]);

  return (
    <section className="home-hero-gradient home-section">
      <div className="max-w-[80rem] mx-auto px-4 sm:px-8 py-20 lg:py-28">
        <motion.div
          className="grid lg:grid-cols-[1fr_1fr] gap-12 xl:gap-20 items-center"
          variants={staggerContainer}
          initial={prefersReduced ? "visible" : "hidden"}
          animate="visible"
        >
          {/* Left Column */}
          <div className="flex flex-col items-start">
            {/* Brand kicker */}
            <motion.div variants={fadeUp} className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--action-primary)]" />
                <span className="font-mono text-[0.6875rem] font-semibold text-[var(--fg-tertiary)] tracking-wide uppercase">
                  CareerForge
                </span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="text-[2.75rem] sm:text-5xl lg:text-[3.5rem] xl:text-[4rem] font-bold leading-[1.05] tracking-tight text-[var(--fg-primary)] max-w-[16ch] text-balance"
            >
              {copy.heroHeadline}
            </motion.h1>

            {/* Supporting text */}
            <motion.p
              variants={fadeUp}
              className="text-base sm:text-lg text-[var(--fg-secondary)] max-w-[50ch] leading-relaxed mt-6"
            >
              {copy.heroSub}
            </motion.p>

            {/* Stats row */}
            <motion.div
              variants={fadeUp}
              className="flex flex-wrap items-center gap-6 mt-8 pb-8 border-b border-[var(--border-default)] w-full"
            >
              <div className="flex flex-col">
                <span className="text-[1.75rem] font-bold text-[var(--fg-primary)] font-mono tabular-nums leading-none">
                  <AnimatedNumber value={6} />
                </span>
                <span className="text-xs text-[var(--fg-tertiary)] mt-1">
                  {locale === "tr" ? "ATS kategorisi" : "ATS categories"}
                </span>
              </div>
              <div className="h-8 w-px bg-[var(--border-default)]" aria-hidden="true" />
              <div className="flex flex-col">
                <span className="text-[1.75rem] font-bold text-[var(--fg-primary)] font-mono tabular-nums leading-none">
                  <AnimatedNumber value={2} />
                </span>
                <span className="text-xs text-[var(--fg-tertiary)] mt-1">
                  {locale === "tr" ? "dil desteği" : "languages"}
                </span>
              </div>
              <div className="h-8 w-px bg-[var(--border-default)]" aria-hidden="true" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-[var(--fg-primary)] leading-none">
                  {locale === "tr" ? "Tarayıcıda" : "Browser-only"}
                </span>
                <span className="text-xs text-[var(--fg-tertiary)] mt-1">
                  {locale === "tr" ? "analiz" : "analysis"}
                </span>
              </div>
            </motion.div>

            {/* CTA row */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 mt-8">
              <FilePickButton
                label={copy.heroUpload}
                variant="primary"
                size="lg"
                silentSuccess
                onText={handleResumeText}
              />
              <button
                type="button"
                onClick={openDemo}
                className="inline-flex min-h-12 items-center gap-2 rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-transparent px-5 text-sm font-semibold text-[var(--fg-primary)] transition-colors hover:bg-[var(--bg-surface-subtle)] focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
              >
                {copy.heroDemo}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </motion.div>

            {/* Privacy note */}
            <motion.p
              variants={fadeUp}
              className="mt-6 text-[0.6875rem] text-[var(--fg-tertiary)] leading-5"
            >
              {locale === "tr"
                ? "Standart analiz tarayıcıda çalışır; düzenlenmiş çalışma alanınız hesabınıza güvenli şekilde kaydedilir."
                : "Standard analysis runs in your browser; your edited workspace is securely saved to your account."}
            </motion.p>
          </div>

          {/* Right Column: Product Preview */}
          <motion.div
            variants={fadeUp}
            className="w-full flex justify-center lg:justify-end"
          >
            <AnimatedProductPreview />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
