"use client";

import { useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Rocket, Sparkles, Shield } from "lucide-react";
import { toast } from "sonner";

import { useMessages } from "@/i18n/useMessages";
import { useCareerStore } from "@/store/useCareerStore";
import { cleanExtractedText, parseCV } from "@/lib/forge";
import { FilePickButton } from "@/components/FilePickButton";
import { useReducedMotionPreference } from "@/motion/useReducedMotionPreference";

export function HomeFinalCta() {
  const { locale, messages } = useMessages();
  const router = useRouter();
  const prefersReduced = useReducedMotionPreference();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-10% 0px" });
  const isTr = locale === "tr";

  const {
    loadDemoProfile,
    setForgeCvText,
    setForgeParsedCv,
    setLastAnalysisMeta,
    pushForgeHistory,
  } = useCareerStore();

  const handleResumeText = useCallback(
    (text: string, fileName: string) => {
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
          summary: isTr
            ? `${parsed.name} CV'si içe aktarıldı`
            : `${parsed.name}'s resume was imported`,
          payload: parsed,
        });
        toast.success(
          isTr ? "CV'niz çalışma alanına alındı." : "Your resume was added to the workspace."
        );
        router.push("/forge");
      } catch {
        toast.error(
          isTr
            ? "Belge okunamadı. Metin içeren PDF veya TXT deneyin."
            : "Could not read the document."
        );
      }
    },
    [isTr, router, setForgeCvText, setForgeParsedCv, setLastAnalysisMeta, pushForgeHistory]
  );

  const openDemo = useCallback(() => {
    loadDemoProfile();
    toast.success(messages.demo.ready);
    router.push("/dashboard");
  }, [loadDemoProfile, messages, router]);

  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-violet-50 to-orange-100 dark:from-slate-950 dark:via-violet-950/50 dark:to-slate-900" />
      <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-sky-300/35 blur-3xl" />
      <div className="absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-orange-300/30 blur-3xl" />
      <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-300/20 blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-8">
        <motion.div
          ref={containerRef}
          initial={prefersReduced ? false : { opacity: 0, y: 28, scale: 0.98 }}
          animate={
            prefersReduced || isInView
              ? { opacity: 1, y: 0, scale: 1 }
              : undefined
          }
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl border border-white/80 bg-white/85 p-8 text-center shadow-2xl shadow-violet-200/30 backdrop-blur-md sm:p-12 dark:border-white/10 dark:bg-white/5 dark:shadow-none"
        >
          <motion.div
            animate={
              prefersReduced
                ? undefined
                : { y: [0, -8, 0], rotate: [0, 6, -6, 0] }
            }
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3b82f6] via-violet-500 to-orange-400 text-white shadow-lg shadow-violet-300/50"
          >
            <Rocket className="h-7 w-7" />
          </motion.div>

          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            {isTr
              ? "CV’ni güçlendir, bir sonraki mülakata hazır ol"
              : "Strengthen your resume. Walk into the next interview ready."}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            {isTr
              ? "ATS skoru, somut düzeltmeler ve mülakat koçu — verilerin cihazında kalır."
              : "ATS score, concrete fixes, and interview coach — data stays on your device."}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <motion.div
              whileHover={prefersReduced ? undefined : { scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                href="/forge"
                className="cta-glow inline-flex min-h-12 items-center gap-2 rounded-full bg-[#2563eb] px-8 text-sm font-extrabold text-white shadow-lg shadow-blue-500/30"
              >
                <Sparkles className="h-4 w-4" />
                {isTr ? "Ücretsiz ATS Analizi Yap" : "Run free ATS analysis"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
            <motion.div
              whileHover={prefersReduced ? undefined : { scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <button
                type="button"
                onClick={openDemo}
                className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-slate-200 bg-white px-8 text-sm font-bold text-slate-800 shadow-md transition-colors hover:border-violet-300 dark:border-white/15 dark:bg-white/10 dark:text-white"
              >
                {isTr ? "Demo’yu Dene" : "Try demo"}
              </button>
            </motion.div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <FilePickButton
              label={isTr ? "CV yükle" : "Upload CV"}
              variant="outline"
              size="sm"
              silentSuccess
              onText={handleResumeText}
            />
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <Shield className="h-3.5 w-3.5" />
              {isTr ? "Gizlilik odaklı · yerel işlem" : "Privacy-first · on-device"}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
