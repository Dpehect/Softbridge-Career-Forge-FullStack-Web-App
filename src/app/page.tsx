"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  FileUp,
  Sparkles,
  Target,
  FileText,
  ShieldCheck,
  Mic2,
  Lock,
  Zap,
  Star,
  Cpu,
  PenLine,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CvDropZone } from "@/components/CvDropZone";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: "easeOut" as const },
});

const glassCard =
  "rounded-2xl border border-white/10 bg-white/60 backdrop-blur-sm shadow-sm dark:bg-white/5 dark:border-white/10";

const STEPS = [
  {
    n: 1,
    title: "CV Yükle",
    body: "PDF veya metin olarak özgeçmişinizi ekleyin.",
    href: "/forge",
    icon: FileUp,
  },
  {
    n: 2,
    title: "Analiz Al",
    body: "ATS puanını ve eksik yetenekleri anında görün.",
    href: "/forge",
    icon: Sparkles,
  },
  {
    n: 3,
    title: "İyileştir",
    body: "Önerilen yetenekleri ekleyin, ilanlara hazır olun.",
    href: "/resume",
    icon: PenLine,
  },
] as const;

export default function HomePage() {
  const features = [
    {
      icon: FileUp,
      color: "#7C3AED",
      title: "CV Yükle & Analiz Et",
      body: "PDF veya TXT'den anında yapılandırılmış profil — isim, deneyim, beceri, eğitim.",
    },
    {
      icon: Sparkles,
      color: "#9333EA",
      title: "Sonuç Odaklı Geri Bildirim",
      body: "Sadece puan değil: ne kaybediyorsun, ne kazanırsın ve sıradaki 3 adım.",
    },
    {
      icon: Target,
      color: "#F472B6",
      title: "Hedef & Eşleştirme",
      body: "Hedef rolünü seç, ilanlara karşı skor al, eksik anahtar kelimeleri kapat.",
    },
    {
      icon: FileText,
      color: "#FB7185",
      title: "Premium PDF Export",
      body: "Tek sütun, ATS dostu A4 — profesyonel ve tarayıcıda gizli.",
    },
    {
      icon: ShieldCheck,
      color: "#4ADE80",
      title: "ATS Pro",
      body: "Robotları geçmek için optimize edilmiş yapı ve anahtar kelime rehberi.",
    },
    {
      icon: Mic2,
      color: "#7C3AED",
      title: "AI Kariyer Danışmanı",
      body: "Özgeçmişinle sohbet et — STAR cevap şablonları ve mülakat hazırlığı.",
    },
  ];

  return (
    <div className="pb-24 overflow-hidden">
      <section className="relative px-4 md:px-8 pt-10 md:pt-16 pb-8">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute -top-24 right-[-5%] w-[600px] h-[600px] rounded-full animate-float"
            style={{
              background:
                "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="max-w-6xl mx-auto relative space-y-20 py-20">
          {/* Hero — ne işe yarar? */}
          <motion.div {...fadeUp(0)} className="max-w-3xl space-y-6">
            <motion.div
              {...fadeUp(0.05)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-200/60 bg-indigo-50/80 text-xs font-semibold text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300"
            >
              <Sparkles className="w-3.5 h-3.5" />
              SoftBridge Solutions · Kariyer Asistanı
            </motion.div>

            <motion.h1
              {...fadeUp(0.1)}
              className="font-display text-4xl sm:text-5xl md:text-[3.05rem] font-bold tracking-tight leading-[1.1] text-balance text-slate-900 dark:text-white"
            >
              Özgeçmişinizi 3 saniyede{" "}
              <span className="gradient-text">ATS dostu</span> hale getirin.
            </motion.h1>

            <motion.p
              {...fadeUp(0.15)}
              className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed"
            >
              Kariyer hedeflerinize uygun analiz, eksik yetenek önerileri ve net sonraki adımlar —
              saniyeler içinde. Verileriniz cihazınızdan asla çıkmaz.
            </motion.p>

            {/* Güven rozeti — en büyük USP */}
            <motion.div
              {...fadeUp(0.18)}
              className="inline-flex flex-col sm:flex-row sm:items-center gap-2 rounded-2xl border-2 border-emerald-500/50 bg-emerald-50 px-5 py-3.5 text-sm font-bold text-emerald-950 shadow-md dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-100"
            >
              <span className="inline-flex items-center gap-2">
                <Lock className="w-5 h-5 shrink-0" />
                🔐 Verileriniz Asla Buluta Çıkmaz.
              </span>
              <span className="font-semibold opacity-90">
                %100 Yerel · %100 Güvenli
              </span>
            </motion.div>
          </motion.div>

          {/* Primary PLG: drag & drop — first thing users see to act */}
          <motion.div {...fadeUp(0.22)} className="max-w-3xl">
            <CvDropZone redirectTo="/forge" />
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/forge"
                className="inline-flex h-11 items-center gap-2 rounded-full border-2 border-slate-200 px-6 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
              >
                Analiz çalışma alanına geç <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/resume"
                className="inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                Özgeçmişim
              </Link>
            </div>
          </motion.div>

          {/* Yol haritası — CV Yükle → Analiz Al → İyileştir */}
          <motion.div {...fadeUp(0.28)} className="space-y-6 py-8">
            <div className="text-center space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-purple-600">
                Yol haritası
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tighter text-star-white">
                1. CV Yükle → 2. Analiz Al → 3. İyileştir
              </h2>
              <p className="text-sm text-slate-500 max-w-lg mx-auto">
                “Şimdi ne yapmalıyım?” sorusu kalmaz — adımlar sizi hedefe götürür.
              </p>
            </div>

            <div className="relative grid md:grid-cols-3 gap-4">
              <div
                className="hidden md:block absolute top-10 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-purple-300 via-purple-400 to-emerald-400 opacity-60"
                aria-hidden
              />
              {STEPS.map((step, idx) => (
                <Link
                  key={step.n}
                  href={step.href}
                  className={`${glassCard} relative p-6 space-y-3 transition-transform hover:scale-[1.02] group`}
                >
                  <div className="relative z-10 flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl text-white flex items-center justify-center font-extrabold text-lg shadow-sm"
                      style={{
                        background: "linear-gradient(135deg, #6B21A8, #A855F7)",
                      }}
                    >
                      {step.n}
                    </div>
                    <step.icon className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-extrabold tracking-tighter text-lg text-star-white">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.body}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600">
                    Bu adıma git <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Değer önerisi */}
          <motion.div {...fadeUp(0.32)} className="grid grid-cols-1 md:grid-cols-3 gap-4 py-8">
            {[
              {
                icon: Lock,
                title: "Gizlilik Öncelikli",
                body: "Verileriniz yerel cihazınızda işlenir — sunucuya gitmez.",
                color: "#7C3AED",
              },
              {
                icon: ShieldCheck,
                title: "ATS Pro",
                body: "Robotları geçmek için optimize edilmiştir.",
                color: "#F97316",
              },
              {
                icon: Cpu,
                title: "Yerel AI Gücü",
                body: "İnternetsiz, 7/24 kesintisiz çalışır (Ollama).",
                color: "#4ADE80",
              },
            ].map((v) => (
              <div key={v.title} className={`${glassCard} p-6 space-y-3`}>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${v.color}18` }}
                >
                  <v.icon className="w-5 h-5" style={{ color: v.color }} />
                </div>
                <h3 className="font-extrabold tracking-tighter text-star-white">{v.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{v.body}</p>
              </div>
            ))}
          </motion.div>

          {/* Trust strip */}
          <motion.div {...fadeUp(0.35)} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Lock, label: "%100 Gizli", sub: "Veri tarayıcınızda kalır" },
              { icon: Zap, label: "0 zorunlu API", sub: "Yerel / tarayıcı motoru" },
              { icon: Check, label: "Sonuç odaklı", sub: "Puan + aksiyon + yol" },
              { icon: Star, label: "Ücretsiz", sub: "SoftBridge CareerForge" },
            ].map((s) => (
              <div key={s.label} className={`${glassCard} p-5 text-center space-y-2`}>
                <s.icon className="w-4 h-4 text-purple-600 mx-auto" />
                <p className="font-extrabold tracking-tighter text-sm text-star-white">{s.label}</p>
                <p className="text-[11px] text-slate-500">{s.sub}</p>
              </div>
            ))}
          </motion.div>

          {/* Features */}
          <motion.div {...fadeUp(0.4)} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <Link
                key={f.title}
                href="/forge"
                className={`${glassCard} p-6 transition-transform hover:scale-[1.02] group block`}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${f.color}18` }}
                >
                  <f.icon className="w-5 h-5" style={{ color: f.color }} />
                </div>
                <h2 className="font-extrabold tracking-tighter text-star-white">{f.title}</h2>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">{f.body}</p>
              </Link>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
