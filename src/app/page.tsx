"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronDown,
  HelpCircle,
  Code,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { useCareerStore } from "@/store/useCareerStore";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] as const },
});

// ─── FAQ Component ───────────────────────────────────────────────────────────
function FaqCard({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(!open)}
      className="glass-panel p-5 rounded-2xl cursor-pointer hover:border-blue-500/30 transition-all select-none text-left"
    >
      <div className="flex items-center justify-between gap-4">
        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
          {q}
        </h4>
        <div className="text-slate-400">
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-3 text-xs text-slate-500 leading-relaxed pl-6 border-l border-slate-200 dark:border-slate-800"
          >
            {a}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Feature Showroom Widget: Keyword Highlight ──────────────────────────────
function KeywordHighlightDemo() {
  const [mode, setMode] = useState<"raw" | "highlight">("highlight");
  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900 space-y-3">
      <div className="flex items-center justify-between border-b pb-2 dark:border-white/5">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
          Anahtar Kelime Tarayıcı (Demo)
        </span>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
          <button
            onClick={() => setMode("raw")}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
              mode === "raw" ? "bg-white text-slate-900 dark:bg-slate-700 dark:text-white shadow" : "text-slate-500"
            }`}
          >
            Ham Metin
          </button>
          <button
            onClick={() => setMode("highlight")}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
              mode === "highlight" ? "bg-white text-slate-900 dark:bg-slate-700 dark:text-white shadow" : "text-slate-500"
            }`}
          >
            Eşleşen
          </button>
        </div>
      </div>
      <div className="text-xs leading-relaxed font-mono p-3 bg-slate-50 dark:bg-slate-950 rounded-xl min-h-[90px]">
        {mode === "raw" ? (
          <p className="text-slate-500">
            SoftBridge üzerinde React ve Node.js teknolojileriyle web dashboard panelleri kodladım.
          </p>
        ) : (
          <p className="text-slate-500">
            SoftBridge üzerinde{" "}
            <span className="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 px-1 py-0.5 rounded font-bold">
              React
            </span>{" "}
            ve{" "}
            <span className="bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 px-1 py-0.5 rounded font-bold">
              Node.js
            </span>{" "}
            teknolojileriyle web{" "}
            <span className="bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300 px-1 py-0.5 rounded font-bold">
              dashboard
            </span>{" "}
            panelleri kodladım.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Feature Showroom Widget: Job Match Simulator ────────────────────────────
function JobMatchShowroom() {
  const [skills, setSkills] = useState<string[]>(["React", "TypeScript"]);
  const required = ["React", "TypeScript", "Next.js", "Docker"];
  const score = Math.round((skills.length / required.length) * 100);

  const addSkill = (s: string) => {
    if (skills.includes(s)) return;
    setSkills([...skills, s]);
  };

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900 space-y-3 text-left">
      <div className="flex items-center justify-between border-b pb-2 dark:border-white/5">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
          İlan Eşleşme Simülatörü
        </span>
        <span className="text-xs font-black text-blue-600 dark:text-blue-400">% {score} Uyum</span>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] text-slate-500 leading-normal">
          İlana başvurmadan önce eksik yetenekleri ekleyin:
        </p>
        <div className="flex flex-wrap gap-1">
          {required.map((req) => {
            const has = skills.includes(req);
            return (
              <button
                key={req}
                onClick={() => addSkill(req)}
                disabled={has}
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                  has
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-500/20"
                    : "bg-white text-slate-600 border-slate-200 hover:border-blue-500 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 cursor-pointer"
                }`}
              >
                {req} {has ? "✓" : "+ Ekle"}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Feature Showroom Widget: AI Interview Coach Bubble ─────────────────────
function CoachSimulation() {
  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900 space-y-3 text-left">
      <div className="flex items-center justify-between border-b pb-2 dark:border-white/5">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
          AI Koç Mülakat Simülasyonu
        </span>
      </div>
      <div className="space-y-2 text-[11px]">
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400 leading-normal">
          <strong className="text-purple-600 dark:text-[#C084FC] block mb-0.5">AI Koç:</strong>
          &quot;React hızlandırma projesini anlatırken sayfa açılış süresini %35 düşürdüğünüzü belirtmişsiniz. Bunu hangi optimizasyon teknikleriyle yaptınız?&quot;
        </div>
        <div className="p-2.5 rounded-xl bg-blue-500/10 text-slate-700 dark:text-slate-300 border border-blue-500/20">
          <strong className="text-blue-600 dark:text-blue-400 block mb-0.5">Önerilen STAR Cevap Kalıbı:</strong>
          &quot;Code-splitting ve resim sıkıştırma mimarilerini kurarak yükü hafiflettim...&quot;
        </div>
      </div>
    </div>
  );
}

// ─── Main Landing Page Component ─────────────────────────────────────────────
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
    { num: "01", title: "Özgeçmiş Yükle", desc: "Belgenizi tarayıcınıza bırakın veya demo hesaba geçin." },
    { num: "02", title: "Eksikleri İncele", desc: "Anlık anahtar kelime eşleşmesini ve yapısal eksikleri tespit edin." },
    { num: "03", title: "Tek Tıkla Tamamla", desc: "Canlı editör ve asistan önerileriyle puanınızı artırın." },
    { num: "04", title: "Başvuruya Hazırlan", desc: "Mülakat simülatörüyle STAR metodunu kullanarak çalışın." },
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
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-xs font-bold text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-300">
                <Sparkles className="w-3.5 h-3.5" />
                SoftBridge CareerForge 2.0
              </div>

              <h1 className="font-display text-4xl sm:text-5xl md:text-[3.5rem] font-extrabold tracking-tight leading-[1.05] text-slate-900 dark:text-white">
                Özgeçmişinizi <span className="text-blue-600 dark:text-blue-400">ATS Robotları</span> için Güçlendirin.
              </h1>

              <p className="text-base md:text-lg text-slate-600 dark:text-slate-450 max-w-xl leading-relaxed">
                Yapay zeka ile kişisel verilerinizi sunuculara göndermeden saniyeler içinde analiz edin, eksik yetenekleri tek tıkla kapatın ve işe alım oranınızı artırın.
              </p>

              {/* Privacy Shield */}
              <div className="inline-flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/10 dark:border-emerald-500/20 px-4 py-3 text-xs font-bold shadow-sm">
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
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-blue-600 text-white font-bold px-6 py-2.5 text-xs hover:bg-blue-700 transition-all hover:scale-[1.02] shadow-lg shadow-blue-500/15 cursor-pointer"
                >
                  Recruiter Demo Modu <ArrowRight className="w-4 h-4" />
                </button>
                <Link
                  href="/forge"
                  className="inline-flex h-11 items-center rounded-full px-5 text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-white/5 transition-all"
                >
                  CV Analiz Aracı
                </Link>
              </div>
            </motion.div>

            {/* Right Column Product Dashboard Mock Preview */}
            <motion.div {...fadeUp(0.25)} className="w-full">
              <div className="bg-white dark:bg-[#0B1329] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-left">
                <div className="flex items-center justify-between border-b pb-3 dark:border-white/5">
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white">Kariyer Dashboard</h3>
                    <p className="text-[10px] text-slate-400">Canlı optimizasyon önizlemesi</p>
                  </div>
                  <Badge variant="soft">Aktif</Badge>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/30 border dark:border-white/5 text-center">
                    <span className="text-lg font-black text-blue-600 dark:text-blue-400">92%</span>
                    <span className="text-[8px] text-slate-450 block uppercase tracking-wider mt-1">ATS Puanı</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/30 border dark:border-white/5 text-center">
                    <span className="text-lg font-black text-purple-600 dark:text-purple-400">8/10</span>
                    <span className="text-[8px] text-slate-450 block uppercase tracking-wider mt-1">CV Gücü</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/30 border dark:border-white/5 text-center">
                    <span className="text-lg font-black text-cyan-600 dark:text-cyan-400">75%</span>
                    <span className="text-[8px] text-slate-450 block uppercase tracking-wider mt-1">Yol Uyum</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl border border-blue-500/10 bg-blue-500/[0.02] flex items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 block uppercase">Önerilen Aksiyon</span>
                    <p className="text-slate-600 dark:text-slate-350">“TypeScript” yetkinliğini ekleyerek skorunuzu artırın.</p>
                  </div>
                  <button
                    onClick={startDemoMode}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[9px] hover:bg-blue-700 cursor-pointer"
                  >
                    Simüle Et
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* 2. Showroom: Live Interactive Product Features */}
      <section className="px-4 md:px-8 py-16 border-b border-slate-200/60 dark:border-white/5">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Söz Vermiyoruz, Canlı Gösteriyoruz.
            </h2>
            <p className="text-sm text-slate-500">
              CareerForge modüllerinin çıktılarını hiçbir dosya yüklemeden hemen aşağıda test edin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-5 rounded-3xl space-y-4 hover:-translate-y-0.5 transition-transform duration-200">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <FileSearch className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">
                Akıllı Kelime Eşleştirici
              </h3>
              <p className="text-xs text-slate-550 leading-relaxed">
                CV&apos;nizdeki cümleleri analiz ederek eksik anahtar kelimeleri ve saptanmış yetkinlik etiketlerini bulur.
              </p>
              <KeywordHighlightDemo />
            </div>

            <div className="glass-panel p-5 rounded-3xl space-y-4 hover:-translate-y-0.5 transition-transform duration-200">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">
                Anlık Rol Uyum Kontrolü
              </h3>
              <p className="text-xs text-slate-550 leading-relaxed">
                Hedef rol gereksinimleriyle eşleşme durumunuzu hesaplayıp eksikleri tek tıkla özgeçmişinize enjekte etmenizi sağlar.
              </p>
              <JobMatchShowroom />
            </div>

            <div className="glass-panel p-5 rounded-3xl space-y-4 hover:-translate-y-0.5 transition-transform duration-200">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center">
                <Mic2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">
                Mülakat Simülasyon Koçu
              </h3>
              <p className="text-xs text-slate-550 leading-relaxed">
                Geçmiş deneyimlerinize göre en muhtemel mülakat sorularını çıkartarak STAR formatında cevaplar hazırlatır.
              </p>
              <CoachSimulation />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Before vs After ATS Cümle Karşılaştırıcısı */}
      <section className="px-4 md:px-8 py-16 border-b border-slate-200/60 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/10">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Cümle Yapısı Eşleştirme Testi
            </h2>
            <p className="text-sm text-slate-500">
              Özgeçmişinizin ATS taramalarından nasıl geçtiğini ve CareerForge&apos;un bunu nasıl düzelttiğini görün.
            </p>
          </div>

          <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5 dark:border-white/5">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">Öncesi vs Sonrası Analiz Karşılaştırması</h3>
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
                  
                  <h4 className="font-semibold text-slate-800 dark:text-white text-sm mb-3">Deneyim Açıklaması</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-350">Software Developer · SoftBridge Solutions</p>
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
              </div>

              {/* Comparison Gauge meters */}
              <div className="space-y-4 rounded-2xl border p-5 bg-white dark:bg-slate-900">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                  Öngörülen ATS Puanı
                </h4>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-end mb-1 text-xs">
                      <span className="text-slate-550">Skor Derecesi</span>
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
                  <p className="text-[11px] text-slate-555 leading-relaxed">
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

      {/* 4. Career Timeline Workflow */}
      <section className="px-4 md:px-8 py-16 border-b border-slate-200/60 dark:border-white/5">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Uçtan Uca Kariyer Gelişim Süreci
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
                <h3 className="font-bold text-sm text-slate-850 dark:text-white">
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

      {/* 5. FAQ Sections */}
      <section className="px-4 md:px-8 py-16 max-w-4xl mx-auto text-left space-y-8">
        <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white text-center">
          Sıkça Sorulan Sorular
        </h2>
        
        <div className="space-y-4">
          {faqs.map((f, i) => (
            <FaqCard key={i} q={f.q} a={f.a} />
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
