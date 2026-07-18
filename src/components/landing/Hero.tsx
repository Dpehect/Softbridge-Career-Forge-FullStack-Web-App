"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, FileUp, Shield, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { FilePickButton } from "@/components/FilePickButton";
import { useCareerStore } from "@/store/useCareerStore";
import { cleanExtractedText, parseCV } from "@/lib/forge";
import { useReducedMotionPreference } from "@/motion/useReducedMotionPreference";

export function Hero() {
  const router = useRouter();
  const prefersReduced = useReducedMotionPreference();
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
          summary: `${parsed.name} CV'si içe aktarıldı`,
          payload: parsed,
        });
        toast.success("CV'niz çalışma alanına alındı.");
        router.push("/forge");
      } catch {
        toast.error("Belge okunamadı. Metin içeren PDF veya TXT deneyin.");
      }
    },
    [router, setForgeCvText, setForgeParsedCv, setLastAnalysisMeta, pushForgeHistory]
  );

  const openDemo = useCallback(() => {
    loadDemoProfile();
    toast.success("Demo profili yüklendi.");
    router.push("/dashboard");
  }, [loadDemoProfile, router]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/80 via-white to-white">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-teal-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-32 h-80 w-80 rounded-full bg-amber-200/30 blur-3xl" />

      <div className="relative mx-auto grid w-[min(100%-1.5rem,72rem)] gap-12 py-14 sm:w-[min(100%-2rem,72rem)] sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:py-24">
        <div>
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-3.5 py-1.5 text-xs font-bold text-teal-800 shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            SoftBridge · CareerForge
            <span className="rounded-full bg-teal-700 px-2 py-0.5 text-[10px] font-extrabold text-white">
              Yerel AI
            </span>
          </motion.div>

          <motion.h1
            initial={prefersReduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="max-w-xl text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]"
          >
            CV&apos;nizi eksiksiz bir başvuru sistemine dönüştürün
          </motion.h1>

          <motion.p
            initial={prefersReduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-5 max-w-xl text-base leading-relaxed text-slate-700 sm:text-lg"
          >
            ATS uyumunu analiz edin, deneyimleri kanıta dönüştürün, uygun rolleri
            eşleştirin ve mülakata tek güvenli çalışma alanında hazırlanın.
          </motion.p>

          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link
              href="/forge"
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-teal-700 px-7 text-sm font-bold text-white shadow-lg shadow-teal-700/25 transition hover:bg-teal-800 hover:shadow-xl active:scale-[0.98]"
            >
              <FileUp className="h-4 w-4" />
              CV Yükle
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={openDemo}
              className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-slate-300 bg-white px-7 text-sm font-bold text-slate-900 shadow-sm transition hover:border-amber-400 hover:bg-amber-50 active:scale-[0.98]"
            >
              Demo Profili İncele
            </button>
          </motion.div>

          <motion.div
            initial={prefersReduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.22 }}
            className="mt-5 flex flex-wrap items-center gap-3"
          >
            <FilePickButton
              label="Dosya seç"
              variant="outline"
              size="sm"
              silentSuccess
              onText={handleResumeText}
            />
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800">
              <Shield className="h-3.5 w-3.5" />
              Private &amp; Local · veriler cihazında kalır
            </span>
          </motion.div>

          <ul className="mt-8 grid gap-2 sm:grid-cols-2">
            {[
              "Şeffaf ATS skoru (6 kategori)",
              "Aksiyon alınabilir öneriler",
              "İş eşleştirme & pipeline",
              "Mülakat koçu (STAR)",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-sm font-medium text-slate-700"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-600" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Product mockup */}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.12, duration: 0.5 }}
          className="relative"
        >
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-teal-200/50 via-white to-amber-100/60 blur-xl" />
          <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-white shadow-2xl shadow-teal-900/10">
            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span className="ml-2 text-xs font-semibold text-slate-500">
                CareerForge · Çalışma Alanı
              </span>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-[1fr_0.85fr] sm:p-6">
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-teal-50 to-white p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
                    ATS skoru
                  </p>
                  <div className="mt-2 flex items-end gap-2">
                    <span className="text-4xl font-bold tracking-tight text-slate-900">86</span>
                    <span className="pb-1 text-sm font-semibold text-slate-500">/100</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full w-[86%] rounded-full bg-gradient-to-r from-teal-600 to-teal-400" />
                  </div>
                  <p className="mt-2 text-xs font-medium text-slate-600">
                    +14 puan için anahtar kelime &amp; metrik ekleyin
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Sonraki adım
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    Deneyimi ölçülebilir kanıta çevir
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    “Proje yürüttüm” → “Checkout dönüşümünü %18 artırdım”
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { role: "Senior Frontend", match: 92 },
                  { role: "Product Engineer", match: 84 },
                  { role: "Full-Stack", match: 78 },
                ].map((job) => (
                  <div
                    key={job.role}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 px-3.5 py-3"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-900">{job.role}</p>
                      <p className="text-[11px] font-medium text-slate-500">Rol uyumu</p>
                    </div>
                    <span className="rounded-full bg-teal-100 px-2.5 py-1 text-xs font-bold text-teal-800">
                      %{job.match}
                    </span>
                  </div>
                ))}
                <div className="rounded-2xl bg-gradient-to-r from-teal-700 to-teal-600 p-4 text-white shadow-lg shadow-teal-700/20">
                  <p className="text-xs font-bold text-teal-100">Mülakat koçu</p>
                  <p className="mt-1 text-sm font-semibold leading-snug">
                    STAR formatında 3 soru hazır — prova etmeye hazır mısın?
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
