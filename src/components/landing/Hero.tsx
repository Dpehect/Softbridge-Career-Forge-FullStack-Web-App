"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, FileUp, Shield } from "lucide-react";
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
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F0FDFA] via-white to-white">
      {/* Soft ambient blobs — TealHQ-like airy canvas */}
      <div className="pointer-events-none absolute -left-32 top-0 h-[28rem] w-[28rem] rounded-full bg-[#99F6E4]/35 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-24 h-[32rem] w-[32rem] rounded-full bg-[#FDE68A]/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[#5EEAD4]/20 blur-3xl" />

      <div className="relative mx-auto grid w-[min(100%-1.25rem,75rem)] gap-16 py-16 sm:w-[min(100%-2.5rem,75rem)] sm:py-24 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-20 lg:py-28">
        <div className="max-w-2xl">
          <motion.p
            initial={prefersReduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-white/90 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#0F766E] shadow-sm"
          >
            SoftBridge · CareerForge
          </motion.p>

          <motion.h1
            initial={prefersReduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.5 }}
            className="text-balance text-[2.35rem] font-bold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.75rem]"
          >
            CV&apos;nizi eksiksiz bir başvuru sistemine dönüştürün
          </motion.h1>

          <motion.p
            initial={prefersReduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.45 }}
            className="mt-7 max-w-xl text-lg leading-relaxed text-slate-700 sm:text-xl sm:leading-relaxed"
          >
            ATS uyumunu analiz edin, deneyimleri kanıta dönüştürün, uygun rolleri
            eşleştirin ve mülakata tek güvenli çalışma alanında hazırlanın.
          </motion.p>

          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Link
              href="/forge"
              className="inline-flex min-h-[3.25rem] items-center gap-2.5 rounded-full bg-[#0F766E] px-8 text-base font-bold text-white shadow-xl shadow-teal-800/25 transition hover:scale-[1.03] hover:bg-[#0D9488] hover:shadow-2xl active:scale-[0.98]"
            >
              <FileUp className="h-5 w-5" />
              CV Yükle
              <ArrowRight className="h-5 w-5" />
            </Link>
            <button
              type="button"
              onClick={openDemo}
              className="inline-flex min-h-[3.25rem] items-center gap-2 rounded-full border-2 border-slate-300 bg-white px-8 text-base font-bold text-slate-900 shadow-sm transition hover:scale-[1.03] hover:border-[#FBBF24] hover:bg-amber-50 active:scale-[0.98]"
            >
              Demo Profili İncele
            </button>
          </motion.div>

          <motion.div
            initial={prefersReduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.22 }}
            className="mt-6 flex flex-wrap items-center gap-4"
          >
            <FilePickButton
              label="Dosya seç (PDF / TXT)"
              variant="outline"
              size="sm"
              silentSuccess
              onText={handleResumeText}
            />
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F766E]">
              <Shield className="h-4 w-4" />
              Private &amp; Local · veriler cihazınızda kalır
            </span>
          </motion.div>

          <ul className="mt-12 grid gap-3 sm:grid-cols-2">
            {[
              "Şeffaf ATS skoru (6 kategori)",
              "Aksiyon alınabilir öneriler",
              "İş eşleştirme & pipeline",
              "Mülakat koçu (STAR)",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-[0.9375rem] font-medium text-slate-700">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-[#14B8A6]" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Dashboard / CV mockup */}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.14, duration: 0.55 }}
          className="relative lg:justify-self-end"
        >
          <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-[#5EEAD4]/40 via-white to-[#FDE68A]/50 blur-2xl" />
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white bg-white shadow-2xl shadow-teal-900/15 ring-1 ring-slate-900/5">
            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/90 px-5 py-3.5">
              <span className="h-3 w-3 rounded-full bg-rose-400" />
              <span className="h-3 w-3 rounded-full bg-amber-400" />
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
              <span className="ml-3 text-xs font-semibold text-slate-500">
                CareerForge · Çalışma Alanı
              </span>
            </div>

            <div className="space-y-4 bg-gradient-to-br from-white via-[#F0FDFA]/40 to-white p-5 sm:p-6">
              <div className="rounded-3xl border border-teal-100 bg-gradient-to-br from-[#F0FDFA] to-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0F766E]">
                      ATS skoru
                    </p>
                    <div className="mt-2 flex items-end gap-1.5">
                      <span className="text-5xl font-bold tracking-tight text-slate-900">86</span>
                      <span className="pb-1.5 text-sm font-semibold text-slate-500">/100</span>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#FBBF24]/90 px-3 py-1 text-[11px] font-extrabold text-slate-900">
                    +14 puan
                  </span>
                </div>
                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-200/90">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#0F766E] to-[#14B8A6]"
                    initial={{ width: prefersReduced ? "86%" : "0%" }}
                    animate={{ width: "86%" }}
                    transition={{ duration: 1.1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <p className="mt-3 text-sm font-medium text-slate-600">
                  Anahtar kelime ve metrik ekleyerek 100&apos;e yaklaşın
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Sonraki adım
                  </p>
                  <p className="mt-2 text-sm font-bold text-slate-900">
                    Deneyimi kanıta çevir
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                    “Proje yürüttüm” → “Dönüşümü %18 artırdım”
                  </p>
                </div>
                <div className="rounded-3xl bg-gradient-to-br from-[#0F766E] to-[#0D9488] p-4 text-white shadow-lg shadow-teal-800/20">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-teal-100">
                    Mülakat koçu
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-snug">
                    STAR formatında 3 soru hazır — prova et
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {[
                  { role: "Senior Frontend Engineer", match: 92 },
                  { role: "Product Engineer", match: 84 },
                  { role: "Full-Stack Developer", match: 78 },
                ].map((job) => (
                  <div
                    key={job.role}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-900">{job.role}</p>
                      <p className="text-[11px] font-medium text-slate-500">Rol uyumu</p>
                    </div>
                    <span className="rounded-full bg-[#CCFBF1] px-3 py-1 text-xs font-bold text-[#0F766E]">
                      %{job.match}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
