"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight, FileUp, Sparkles, Target, FileText,
  ShieldCheck, Mic2, Lock, Globe2, Zap, Star,
} from "lucide-react";
import { useTranslation } from "@/lib/forge/i18n";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: "easeOut" as const },
});

export default function HomePage() {
  const { lang } = useTranslation();
  const isTR = lang === "tr";

  const features = [
    {
      icon: FileUp,
      color: "#7C3AED",
      glow: "rgba(124,58,237,0.25)",
      title: isTR ? "CV Yükle & Çözümle" : "CV Upload & Parse",
      body: isTR
        ? "PDF veya TXT'den anında yapılandırılmış veri — isim, deneyim, beceri, eğitim."
        : "Instant structured extraction from PDF or TXT — name, experience, skills, education.",
    },
    {
      icon: Sparkles,
      color: "#9333EA",
      glow: "rgba(147,51,234,0.25)",
      title: isTR ? "Derin AI Analizi" : "Deep AI Feedback",
      body: isTR
        ? "STAR formatında somut madde yeniden yazımları, güçlü/zayıf yön analizi."
        : "Concrete STAR bullet rewrites, strengths & gap analysis — not generic advice.",
    },
    {
      icon: Target,
      color: "#F472B6",
      glow: "rgba(244,114,182,0.25)",
      title: isTR ? "İş İlanı Eşleştirme" : "Job Matching",
      body: isTR
        ? "CV'ni hedef ilana karşı puanla, eksik keyword'leri bul."
        : "Score your CV against target listings, find missing keywords.",
    },
    {
      icon: FileText,
      color: "#FB7185",
      glow: "rgba(251,113,133,0.25)",
      title: isTR ? "Premium PDF Export" : "Premium PDF Export",
      body: isTR
        ? "Fotoğraflı, modern tek-sütun A4 — ATS'den geçen profesyonel format."
        : "Photo-ready, modern single-column A4 — professional ATS-compliant PDF.",
    },
    {
      icon: ShieldCheck,
      color: "#4ADE80",
      glow: "rgba(74,222,128,0.25)",
      title: isTR ? "ATS Uyumluluk" : "ATS Compatibility",
      body: isTR
        ? "Otomatik tarayıcıların CV'ni nasıl okuduğunu gör, format hatalarını önle."
        : "See exactly how automated screeners parse your CV and block format failures.",
    },
    {
      icon: Mic2,
      color: "#7C3AED",
      glow: "rgba(124,58,237,0.25)",
      title: isTR ? "Mülakat Koçu" : "Interview Coach",
      body: isTR
        ? "Rolüne özel STAR soruları ve cevap taslakları — hazırlıklı gir."
        : "Role-specific STAR questions and answer blueprints — enter prepared.",
    },
  ];

  const stats = [
    { icon: Lock,  label: isTR ? "100% Gizli" : "100% Private",  sub: isTR ? "Veri hiçbir sunucuya gitmiyor" : "Data never leaves your browser" },
    { icon: Zap,   label: isTR ? "0 API Anahtarı" : "0 API Keys", sub: isTR ? "Tamamen tarayıcı tabanlı" : "Fully browser-based" },
    { icon: Globe2,label: "TR / EN",                              sub: isTR ? "Tam iki dil desteği" : "Full bilingual support" },
    { icon: Star,  label: isTR ? "Ücretsiz" : "Free",            sub: isTR ? "Sonsuza kadar" : "Forever" },
  ];

  return (
    <div className="pb-20 overflow-hidden">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative px-4 md:px-8 pt-12 md:pt-20 pb-20">
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 right-[-5%] w-[600px] h-[600px] rounded-full animate-float"
            style={{ background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)" }} />
          <div className="absolute top-60 left-[-10%] w-[400px] h-[400px] rounded-full animate-float"
            style={{ background: "radial-gradient(circle, rgba(244,114,182,0.10) 0%, transparent 70%)", animationDelay: "2s" }} />
          <div className="absolute bottom-0 right-[20%] w-[300px] h-[300px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(74,222,128,0.08) 0%, transparent 70%)" }} />
        </div>

        <div className="max-w-6xl mx-auto relative">
          <motion.div {...fadeUp(0)} className="max-w-3xl">
            {/* Badge */}
            <motion.div {...fadeUp(0.05)} className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border text-xs font-semibold"
              style={{ borderColor: "rgba(124,58,237,0.3)", background: "rgba(124,58,237,0.08)", color: "#7C3AED" }}>
              <Sparkles className="w-3.5 h-3.5" />
              SoftBridge Solutions · CareerForge
            </motion.div>

            {/* Heading */}
            <motion.h1 {...fadeUp(0.1)} className="font-display text-4xl sm:text-5xl md:text-[3.6rem] font-bold tracking-tight leading-[1.05] text-balance">
              {isTR ? (
                <>
                  Kariyerin için<br />
                  <span className="gradient-text">yapay zeka gücü</span>
                </>
              ) : (
                <>
                  AI-powered career tools<br />
                  <span className="gradient-text">built for results</span>
                </>
              )}
            </motion.h1>

            <motion.p {...fadeUp(0.15)} className="mt-5 text-base md:text-lg text-muted-steel max-w-2xl leading-relaxed">
              {isTR
                ? "CV'ni yükle, anında derin analiz al, hedef ilanlara eşleştir ve mülakatlara hazır gir. Tüm veriler tarayıcında, gizli ve ücretsiz."
                : "Upload your CV, get deep AI analysis, match against target roles, and enter interviews prepared. Everything runs in your browser — private and free."}
            </motion.p>

            {/* CTAs */}
            <motion.div {...fadeUp(0.2)} className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/forge"
                className="inline-flex h-12 items-center gap-2 rounded-2xl px-6 text-sm font-bold text-white transition-all hover:scale-105 hover:shadow-2xl"
                style={{
                  background: "linear-gradient(135deg, #6D28D9, #9333EA, #F472B6)",
                  boxShadow: "0 8px 32px rgba(109,40,217,0.4)",
                }}
              >
                {isTR ? "Forge'u Aç" : "Open Forge"} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/coach"
                className="inline-flex h-12 items-center gap-2 rounded-2xl px-6 text-sm font-semibold glass-panel transition-all hover:scale-105 text-star-white"
              >
                {isTR ? "Koçla Konuş" : "Talk to Coach"}
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats strip */}
          <motion.div {...fadeUp(0.3)} className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="glass-panel rounded-2xl p-4 text-center space-y-1.5 hover:scale-105 transition-transform">
                <div className="w-8 h-8 rounded-xl mx-auto flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(244,114,182,0.15))" }}>
                  <s.icon className="w-4 h-4 text-cosmic-teal" />
                </div>
                <p className="font-bold text-sm text-star-white">{s.label}</p>
                <p className="text-[11px] text-muted-steel">{s.sub}</p>
              </div>
            ))}
          </motion.div>

          {/* Feature grid */}
          <motion.div {...fadeUp(0.35)} className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i + 0.3, duration: 0.5, ease: "easeOut" }}
              >
                <Link
                  href="/forge"
                  className="block h-full glass-panel rounded-2xl p-5 transition-all hover:scale-[1.02] group"
                  style={{ "--hover-glow": f.glow } as React.CSSProperties}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${f.glow}`;
                    (e.currentTarget as HTMLElement).style.borderColor = `${f.color}30`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "";
                    (e.currentTarget as HTMLElement).style.borderColor = "";
                  }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                    style={{ background: `${f.color}18` }}>
                    <f.icon className="w-5 h-5" style={{ color: f.color }} />
                  </div>
                  <h2 className="font-semibold text-star-white group-hover:gradient-text transition-colors"
                    style={{ "--f-color": f.color } as React.CSSProperties}>
                    {f.title}
                  </h2>
                  <p className="text-sm text-muted-steel mt-1.5 leading-relaxed">{f.body}</p>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* How it works */}
          <motion.div {...fadeUp(0.5)} className="mt-10 glass-panel rounded-3xl p-6 md:p-10">
            <div className="text-center mb-8">
              <p className="text-[11px] font-bold uppercase tracking-widest text-cosmic-teal mb-2">
                {isTR ? "Nasıl Çalışır?" : "How it works"}
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-star-white">
                {isTR ? "3 adımda kariyerini hızlandır" : "3 steps to accelerate your career"}
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  num: "01",
                  title: isTR ? "CV'ni Yükle" : "Upload Your CV",
                  body: isTR ? "PDF, TXT veya yapıştır — anında yapılandırılmış profil oluşturulur." : "PDF, TXT or paste text — instant structured profile extraction.",
                },
                {
                  num: "02",
                  title: isTR ? "AI Analizi Al" : "Get AI Analysis",
                  body: isTR ? "Derin geri bildirim, keyword boşlukları, STAR yeniden yazımları." : "Deep feedback, keyword gaps, STAR rewrites, match scoring.",
                },
                {
                  num: "03",
                  title: isTR ? "Hazır Gir" : "Enter Prepared",
                  body: isTR ? "Mülakat soruları, kapak mektubu, PDF export — hazır." : "Interview questions, cover letter, PDF export — ready to go.",
                },
              ].map((step) => (
                <div key={step.num} className="flex gap-4">
                  <div className="text-3xl font-black shrink-0 leading-none gradient-text">{step.num}</div>
                  <div>
                    <h3 className="font-bold text-star-white mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-steel leading-relaxed">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
