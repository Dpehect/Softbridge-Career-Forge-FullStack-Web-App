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
  Check,
  AlertTriangle,
  FileSearch,
} from "lucide-react";
import { useState } from "react";
import { CvDropZone } from "@/components/CvDropZone";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] as const },
});

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"before" | "after">("after");

  const features = [
    {
      icon: FileUp,
      color: "#8B5CF6",
      title: "Anında CV Ayrıştırma",
      body: "PDF veya TXT belgenizdeki isim, başlık, yetkinlik ve deneyimleri saniyeler içinde yapılandırın.",
    },
    {
      icon: Sparkles,
      color: "#D946EF",
      title: "STAR Metrik Önerileri",
      body: "Pasif eylemleri, ölçülebilir iş sonuçları ve güçlü eylem fiilleriyle otomatik olarak değiştirin.",
    },
    {
      icon: Target,
      color: "#EC4899",
      title: "Rol Eşleştirme Motoru",
      body: "Hedeflediğiniz iş tanımına karşı anlamsal cosine-similarity skoru ve eksik anahtar kelime listesi alın.",
    },
    {
      icon: FileText,
      color: "#F43F5E",
      title: "ATS Uyumlu PDF Dışa Aktarım",
      body: "Tek sütunlu, robotlar tarafından hatasız okunan, sade ve premium A4 formatında CV indirin.",
    },
    {
      icon: ShieldCheck,
      color: "#10B981",
      title: "Sürüm Geçmişi & Yedekleme",
      body: "Farklı şirket ve pozisyon başvurularınız için oluşturduğunuz tüm alternatif özgeçmişleri yerel olarak yedekleyin.",
    },
    {
      icon: Mic2,
      color: "#6366F1",
      title: "Kişisel Kariyer Koçu",
      body: "Yapay zeka mülakat simülatörüyle özgeçmişinize özel STAR temelli cevap iskeletleri hazırlayın.",
    },
  ];

  return (
    <div className="pb-24 overflow-hidden mesh-bg">
      <section className="relative px-4 md:px-8 pt-10 md:pt-16 pb-8">
        <div className="max-w-7xl mx-auto relative space-y-24 py-10 md:py-16">
          
          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
            <motion.div {...fadeUp(0)} className="space-y-6 text-left">
              <motion.div
                {...fadeUp(0.05)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-200/60 bg-purple-50/80 text-xs font-semibold text-purple-700 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-[#C084FC]" />
                SoftBridge Solutions · CareerForge 2.0
              </motion.div>

              <motion.h1
                {...fadeUp(0.1)}
                className="font-display text-4xl sm:text-5xl md:text-[3.25rem] font-bold tracking-tight leading-[1.05] text-slate-900 dark:text-white"
              >
                Özgeçmişinizi <span className="gradient-text">ATS Robotları</span> için optimize edin.
              </motion.h1>

              <motion.p
                {...fadeUp(0.15)}
                className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed"
              >
                Tarayıcı içi çalışan yapay zeka ile kişisel verilerinizi sunuculara göndermeden saniyeler içinde analiz edin, eksik yetenekleri kapatın ve işe alım oranınızı artırın.
              </motion.p>

              {/* Privacy Shield */}
              <motion.div
                {...fadeUp(0.18)}
                className="inline-flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-xs font-bold shadow-sm dark:border-emerald-500/20 dark:bg-emerald-950/20"
              >
                <span className="inline-flex items-center gap-1.5 text-emerald-950 dark:text-emerald-300">
                  <Lock className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  🔐 Cihaz Üzerinde Gizli Analiz:
                </span>
                <span className="text-slate-600 dark:text-emerald-400/90 font-medium">
                  Hiçbir veri sunucumuza yüklenmez, işleme tamamen tarayıcınızda yapılır.
                </span>
              </motion.div>

              <motion.div {...fadeUp(0.22)} className="flex flex-wrap gap-3">
                <Link
                  href="/forge"
                  className="inline-flex h-11 items-center gap-1.5 rounded-full px-6 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg, #6B21A8, #A855F7, #F97316)",
                    boxShadow: "0 4px 12px rgba(107, 33, 168, 0.25)",
                  }}
                >
                  Hemen Analiz Et <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex h-11 items-center rounded-full px-5 text-sm font-semibold border border-slate-200 text-slate-800 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-white/5 transition-all"
                >
                  Kariyer Kokpiti
                </Link>
              </motion.div>
            </motion.div>

            {/* Drop Zone Area */}
            <motion.div {...fadeUp(0.25)} className="w-full">
              <div className="glass-panel rounded-3xl p-2 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl relative">
                <div className="absolute -top-3 -right-3 bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg">
                  Free & local
                </div>
                <CvDropZone redirectTo="/forge" className="border-0 shadow-none bg-transparent" />
              </div>
            </motion.div>
          </div>

          {/* Interactive Feature: Before vs After ATS Parser */}
          <motion.div {...fadeUp(0.3)} className="glass-panel rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5 dark:border-white/5">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Yapay Zeka ile ATS Optimizasyon Önizlemesi
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Özgeçmişinizin ATS taramalarından nasıl geçtiğini ve CareerForge&apos;un bunu nasıl düzelttiğini görün.
                </p>
              </div>
              <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl shrink-0">
                <button
                  onClick={() => setActiveTab("before")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "before"
                      ? "bg-amber-500 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Öncesi (Klasik)
                </button>
                <button
                  onClick={() => setActiveTab("after")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "after"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Sonrası (CareerForge)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 items-start">
              {/* Comparison display */}
              <div className="space-y-4">
                <div className="rounded-2xl border p-5 bg-white/60 dark:bg-slate-950/40 relative">
                  <span
                    className={`absolute top-4 right-4 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                      activeTab === "before"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
                    }`}
                  >
                    {activeTab === "before" ? "ATS Sorunlu" : "ATS Uyumlu"}
                  </span>
                  
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-3">Deneyim Detayı</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Software Developer · SoftBridge Solutions</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Haziran 2023 - Devam Ediyor</p>
                    </div>

                    {activeTab === "before" ? (
                      <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        <div className="flex gap-2 items-start text-amber-600 dark:text-amber-400 bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold">Eylem Fiili & Sonuç Eksik:</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              &quot;React kullanarak web projeleri geliştirdim ve sayfaların hızlı çalışmasını sağladım.&quot;
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        <div className="flex gap-2 items-start text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">
                          <Check className="w-4 h-4 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold">Eylem + Teknoloji + Ölçülebilir Başarı (STAR):</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              &quot;React ve Next.js tabanlı e-ticaret sepet yapısını yeniden mimari ederek sayfa açılış hızını %42 oranında optimize ettim; bu sayede sepet dönüşümlerini %3.1 artırdım.&quot;
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300">
                    Eşleşen Yetenekler: React, Next.js, Web Optimizasyonu
                  </span>
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300">
                    Format: Tek Sütun Standart A4
                  </span>
                </div>
              </div>

              {/* Stats Panel */}
              <div className="space-y-4 rounded-2xl border p-5 bg-slate-50 dark:bg-white/[0.02]">
                <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                  ATS Analiz Metrikleri
                </h3>

                <div className="space-y-4">
                  {/* ATS Score */}
                  <div>
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-xs text-slate-500 font-semibold">ATS Uyumluluk Skoru</span>
                      <span
                        className={`text-sm font-black ${
                          activeTab === "before" ? "text-amber-500" : "text-emerald-500"
                        }`}
                      >
                        {activeTab === "before" ? "%38" : "%94"}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          activeTab === "before" ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: activeTab === "before" ? "38%" : "94%" }}
                      />
                    </div>
                  </div>

                  {/* Keyword coverage */}
                  <div>
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-xs text-slate-500 font-semibold">Anahtar Kelime Eşleşmesi</span>
                      <span
                        className={`text-sm font-black ${
                          activeTab === "before" ? "text-amber-500" : "text-emerald-500"
                        }`}
                      >
                        {activeTab === "before" ? "%25" : "%88"}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          activeTab === "before" ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: activeTab === "before" ? "25%" : "88%" }}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-3 mt-3 dark:border-white/5">
                  <p className="text-[11px] text-slate-500 leading-normal">
                    {activeTab === "before"
                      ? "❌ Robotlar bu CV'yi tararken sayısal veri ve güçlü eylem fiilleri bulamıyor. Puanlama düşük."
                      : "✅ ATS optimizasyonu tam. Sayısal veri odaklı ve yapısal etiketlere uygun format."}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick value strip */}
          <motion.div {...fadeUp(0.35)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: ShieldCheck, label: "%100 Gizlilik Güvencesi", sub: "Kişisel verileriniz tarayıcınızda işlenir" },
              { icon: Zap, label: "Sıfır Bulut Bağımlılığı", sub: "İnternetsiz veya sunucusuz anında çalışma" },
              { icon: FileSearch, label: "ATS Uyum Kontrolü", sub: "Eksik yetenek analizi ve anahtar kelime eşleştirme" },
              { icon: Star, label: "Profesyonel Dışa Aktarım", sub: "Robotlar tarafından taranabilir PDF çıktısı" },
            ].map((item) => (
              <div key={item.label} className="glass-panel p-5 text-center space-y-2 rounded-2xl hover:scale-[1.02] transition-transform">
                <item.icon className="w-5 h-5 text-purple-600 dark:text-[#C084FC] mx-auto" />
                <p className="font-extrabold tracking-tight text-sm text-slate-900 dark:text-white">{item.label}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{item.sub}</p>
              </div>
            ))}
          </motion.div>

          {/* Feature Grid */}
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                İş Arama Sürecini Kolaylaştıran Araçlar
              </h2>
              <p className="text-sm text-slate-500">
                CareerForge, CV hazırlamaktan mülakat hazırlığına kadar ihtiyacınız olan tüm adımları yerel cihazınızda çözümler.
              </p>
            </div>

            <motion.div {...fadeUp(0.4)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((f) => (
                <Link
                  key={f.title}
                  href="/forge"
                  className="glass-panel p-6 transition-all hover:scale-[1.02] hover:-translate-y-0.5 duration-200 group block rounded-3xl"
                >
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: `${f.color}18` }}
                  >
                    <f.icon className="w-5 h-5" style={{ color: f.color }} />
                  </div>
                  <h3 className="font-bold tracking-tight text-slate-900 dark:text-white">{f.title}</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{f.body}</p>
                </Link>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
