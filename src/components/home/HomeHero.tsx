"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowRight, Sparkles, Check, Shield, Cpu } from "lucide-react";

import { useMessages } from "@/i18n/useMessages";
import { useCareerStore } from "@/store/useCareerStore";
import { FilePickButton } from "@/components/FilePickButton";
import { AnimatedProductPreview } from "@/components/home/AnimatedProductPreview";
import { WebGLBackground } from "./WebGLBackground";
import { cleanExtractedText, parseCV } from "@/lib/forge";
import { staggerContainer, fadeUp } from "@/motion/variants";
import { AnimatedNumber } from "@/motion/AnimatedNumber";
import { useReducedMotionPreference } from "@/motion/useReducedMotionPreference";

export function HomeHero() {
  const router = useRouter();
  const { locale, messages, page } = useMessages();
  const copy = page.home;
  const prefersReduced = useReducedMotionPreference();
  const isTr = locale === "tr";

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
            isTr
              ? `${parsed.name} CV'si içe aktarıldı`
              : `${parsed.name}'s resume was imported`,
          payload: parsed,
        });
        toast.success(isTr ? "CV'niz çalışma alanına alındı." : "Your resume was added to the workspace.");
        router.push("/forge");
      } catch {
        toast.error(isTr ? "Belge okunamadı. Metin içeren PDF, DOCX veya TXT deneyin." : "The document could not be read. Try a text-based PDF, DOCX, or TXT file.");
      }
    },
    [isTr, router, setForgeCvText, setForgeParsedCv, setLastAnalysisMeta, pushForgeHistory]
  );

  const openDemo = useCallback(() => {
    loadDemoProfile();
    toast.success(messages.demo.ready);
    router.push("/dashboard");
  }, [loadDemoProfile, messages, router]);

  // Highlighting key brand word "Forge" in title
  const highlightedHeadline = useMemo(() => {
    const text = copy.heroHeadline;
    if (text.includes("Forge")) {
      const parts = text.split("Forge");
      return (
        <>
          {parts[0]}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3b82f6] to-[#a855f7] drop-shadow-[0_0_20px_rgba(168,85,247,0.55)] font-extrabold px-1">
            Forge
          </span>
          {parts[1]}
        </>
      );
    }
    return text;
  }, [copy.heroHeadline]);

  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center justify-center py-20 lg:py-28">
      {/* WebGL Canvas Background */}
      <WebGLBackground />

      {/* Floating Elements */}
      <div className="absolute right-[8%] top-[15%] hidden xl:block z-10">
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          className="rounded-xl border border-line bg-surface/50 backdrop-blur-md px-4 py-2.5 text-xs font-semibold text-brand flex items-center gap-2 shadow-2xl"
        >
          <Sparkles className="h-4 w-4 text-brand-strong" />
          <span>ATS Optimized</span>
        </motion.div>
      </div>

      <div className="absolute left-[38%] bottom-[20%] hidden xl:block z-10">
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
          className="rounded-xl border border-line bg-surface/50 backdrop-blur-md px-4 py-2.5 text-xs font-semibold text-positive flex items-center gap-2 shadow-2xl"
        >
          <Check className="h-4 w-4 text-positive" />
          <span>AI Coaching Active</span>
        </motion.div>
      </div>

      <div className="max-w-[80rem] mx-auto px-4 sm:px-8 w-full relative z-20">
        <motion.div
          className="grid lg:grid-cols-[1fr_1.1fr] gap-12 xl:gap-20 items-center"
          variants={staggerContainer}
          initial={prefersReduced ? "visible" : "hidden"}
          animate="visible"
        >
          {/* Left Column: Headline and actions */}
          <div className="flex flex-col items-start space-y-6">
            {/* Monospace brand kicker */}
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-line bg-surface/40 backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-brand animate-ping" />
                <span className="font-mono text-[10px] font-bold text-brand-strong tracking-wider uppercase">
                  AI CAREER SUITE
                </span>
              </div>
            </motion.div>

            {/* Glowing Headline */}
            <motion.h1
              variants={fadeUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight text-[var(--fg-primary)] max-w-[18ch] text-balance"
            >
              {highlightedHeadline}
            </motion.h1>

            {/* Sub text */}
            <motion.p
              variants={fadeUp}
              className="text-base sm:text-lg text-[var(--fg-secondary)] max-w-[50ch] leading-relaxed"
            >
              {copy.heroSub}
            </motion.p>

            {/* Monospace stats dashboard */}
            <motion.div
              variants={fadeUp}
              className="flex flex-wrap items-center gap-6 py-5 border-y border-line w-full text-xs"
            >
              <div className="flex items-center gap-2.5">
                <Cpu className="h-4 w-4 text-brand" />
                <div>
                  <span className="font-bold text-ink block text-sm">
                    <AnimatedNumber value={6} /> ATS
                  </span>
                  <span className="text-[10px] text-ink-3 uppercase font-semibold">
                    {isTr ? "KATEGORİSİ" : "CATEGORIES"}
                  </span>
                </div>
              </div>
              
              <div className="h-8 w-px bg-line hidden sm:block" />

              <div className="flex items-center gap-2.5">
                <Shield className="h-4 w-4 text-positive" />
                <div>
                  <span className="font-bold text-ink block text-sm">
                    {isTr ? "%100 Güvenli" : "100% Secure"}
                  </span>
                  <span className="text-[10px] text-ink-3 uppercase font-semibold">
                    {isTr ? "CİHAZ İÇİ DESTEK" : "ON-DEVICE CONTROL"}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Call To Actions */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3.5 pt-2">
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
                className="inline-flex min-h-12 items-center gap-2 rounded-[var(--radius-control)] border border-line bg-surface/20 backdrop-blur-sm px-6 text-sm font-semibold text-[var(--fg-primary)] hover:bg-surface-2 transition-all hover:scale-[1.02] active:scale-[0.98] duration-200 focus:outline-none"
              >
                {copy.heroDemo}
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>

            {/* Dynamic disclaimer */}
            <motion.p
              variants={fadeUp}
              className="text-[10px] text-[var(--fg-tertiary)] flex items-center gap-1.5 pt-2"
            >
              <span className="text-brand">●</span>
              {isTr
                ? "Tarayıcı tabanlı analiz: Dosyalarınız izniniz olmadan sunucuya kaydedilmez."
                : "Browser-based auditing: Files are never saved to a server without account synchronization."}
            </motion.p>
          </div>

          {/* Right Column: Floating Product Interactive Mockup */}
          <motion.div
            variants={fadeUp}
            className="w-full flex justify-center lg:justify-end relative"
          >
            <div className="relative w-full max-w-[500px]">
              {/* Backglow behind product preview */}
              <div className="absolute inset-0 bg-[#3b82f6]/10 rounded-2xl blur-3xl -z-10" />
              <AnimatedProductPreview />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
