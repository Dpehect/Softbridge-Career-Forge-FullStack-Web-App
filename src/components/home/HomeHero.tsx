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
  Shield,
  Flame,
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
  scale: 1.05,
  y: -3,
  transition: { type: "spring" as const, stiffness: 420, damping: 16 },
};

const badgePop = {
  hidden: { opacity: 0, scale: 0.7, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { delay: 0.45 + i * 0.08, type: "spring" as const, stiffness: 280, damping: 18 },
  }),
};

export function HomeHero() {
  const router = useRouter();
  const { locale, messages } = useMessages();
  const isTr = locale === "tr";
  const prefersReduced = useReducedMotionPreference();
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 420], [0, prefersReduced ? 0 : -48]);
  const heroOpacity = useTransform(scrollY, [0, 360], [1, prefersReduced ? 1 : 0.5]);
  const cardsY = useTransform(scrollY, [0, 400], [0, prefersReduced ? 0 : 30]);

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
    <section className="relative min-h-[min(100svh,960px)] flex items-center overflow-hidden py-20 lg:py-28">
      <WebGLBackground />

      {/* Floating badges & mini CV cards */}
      {!prefersReduced && (
        <>
          <motion.div
            className="absolute left-[4%] top-[16%] z-10 hidden xl:block"
            custom={0}
            initial="hidden"
            animate="visible"
            variants={badgePop}
          >
            <motion.div animate={float(14, 5, 0)} className="hero-float-card">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-md">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-300">
                    ATS
                  </p>
                  <p className="text-sm font-extrabold text-ink">92%</p>
                  <div className="mt-1.5 h-1.5 w-24 overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-500"
                      initial={{ width: 0 }}
                      animate={{ width: "92%" }}
                      transition={{ duration: 1.2, delay: 0.9 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="absolute right-[5%] top-[18%] z-10 hidden xl:block"
            custom={1}
            initial="hidden"
            animate="visible"
            variants={badgePop}
          >
            <motion.div animate={float(16, 4.6, 0.3)} className="hero-float-card">
              <div className="flex items-center gap-2.5">
                <Briefcase className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-xs font-bold text-ink">
                    {isTr ? "İş eşleşmesi" : "Job match"}
                  </p>
                  <p className="text-[11px] font-semibold text-orange-600 dark:text-orange-300">
                    Senior FE · 89%
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="absolute left-[8%] bottom-[18%] z-10 hidden xl:block"
            custom={2}
            initial="hidden"
            animate="visible"
            variants={badgePop}
          >
            <motion.div animate={float(12, 5.4, 0.6)} className="hero-float-card max-w-[200px]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-300">
                {isTr ? "Güçlü sinyaller" : "Strong signals"}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {["React", "TypeScript", "Next.js"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="absolute right-[10%] bottom-[16%] z-10 hidden xl:block"
            custom={3}
            initial="hidden"
            animate="visible"
            variants={badgePop}
          >
            <motion.div
              animate={float(18, 4.2, 0.9)}
              className="flex items-center gap-2 rounded-2xl border border-white/70 bg-white/85 px-4 py-2.5 text-xs font-bold text-violet-700 shadow-lg shadow-violet-200/40 backdrop-blur-md dark:border-white/10 dark:bg-white/10 dark:text-violet-300"
            >
              <Star className="h-4 w-4 fill-violet-500 text-violet-500" />
              {isTr ? "STAR mülakat hazır" : "STAR interview ready"}
            </motion.div>
          </motion.div>

          <motion.div
            className="absolute left-[40%] top-[10%] z-10 hidden 2xl:block"
            animate={{ rotate: [0, 10, -8, 0], y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-violet-500 to-orange-400 text-white shadow-xl shadow-orange-300/40">
              <Target className="h-7 w-7" />
            </div>
          </motion.div>

          <motion.div
            className="absolute right-[22%] top-[42%] z-10 hidden 2xl:block"
            animate={float(10, 3.8, 0.5)}
          >
            <div className="flex items-center gap-1.5 rounded-full border border-white/60 bg-white/80 px-3 py-1.5 text-[11px] font-bold text-pink-600 shadow-md backdrop-blur-md dark:border-white/10 dark:bg-white/10 dark:text-pink-300">
              <Flame className="h-3.5 w-3.5" />
              {isTr ? "Motivasyon +24" : "Momentum +24"}
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
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-200/80 bg-white/85 px-4 py-1.5 text-xs font-bold text-orange-700 shadow-sm backdrop-blur-md dark:border-orange-500/30 dark:bg-white/10 dark:text-orange-300"
          >
            <Sparkles className="h-3.5 w-3.5" />
            SoftBridge · CareerForge
            <span className="ml-1 rounded-full bg-gradient-to-r from-sky-500 to-orange-400 px-2 py-0.5 text-[10px] font-extrabold text-white">
              {isTr ? "Yerel AI" : "Local AI"}
            </span>
          </motion.div>

          <motion.h1
            initial={prefersReduced ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-balance text-3xl font-extrabold tracking-tight text-ink sm:text-5xl md:text-5xl lg:text-[3.35rem] lg:leading-[1.12]"
          >
            {isTr ? (
              <>
                CV’ni{" "}
                <span className="bg-gradient-to-r from-[#2563eb] via-violet-600 to-orange-500 bg-clip-text text-transparent">
                  ATS ile uyumlu
                </span>{" "}
                hale getir, mülakatlara hazırlan.
              </>
            ) : (
              <>
                Make your resume{" "}
                <span className="bg-gradient-to-r from-[#2563eb] via-violet-600 to-orange-500 bg-clip-text text-transparent">
                  ATS-ready
                </span>
                , then prepare for interviews.
              </>
            )}
          </motion.h1>

          <motion.p
            initial={prefersReduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ink-2 sm:text-lg"
          >
            {isTr
              ? "Şeffaf ATS skoru, aksiyon alınabilir öneriler ve mülakat koçu — analiz tarayıcında çalışır, verilerin cihazından çıkmaz."
              : "Transparent ATS scoring, actionable fixes, and interview prep — analysis runs in your browser so data stays on your device."}
          </motion.p>

          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-9 flex flex-wrap items-center justify-center gap-4"
          >
            <motion.div
              whileHover={prefersReduced ? undefined : bounceHover}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                href="/forge"
                className="cta-glow group relative inline-flex min-h-12 items-center gap-2 overflow-hidden rounded-full bg-[#2563eb] px-9 py-3.5 text-base font-extrabold text-white shadow-xl shadow-blue-500/35 ring-4 ring-blue-500/15"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-violet-600/0 via-violet-600/30 to-orange-500/40 opacity-0 transition-opacity group-hover:opacity-100" />
                <Zap className="relative h-5 w-5" />
                <span className="relative">
                  {isTr ? "Ücretsiz ATS Analizi Yap" : "Run free ATS analysis"}
                </span>
                <ArrowRight className="relative h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>

            <motion.div
              whileHover={prefersReduced ? undefined : bounceHover}
              whileTap={{ scale: 0.97 }}
            >
              <button
                type="button"
                onClick={openDemo}
                className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-slate-300 bg-white px-7 text-sm font-bold text-ink shadow-md transition-all hover:border-blue-400 hover:shadow-lg dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:border-blue-400"
              >
                {isTr ? "Demo’yu Dene" : "Try the demo"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={prefersReduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.32 }}
            className="mt-6 flex flex-col items-center gap-3"
          >
            <div className="flex flex-wrap items-center justify-center gap-3">
              <FilePickButton
                label={isTr ? "CV yükle" : "Upload CV"}
                variant="outline"
                size="sm"
                silentSuccess
                onText={handleResumeText}
              />
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                <Shield className="h-3.5 w-3.5" />
                {isTr
                  ? "Private & Local · ağ çıkışı yok"
                  : "Private & Local · no network upload"}
              </span>
            </div>
            <p className="max-w-md text-center text-[11px] font-medium leading-relaxed text-ink-2">
              {isTr
                ? "Tarayıcıyı kapatsan bile verilerin Local Storage’da kalır. Giriş yapmadan da çalışır."
                : "Your workspace persists in Local Storage even after you close the browser. No login required."}
            </p>
          </motion.div>

          {/* Progress tease card with parallax */}
          <motion.div
            style={{ y: cardsY }}
            initial={prefersReduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42 }}
            className="mx-auto mt-11 max-w-lg rounded-3xl border border-white/80 bg-white/80 p-5 shadow-xl shadow-slate-200/50 backdrop-blur-md dark:border-white/10 dark:bg-white/10 dark:shadow-none"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-violet-500" />
                <span className="text-xs font-bold text-ink">
                  {isTr ? "Kariyer ilerlemesi" : "Career progress"}
                </span>
              </div>
              <span className="rounded-full bg-gradient-to-r from-sky-500/10 to-orange-500/10 px-2.5 py-0.5 text-xs font-extrabold text-violet-700 dark:text-violet-300">
                78%
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#3b82f6] via-violet-500 to-orange-400"
                initial={{ width: prefersReduced ? "78%" : "0%" }}
                animate={{ width: "78%" }}
                transition={{ duration: 1.5, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-between">
              {[
                isTr ? "CV güçlendi" : "CV stronger",
                isTr ? "3 ilan eşleşti" : "3 job matches",
                isTr ? "Mülakat açık" : "Interview unlocked",
              ].map((label, i) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink-2"
                >
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  {label}
                  {i < 2 && <span className="ml-1 hidden text-ink-3 sm:inline">·</span>}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
