"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  FileSearch,
  Check,
  AlertTriangle,
  Award,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { useState } from "react";
import { CvDropZone } from "@/components/CvDropZone";
import { useCareerStore } from "@/store/useCareerStore";
import { toast } from "sonner";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] as const },
});

export default function HomePage() {
  const router = useRouter();
  const { loadDemoProfile } = useCareerStore();
  const [activeTab, setActiveTab] = useState<"before" | "after">("after");

  const startDemoMode = () => {
    loadDemoProfile();
    toast.success("Recruiter Demo Modu Yüklendi! Yusuf Demir adayı için tüm veriler hazırlandı.");
    router.push("/dashboard");
  };

  const steps = [
    { num: "01", title: "Özgeçmiş Yükle", desc: "PDF veya TXT belgenizi tarayıcınıza bırakın." },
    { num: "02", title: "ATS Skor Analizi", desc: "Anlık anahtar kelime eşleşmesini ve eksikleri tespit edin." },
    { num: "03", title: "Canlı Editör", desc: "Tek tıkla eksik becerileri ekleyip içeriği güçlendirin." },
    { num: "04", title: "İş & Mülakat Koçu", desc: "Rol eşleşmelerini kontrol edip simülatör ile hazırlanın." },
  ];

  const faqs = [
    { q: "Verilerim güvende mi?", a: "Evet. CareerForge %100 yerel (local-first) çalışacak şekilde tasarlanmıştır. Yüklediğiniz dosyalar veya girdiğiniz bilgiler sunuculara gönderilmez." },
    { q: "ATS skoru nasıl hesaplanıyor?", a: "CV'nizdeki deneyimler ile hedef iş ilanındaki etiketler arasındaki anlamsal eşleşmeler cosine-similarity algoritmasıyla yerel cihazınızda hesaplanır." },
    { q: "Uygulamayı kullanmak ücretli mi?", a: "Hayır. CareerForge tamamen açık kaynak kodlu ve ücretsizdir. Bulut sunucu maliyetleri olmadığı için sınırsızca ücretsiz kullanabilirsiniz." },
  ];

  return (
    <div className="pb-24 overflow-hidden bg-[#F8FAFC] dark:bg-[#020617] text-slate-800 dark:text-slate-200">
      
      {/* 1. Hero & Resume Dropzone / Demo Mode Trigger */}
      <section className="relative px-4 md:px-8 pt-12 md:pt-20 pb-16 border-b border-slate-200/60 dark:border-white/5">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
            
            {/* Left Column Hero Pitch */}
            <motion.div {...fadeUp(0)} className="space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-xs font-bold text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
                <Sparkles className="w-3.5 h-3.5" />
                Next-Gen ATS Optimizer
              </div>

              <h1 className="font-display text-4xl sm:text-5xl md:text-[3.5rem] font-extrabold tracking-tight leading-[1.05] text-slate-900 dark:text-white">
                Özgeçmişinizi <span className="text-blue-600 dark:text-blue-400">ATS Robotları</span> için Güçlendirin.
              </h1>

              <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                Yapay zeka ile kişisel verilerinizi sunuculara göndermeden saniyeler içinde analiz edin, eksik yetenekleri tek tıkla kapatın ve işe alım oranınızı artırın.
              </p>

              {/* Privacy Shield */}
              <div className="inline-flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-emerald-250 bg-emerald-50/50 dark:bg-emerald-950/10 dark:border-emerald-500/20 px-4 py-3 text-xs font-bold shadow-sm">
                <span className="inline-flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  Cihaz Üzerinde Gizli Analiz:
                </span>
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  Hiçbir veri sunucuya yüklenmez, işlemler tamamen tarayıcınızda gerçekleşir.
                </span>
              </div>

              {/* CTAs including recruiter instant demo mode */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={startDemoMode}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-blue-600 text-white font-bold px-6 text-sm hover:bg-blue-700 transition-all hover:scale-[1.02] shadow-lg shadow-blue-500/15"
                >
                  Recruiter Demo Modu <ArrowRight className="w-4 h-4" />
                </button>
                <Link
                  href="/forge"
                  className="inline-flex h-11 items-center rounded-full px-5 text-sm font-semibold border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-white/5 transition-all"
                >
                  CV Analiz Aracı
                </Link>
              </div>
            </motion.div>

            {/* Right Column Dropzone Widget */}
            <motion.div {...fadeUp(0.25)} className="w-full">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-3 border border-slate-200 dark:border-slate-800 shadow-2xl relative">
                <div className="absolute -top-3 -right-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg">
                  Lokal & Ücretsiz
                </div>
                <CvDropZone redirectTo="/forge" className="border-0 shadow-none bg-transparent" />
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* 2. Before vs After ATS Interactive Simulator */}
      <section className="px-4 md:px-8 py-16 border-b border-slate-200/60 dark:border-white/5">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              ATS Optimizasyon Simülasyonu
            </h2>
            <p className="text-sm text-slate-500">
              Klasik bir CV ifadesinin yapay zeka ile ATS uyumlu, metrik odaklı STAR formatına dönüşümünü canlı test edin.
            </p>
          </div>

          <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5 dark:border-white/5">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Örnek Deneyim Satırı
                </h3>
              </div>
              <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl shrink-0">
                <button
                  onClick={() => setActiveTab("before")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "before"
                      ? "bg-amber-500 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Klasik CV (Öncesi)
                </button>
                <button
                  onClick={() => setActiveTab("after")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "after"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  CareerForge (Sonrası)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 items-start text-left">
              <div className="space-y-4">
                <div className="rounded-2xl border p-5 bg-white dark:bg-slate-900 relative min-h-[160px]">
                  <span
                    className={`absolute top-4 right-4 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                      activeTab === "before"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
                    }`}
                  >
                    {activeTab === "before" ? "ATS Zayıf" : "ATS Uyumlu"}
                  </span>
                  
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-3">Deneyim Açıklaması</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Software Developer · SoftBridge Solutions</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">2023 - Devam Ediyor</p>
                    </div>

                    {activeTab === "before" ? (
                      <div className="flex gap-2 items-start text-amber-600 bg-amber-500/[0.02] p-2.5 rounded-xl border border-amber-500/10 text-xs">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Eylem fiili ve ölçülebilir başarı yok:</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            &quot;React kullanarak web projeleri geliştirdim ve sayfaların hızlı çalışmasını sağladım.&quot;
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2 items-start text-emerald-600 bg-emerald-500/[0.02] p-2.5 rounded-xl border border-emerald-500/10 text-xs">
                        <Check className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">STAR eylem odaklı format:</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            &quot;React ve Next.js tabanlı analitik panel yapısını optimize ederek sayfa yüklenme sürelerini %35 kısalttım; 12k aktif kullanıcının arayüz performansını artırdım.&quot;
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                    Önerilen Yetenekler: React, Next.js, Web Optimizasyonu
                  </span>
                </div>
              </div>

              {/* Comparison Gauge meters */}
              <div className="space-y-4 rounded-2xl border p-5 bg-white dark:bg-slate-900">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                  Öngörülen ATS Puanı
                </h4>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-end mb-1 text-xs">
                      <span className="text-slate-500">Skor Derecesi</span>
                      <span className={activeTab === "before" ? "text-amber-500 font-bold" : "text-emerald-500 font-bold"}>
                        {activeTab === "before" ? "%38" : "%92"}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          activeTab === "before" ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: activeTab === "before" ? "38%" : "92%" }}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-3 mt-3 dark:border-white/5">
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {activeTab === "before"
                      ? "❌ Pasif cümle yapıları robotların tarama puanını düşürür."
                      : "✅ Aktif eylemler ve sayılar ATS robotlarının aradığı eşleşmeyi tam sağlar."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Career Growth Timeline Workflow */}
      <section className="px-4 md:px-8 py-16 bg-slate-50/50 dark:bg-slate-900/10 border-b border-slate-200/60 dark:border-white/5">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Süreç Nasıl İşler?
            </h2>
            <p className="text-sm text-slate-500">
              Kariyer yolculuğunuzu 4 adımda optimize edin ve mülakata hazır hale gelin.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {steps.map((s) => (
              <div key={s.num} className="glass-panel p-5 rounded-2xl space-y-3 relative group">
                <span className="text-2xl font-black text-blue-600 dark:text-blue-500 block">
                  {s.num}
                </span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {s.title}
                </h3>
                <p className="text-xs text-slate-500 leading-normal">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Product Previews (Dashboard, Resume, AI Coach) */}
      <section className="px-4 md:px-8 py-16 border-b border-slate-200/60 dark:border-white/5">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Platform Özelliklerine Yakından Bakın
            </h2>
            <p className="text-sm text-slate-500">
              Özgeçmiş kalitenizi artırmak için tasarlanan tüm araçlar bir arada.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            
            {/* Box 1: Cockpit */}
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Kariyer Kokpiti
              </h3>
              <p className="text-xs text-slate-500 leading-normal">
                CV gücünüzü radial SVG grafiklerle takip edin. Haftalık gelişim durumunuzu ve yapay zekanın sizin için önerdiği ilk aksiyon kartını görün.
              </p>
            </div>

            {/* Box 2: Split Editor */}
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                A4 Canlı Editör
              </h3>
              <p className="text-xs text-slate-500 leading-normal">
                Form editörü ile değişiklikleri yaparken yan panelde taranabilir A4 sayfa şablonunu anında güncellenmiş olarak izleyin.
              </p>
            </div>

            {/* Box 3: AI Coach */}
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center">
                <Mic2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                AI Mülakat Mentor
              </h3>
              <p className="text-xs text-slate-500 leading-normal">
                Mülakat simülasyonu başlatarak özgeçmişinize özel STAR temelli cevap iskeletleri hazırlayın ve koç tavsiyelerini takip edin.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQs Section */}
      <section className="px-4 md:px-8 py-16 max-w-4xl mx-auto text-left space-y-8">
        <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white text-center">
          Sıkça Sorulan Sorular
        </h2>
        
        <div className="space-y-4">
          {faqs.map((f, i) => (
            <div key={i} className="glass-panel p-5 rounded-2xl space-y-2">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                {f.q}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed pl-6">
                {f.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Final CTA */}
      <section className="px-4 md:px-8 py-12 max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 md:p-12 text-center text-white space-y-6 shadow-xl">
          <h2 className="font-display text-2xl md:text-3xl font-black">
            Özgeçmişinizi Güçlendirmeye Hazır mısınız?
          </h2>
          <p className="text-sm text-blue-100 max-w-lg mx-auto leading-relaxed">
            Hemen recruiter demo modunu yükleyerek sistemi deneyin veya kendi özgeçmişinizi yükleyip yerel analizi başlatın.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={startDemoMode}
              className="bg-white text-blue-600 font-bold px-6 py-2.5 rounded-full text-xs hover:bg-slate-50 transition-all cursor-pointer"
            >
              Demo Profil Yükle
            </button>
            <Link
              href="/forge"
              className="bg-blue-700 text-white border border-blue-500 font-bold px-6 py-2.5 rounded-full text-xs hover:bg-blue-800 transition-all"
            >
              Kendin Başla
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
