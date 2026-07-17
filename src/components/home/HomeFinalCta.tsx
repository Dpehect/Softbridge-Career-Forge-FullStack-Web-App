"use client";

import { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { useMessages } from "@/i18n/useMessages";
import { useCareerStore } from "@/store/useCareerStore";
import { cleanExtractedText, parseCV } from "@/lib/forge";
import { FilePickButton } from "@/components/FilePickButton";
import { Button } from "@/components/ui/button";
import { fadeUp } from "@/motion/variants";
import { useReducedMotionPreference } from "@/motion/useReducedMotionPreference";

export function HomeFinalCta() {
  const { locale, messages, page } = useMessages();
  const copy = page.home;
  const router = useRouter();
  const prefersReduced = useReducedMotionPreference();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-10% 0px" });

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
    <section className="py-24 bg-[var(--bg-surface)] border-t border-[var(--border-default)]">
      <div className="max-w-[80rem] mx-auto px-4 sm:px-8">
        <motion.div
          ref={containerRef}
          variants={fadeUp}
          initial={prefersReduced ? "visible" : "hidden"}
          animate={prefersReduced || isInView ? "visible" : "hidden"}
          className="flex flex-col items-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--fg-primary)] text-balance text-center max-w-[28ch] mx-auto leading-tight">
            {copy.ctaTitle}
          </h2>
          <p className="text-base text-[var(--fg-secondary)] text-center mt-4 max-w-[44ch] mx-auto leading-relaxed">
            {copy.ctaSub}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10 w-full sm:w-auto">
            <FilePickButton
              label={copy.ctaUpload}
              variant="primary"
              size="lg"
              silentSuccess
              onText={handleResumeText}
            />
            <Button
              variant="outline"
              size="lg"
              onClick={openDemo}
            >
              {copy.ctaDemo}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
