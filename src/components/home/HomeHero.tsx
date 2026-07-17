"use client";

import { useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  FileText,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";

import { useMessages } from "@/i18n/useMessages";
import { useCareerStore } from "@/store/useCareerStore";
import { FilePickButton } from "@/components/FilePickButton";
import { cleanExtractedText, parseCV } from "@/lib/forge";
import { useReducedMotionPreference } from "@/motion/useReducedMotionPreference";

const WebGLBackground = dynamic(
  () => import("./WebGLBackground").then((m) => m.WebGLBackground),
  { ssr: false }
);

const float = (y = 12, duration = 4, delay = 0) => ({
  y: [0, -y, 0],
  transition: { repeat: Infinity, duration, ease: "easeInOut" as const, delay },
});

const bounceHover = {
  scale: 1.06,
  y: -2,
  transition: { type: "spring" as const, stiffness: 400, damping: 14 },
};

export function HomeHero() {
  const router = useRouter();
  const { locale, messages } = useMessages();
  const isTr = locale === "tr";
  const prefersReduced = useReducedMotionPreference();
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 400], [0, prefersReduced ? 0 : -40]);
  const heroOpacity = useTransform(scrollY, [0, 320], [1, prefersReduced ? 1 : 0.55]);

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
            : "Could not read the document. Try a text PDF or TXT."
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
    <section className="relative min-h-[min(100vh,920px)] flex items-center overflow-hidden py-20 lg:py-28">
      <WebGLBackground />

      {/* Floating playful chips */}
      {!prefersReduced && (
        <>
          <motion.div
            className="absolute left-[6%] top-[18%] z-10 hidden xl:block"
            animate={float(14, 5, 0)}
          >
            <div className="flex items-center gap-2 rounded-2xl border border-white/60 bg-white/80 px-4 py-2.5 text-xs font-bold text-sky-700 shadow-lg shadow-sky-200/50 backdrop-blur-md dark:border-white/10 dark:bg-white/10 dark:text-sky-200">
              <FileText className="h-4 w-4" />
              CV · ATS 92%
            </div>
          </motion.div>
          <motion.div
            className="absolute right-[8%] top-[22%] z-10 hidden xl:block"
            animate={float(16, 4.5, 0.4)}
          >
            <div className="flex items-center gap-2 rounded-2xl border border-white/60 bg-white/80 px-4 py-2.5 text-xs font-bold text-orange-600 shadow-lg shadow-orange-200/50 backdrop-blur-md dark:border-white/10 dark:bg-white/10 dark:text-orange-300">
              <Briefcase className="h-4 w-4" />
              {isTr ? "İş eşleşmesi" : "Job match"}
            </div>
          </motion.div>
          <motion.div
            className="absolute left-[12%] bottom-[22%] z-10 hidden xl:block"
            animate={float(12, 5.5, 0.8)}
          >
            <div className="flex items-center gap-2 rounded-2xl border border-white/60 bg-white/80 px-4 py-2.5 text-xs font-bold text-emerald-700 shadow-lg shadow-emerald-200/50 backdrop-blur-md dark:border-white/10 dark:bg-white/10 dark:text-emerald-300">
              <TrendingUp className="h-4 w-4" />
              React · TypeScript
            </div>
          </motion.div>
          <motion.div
            className="absolute right-[14%] bottom-[18%] z-10 hidden xl:block"
            animate={float(18, 4.2, 1.1)}
          >
            <div className="flex items-center gap-2 rounded-2xl border border-white/60 bg-white/80 px-4 py-2.5 text-xs font-bold text-violet-700 shadow-lg shadow-violet-200/50 backdrop-blur-md dark:border-white/10 dark:bg-white/10 dark:text-violet-300">
              <Star className="h-4 w-4 fill-violet-500 text-violet-500" />
              {isTr ? "STAR hazır" : "STAR ready"}
            </div>
          </motion.div>
          <motion.div
            className="absolute left-[42%] top-[12%] z-10 hidden 2xl:block"
            animate={{ rotate: [0, 8, -8, 0], y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-violet-500 text-white shadow-xl shadow-violet-300/40">
              <Target className="h-6 w-6" />
            </div>
          </motion.div>
        </>
      )}

      <motion.div
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative z-20 mx-auto w-full max-w-6xl px-4 sm:px-8"
      >
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-200/80 bg-white/80 px-4 py-1.5 text-xs font-bold text-orange-700 shadow-sm backdrop-blur-md dark:border-orange-500/30 dark:bg-white/10 dark:text-orange-300"
          >
            <Sparkles className="h-3.5 w-3.5" />
            SoftBridge · CareerForge
          </motion.div>

          <motion.h1
            initial={prefersReduced ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="text-balance text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-[3.75rem] lg:leading-[1.05] dark:text-white"
          >
            {isTr ? (
              <>
                Kariyerini{" "}
                <span className="bg-gradient-to-r from-sky-500 via-violet-500 to-orange-500 bg-clip-text text-transparent">
                  Forge
                </span>{" "}
                Et! ✨
              </>
            ) : (
              <>
                Forge your career!{" "}
                <span className="bg-gradient-to-r from-sky-500 via-violet-500 to-orange-500 bg-clip-text text-transparent">
                  ✨
                </span>
              </>
            )}
          </motion.h1>

          <motion.p
            initial={prefersReduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300"
          >
            {isTr
              ? "AI ile CV’ni güçlendir, iş bul, ilerle. Hem de keyifle."
              : "Level up your CV with AI, land roles, grow — and enjoy the ride."}
          </motion.p>

          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <motion.div whileHover={prefersReduced ? undefined : bounceHover} whileTap={{ scale: 0.97 }}>
              <Link
                href="/forge"
                className="group relative inline-flex h-13 min-h-12 items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-sky-500 via-violet-500 to-orange-500 px-7 text-sm font-bold text-white shadow-lg shadow-violet-400/40"
              >
                <span className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
                <Zap className="relative h-4 w-4" />
                <span className="relative">
                  {isTr ? "Hemen Başla" : "Start now"}
                </span>
                <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>

            <motion.div whileHover={prefersReduced ? undefined : bounceHover} whileTap={{ scale: 0.97 }}>
              <button
                type="button"
                onClick={openDemo}
                className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-slate-200 bg-white/90 px-7 text-sm font-bold text-slate-800 shadow-md backdrop-blur-sm transition-colors hover:border-violet-300 hover:text-violet-700 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:border-violet-400"
              >
                {isTr ? "Demo’yu Dene" : "Try the demo"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={prefersReduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-3"
          >
            <FilePickButton
              label={isTr ? "CV yükle" : "Upload CV"}
              variant="outline"
              size="sm"
              silentSuccess
              onText={handleResumeText}
            />
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {isTr
                ? "Verilerin cihazında kalır · %100 yerel"
                : "Data stays on device · 100% local"}
            </span>
          </motion.div>

          {/* Mini progress tease */}
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mx-auto mt-10 max-w-md rounded-2xl border border-white/70 bg-white/75 p-4 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-white/10"
          >
            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span>{isTr ? "Kariyer ilerlemesi" : "Career progress"}</span>
              <span className="text-violet-600 dark:text-violet-300">78%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 via-violet-500 to-orange-400"
                initial={{ width: prefersReduced ? "78%" : "0%" }}
                animate={{ width: "78%" }}
                transition={{ duration: 1.4, delay: 0.6, ease: "easeOut" }}
              />
            </div>
            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              {isTr
                ? "CV güçlendi · 3 ilan eşleşti · Mülakat hazırlığı açık"
                : "CV stronger · 3 job matches · Interview prep unlocked"}
            </p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
