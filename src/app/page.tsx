"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  FileUp,
  Sparkles,
  Target,
  FileText,
  Briefcase,
  ShieldCheck,
  Mic2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/forge/i18n";

export default function HomePage() {
  const { t, lang } = useTranslation();

  const features = [
    {
      icon: FileUp,
      title: lang === "tr" ? "CV Yükle & Çözümle" : "CV Upload & Parse",
      body: lang === "tr" 
        ? "PDF veya TXT dosyalarından temiz, yapılandırılmış metin ayrıştırma." 
        : "Extract clean, structured attributes from PDF or TXT resume files.",
      href: "/forge",
    },
    {
      icon: Sparkles,
      title: lang === "tr" ? "Derinlemesine Analiz" : "Deep Feedback",
      body: lang === "tr" 
        ? "Yapay zeka koçu ile güçlü/zayıf yönler ve somut kelime iyileştirmeleri." 
        : "Review strengths, gaps, and precise sentence refactoring guidance.",
      href: "/forge",
    },
    {
      icon: Target,
      title: lang === "tr" ? "İş İlanı Eşleştirme" : "Job Matcher",
      body: lang === "tr" 
        ? "CV'nizi hedef iş ilanlarıyla kıyaslayıp uyumluluk skoru hesaplayın." 
        : "Compare CV profile metrics directly against target job descriptions.",
      href: "/forge",
    },
    {
      icon: FileText,
      title: lang === "tr" ? "Premium PDF Export" : "Premium PDF Export",
      body: lang === "tr" 
        ? "Fotoğraflı, modern ve taranabilir A4 formatında PDF belgesi indirin." 
        : "Download elegant, single-column A4 resume templates with profile photos.",
      href: "/forge",
    },
    {
      icon: ShieldCheck,
      title: lang === "tr" ? "ATS Kontrol Cihazı" : "ATS Compatibility",
      body: lang === "tr" 
        ? "Robotların CV'nizi nasıl okuduğunu görün, biçimlendirme hatalarını önleyin." 
        : "Avoid layout parser failure blocks by auditing structure filters.",
      href: "/forge",
    },
    {
      icon: Mic2,
      title: lang === "tr" ? "Mülakat Hazırlığı" : "Interview Coach",
      body: lang === "tr" 
        ? "Rolünüze özel hazırlanan mülakat soruları ve STAR şablonlu cevaplar." 
        : "Simulate practice runs with customized behavioral question sets.",
      href: "/forge",
    },
  ];

  return (
    <div className="pb-20">
      <section className="relative overflow-hidden px-4 md:px-8 pt-12 md:pt-20 pb-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 right-[-8%] w-[520px] h-[520px] rounded-full bg-cosmic-teal/10 blur-3xl" />
          <div className="absolute top-40 left-[-12%] w-[380px] h-[380px] rounded-full bg-sunset-coral/8 blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="max-w-3xl"
          >
            <Badge variant="accent" className="mb-5">
              SoftBridge Solutions · CareerForge
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl md:text-[3.5rem] font-semibold tracking-tight text-balance leading-[1.05]">
              {t("heroTitle")}
            </h1>
            <p className="mt-5 text-base md:text-lg text-muted-steel max-w-2xl leading-relaxed">
              {t("heroSubtitle")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/forge"
                className="inline-flex h-12 items-center gap-2 rounded-2xl px-6 text-sm font-semibold bg-cosmic-teal text-midnight-void shadow-[0_14px_36px_rgba(217,72,32,0.28)] hover:bg-sunset-coral transition-colors"
              >
                {t("startForge")} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/resume"
                className="inline-flex h-12 items-center gap-2 rounded-2xl px-6 text-sm font-semibold border border-black/10 bg-panel-elevated hover:border-cosmic-teal/30 transition-colors text-star-white"
              >
                {t("openWorkspace")}
              </Link>
            </div>
          </motion.div>

          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i, duration: 0.4 }}
              >
                <Link
                  href={f.href}
                  className="block h-full glass-panel rounded-2xl p-5 hover:border-cosmic-teal/25 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-cosmic-teal/10 text-cosmic-teal flex items-center justify-center mb-3">
                    <f.icon className="w-5 h-5" />
                  </div>
                  <h2 className="font-semibold group-hover:text-cosmic-teal transition-colors text-star-white">
                    {f.title}
                  </h2>
                  <p className="text-sm text-muted-steel mt-1.5 leading-relaxed">{f.body}</p>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 glass-panel rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-cosmic-teal mb-2">
                {t("howItWorks")}
              </p>
              <h2 className="font-display text-2xl font-semibold text-star-white">{t("threeSteps")}</h2>
              <ol className="mt-4 space-y-2 text-sm text-muted-steel">
                <li>{t("step1")}</li>
                <li>{t("step2")}</li>
                <li>{t("step3")}</li>
              </ol>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <Link
                href="/dashboard"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold bg-star-white text-midnight-void hover:bg-cosmic-teal hover:text-midnight-void transition-colors"
              >
                <Briefcase className="w-4 h-4" /> {t("navDashboard")}
              </Link>
              <Link
                href="/forge"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold border border-black/10 hover:border-cosmic-teal/30 transition-colors text-star-white"
              >
                Go to Forge
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
