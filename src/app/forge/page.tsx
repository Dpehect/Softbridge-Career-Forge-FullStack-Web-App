"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Anvil,
  FileSearch,
  GitCompare,
  Sparkles,
  Mail,
  ShieldCheck,
  MessageSquare,
  Mic2,
  History,
  Copy,
  Trash2,
  RotateCcw,
  Save,
  PenLine,
  Briefcase,
  FileDown,
  Camera,
  Plus,
  ArrowRight,
  Lightbulb,
  Settings,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FilePickButton } from "@/components/FilePickButton";
import { CvDropZone } from "@/components/CvDropZone";
import { useCareerStore } from "@/store/useCareerStore";
import {
  parseCV,
  analyzeAts,
  CAREER_GOALS,
  cleanExtractedText,
  looksLikeRawPdf,
  downloadJsonFile,
  exportCvAsPdf,
  generateCvFeedback,
  simulateAIResponse,
  type CoverLetterTone,
  type OptimizedCV,
  type CoverLetterResult,
  type InterviewResult,
  type ChatbotResult,
  type AtsResult,
  type ParsedCV,
  type MatchAnalysis,
} from "@/lib/forge";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/forge/i18n";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorAlert } from "@/components/ErrorAlert";
import { JourneyResults } from "@/components/JourneyResults";
import { buildJourneyInsight } from "@/lib/forge/journey";
import { useClientAi } from "@/hooks/useClientAi";

type EditorTabId = "raw" | "form" | "versions";
type PreviewTabId = "preview" | "feedback" | "match" | "cover" | "interview" | "chat";

interface ProTipsPanelProps {
  editorTab: EditorTabId;
  previewTab: PreviewTabId;
  activeSection: "analiz" | "gecmis" | "ayarlar";
}

function ProTipsPanel({ editorTab, previewTab, activeSection }: ProTipsPanelProps) {
  let title = "Akıllı İpuçları";
  let description = "Kariyerinizi güçlendirmek için kişiselleştirilmiş öneriler.";
  let tips = [
    "CV'nizi ATS (Aday Takip Sistemi) uyumlu hale getirmek için başlıkları standart tutun (Deneyim, Eğitim, Yetenekler).",
    "Yetkinliklerinizi sadece listelemek yerine, projelerinizdeki etkileriyle (örn: %20 performans artışı) açıklayın."
  ];
  let icon = <Lightbulb className="w-5 h-5 text-amber-500" strokeWidth={1.5} />;

  if (activeSection === "gecmis") {
    title = "Sürüm Yönetimi";
    description = "Farklı başvuru tipleri için CV'lerinizi yedekleyin.";
    tips = [
      "Farklı şirket kültürleri (örn. kurumsal vs startup) için özelleştirilmiş CV yedekleri oluşturun.",
      "Yeni bir sürüm indirmeden önce yerel yedek alarak önceki verilerinizi güvenceye alın."
    ];
    icon = <History className="w-5 h-5 text-purple-500" strokeWidth={1.5} />;
  } else if (activeSection === "ayarlar") {
    title = "Kariyer Hedefleme";
    description = "Hedef pozisyonunuzu güncel tutmak analiz kalitesini artırır.";
    tips = [
      "Seçtiğiniz hedef rol, yapay zekanın mülakat sorularını ve kelime eşleştirme skorlarını belirler.",
      "Kariyer rotanız değiştikçe hedef rolü güncelleyerek daha nokta atışı tavsiyeler alın."
    ];
    icon = <Settings className="w-5 h-5 text-sunset-coral" strokeWidth={1.5} />;
  } else if (activeSection === "analiz") {
    if (editorTab === "raw") {
      title = "Dosya Yükleme İpuçları";
      description = "Daha iyi bir analiz için dosyalarınızı optimize edin.";
      tips = [
        "Metin formatındaki PDF veya DOCX dosyaları en yüksek parse doğruluğunu sağlar.",
        "Görsel/Tarama formatındaki PDF'ler yerine metin seçilebilen dosyaları tercih edin."
      ];
      icon = <FileDown className="w-5 h-5 text-emerald-500" strokeWidth={1.5} />;
    } else if (editorTab === "form") {
      title = "Hızlı Düzenleme";
      description = "CV bilgilerinizi manuel optimize edin.";
      tips = [
        "Teknik kelimeleri ve araçları (örn. React, Kubernetes) yetenekler listesine ekleyin.",
        "Deneyim altındaki açıklamaları kısa ve aksiyon odaklı fiillerle başlatın."
      ];
      icon = <Anvil className="w-5 h-5 text-[#A855F7]" strokeWidth={1.5} />;
    }
  }

  return (
    <aside className="w-full xl:w-[260px] flex flex-col gap-4 rounded-3xl p-5 border border-slate-200/60 bg-white/40 dark:border-white/10 dark:bg-[#0f172a]/20 shadow-sm ring-1 ring-slate-100 dark:ring-white/5">
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-white/5">
        {icon}
        <div className="min-w-0">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{title}</h3>
          <p className="text-[10px] text-slate-500 mt-0.5 truncate">{description}</p>
        </div>
      </div>
      <ul className="space-y-3">
        {tips.map((tip, idx) => (
          <li key={idx} className="flex gap-2 items-start text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
            <span className="text-[#A855F7] font-extrabold shrink-0">•</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 p-3 rounded-2xl bg-purple-500/5 border border-purple-500/10 text-[10px] text-purple-950 dark:text-purple-200 leading-normal">
        <strong>💡 Profesyonel İpucu:</strong> CV&apos;nizin ATS taramalarından geçmesi için standart yazı tipleri (Arial, Calibri) tercih edin.
      </div>
    </aside>
  );
}

export default function ForgePage() {
  const {
    forgeCvText,
    forgeJdText,
    forgeParsedCv,
    forgeAnalysis,
    forgeTone,
    forgeHistory,
    forgeBackups,
    careerGoalId,
    setForgeCvText,
    setForgeJdText,
    setForgeParsedCv,
    setForgeAnalysis,
    setForgeTone,
    pushForgeHistory,
    clearForgeHistory,
    clearForgeCv,
    saveForgeBackup,
    restoreForgeBackup,
    deleteForgeBackup,
    setCareerGoalId,
  } = useCareerStore();

  const { t } = useTranslation();
  const router = useRouter();

  const [editorTab, setEditorTab] = useState<EditorTabId>("raw");
  const [previewTab, setPreviewTab] = useState<PreviewTabId>("preview");
  const [activeSection, setActiveSection] = useState<"analiz" | "gecmis" | "ayarlar">("analiz");

  const [mounted, setMounted] = useState(false);
  const [optimized, setOptimized] = useState<OptimizedCV | null>(null);
  const [cover, setCover] = useState<CoverLetterResult | null>(null);
  const [interview, setInterview] = useState<InterviewResult | null>(null);
  const [ats, setAts] = useState<AtsResult | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ sender: "user" | "ai"; text: string; category?: string; actionableTips?: string[] }>>([]);
  const [busy, setBusy] = useState(false);
  const [parseBanner, setParseBanner] = useState<string | null>(null);
  const [lastCvFileName, setLastCvFileName] = useState<string | null>(null);
  const [modelBanner, setModelBanner] = useState<string | null>(null);

  // 100% browser AI (Transformers.js) — no server fetch
  const {
    analyze: analyzeInBrowser,
    analyzing,
    statusMessage,
    isLoadingModel,
    error: clientAiError,
    ensureReady,
  } = useClientAi();

  // Sync tab hash routing & hydration mounting
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      if (hash === "history") {
        setEditorTab("versions");
      }
    }
    // Warm embedding model once on first Forge visit
    void ensureReady().catch(() => {
      /* status shown via statusMessage */
    });
  }, [ensureReady]);

  // Hooks must run every render — never below an early return
  const cvText = forgeCvText ?? "";
  const jdText = forgeJdText ?? "";
  const isLoading = busy || analyzing || isLoadingModel;

  const cvFeedback = useMemo(() => {
    try {
      if (!forgeParsedCv) return null;
      return generateCvFeedback(forgeParsedCv, forgeCvText || "");
    } catch {
      return null;
    }
  }, [forgeParsedCv, forgeCvText]);

  const journeyInsight = useMemo(() => {
    try {
      return buildJourneyInsight({
        cv: forgeParsedCv,
        goalId: careerGoalId ?? null,
        atsScore: ats?.atsScore ?? forgeAnalysis?.atsScore ?? cvFeedback?.atsScore,
        feedback: cvFeedback,
        missingFromMatch: forgeAnalysis?.missingSkills,
      });
    } catch {
      return buildJourneyInsight({ cv: null, goalId: null });
    }
  }, [forgeParsedCv, careerGoalId, ats, forgeAnalysis, cvFeedback]);

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-[3px] border-t-transparent animate-spin"
            style={{ borderColor: "#A855F7", borderTopColor: "transparent" }} />
          <div className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{ background: "#A855F7" }} />
        </div>
        <div className="text-center">
          <p className="font-bold text-lg text-star-white">Kariyer Asistanı Hazırlanıyor</p>
          <p className="text-sm text-muted-steel mt-1">Verileriniz tarayıcınızda güvenle işleniyor...</p>
        </div>
      </div>
    );
  }

  const run = async (fn: () => Promise<void> | void) => {
    setBusy(true);
    try {
      await fn();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "";
      const offline =
        /fetch failed|ECONNREFUSED|timeout|offline|Ollama|Local AI unavailable/i.test(
          message
        );
      toast.error(
        offline
          ? "Local AI unavailable — tarayıcı içi analiz devam eder. (Vercel’de localhost Ollama yok.)"
          : message || "Bir sorun oluştu — tekrar deneyin."
      );
    } finally {
      setBusy(false);
    }
  };

  const runParse = (
    text: string,
    source: "manual" | "file" = "manual",
    fileName?: string,
    goToEditor = false
  ) => {
    if (!text.trim()) {
      toast.error("Önce CV metnini yapıştırın veya PDF/TXT seçin.");
      return null;
    }
    const cleaned = cleanExtractedText(text);
    if (looksLikeRawPdf(cleaned) || looksLikeRawPdf(text)) {
      toast.error("Ham PDF kodu gibi görünüyor. Düz metin yapıştırın veya dosya yükleyin.");
      setForgeParsedCv(null);
      setParseBanner(null);
      return null;
    }
    try {
      const parsed = parseCV(cleaned);
      setForgeCvText(cleaned);
      setForgeParsedCv(parsed);
      if (fileName) setLastCvFileName(fileName);
      pushForgeHistory({
        action: "parse",
        summary: `${parsed.name} — ${parsed.skills.length} beceri`,
        payload: parsed,
      });
      setParseBanner(t("readyMsg"));
      toast.success("Analiz hazır — sizi düzenleyiciye alıyoruz.");
      setEditorTab("form");
      if (goToEditor) {
        router.push("/resume?from=analiz");
      }
      return parsed;
    } catch {
      toast.error("CV yapısı çözümlenemedi. Düz metin deneyin.");
      setForgeParsedCv(null);
      setParseBanner(null);
      return null;
    }
  };

  const handleCvFile = (text: string, fileName: string) => {
    const cleaned = cleanExtractedText(text);
    if (!cleaned.trim() || looksLikeRawPdf(cleaned) || looksLikeRawPdf(text)) {
      toast.error("Bu PDF taranmış görünüyor. Metin olarak yapıştırın.");
      return;
    }
    setForgeCvText(cleaned);
    run(() => {
      runParse(cleaned, "file", fileName, true);
    });
  };

  const onClearCv = () => {
    clearForgeCv();
    setOptimized(null);
    setCover(null);
    setInterview(null);
    setAts(null);
    setParseBanner(null);
    setLastCvFileName(null);
    toast.success(t("clearSuccess"));
    setEditorTab("raw");
  };

  const onBackupCv = () => {
    const bak = saveForgeBackup();
    if (!bak) {
      toast.error("No profile content to backup yet.");
      return;
    }
    if (forgeParsedCv) {
      downloadJsonFile(
        `cv-backup-${bak.id}.json`,
        { label: bak.label, parsed: forgeParsedCv, text: forgeCvText }
      );
      toast.success("JSON Backup file downloaded successfully!");
    }
  };

  const onExportPdf = async () => {
    if (!forgeParsedCv) return;
    try {
      await exportCvAsPdf(forgeParsedCv);
      toast.success(t("exportSuccess"));
    } catch {
      toast.error("Export failed.");
    }
  };

  const onParse = () =>
    run(async () => {
      runParse(cvText, "manual", undefined, true);
    });

  /** Primary path: Transformers.js embeddings in the browser */
  const onAnalyze = () =>
    run(async () => {
      try {
        if (!forgeParsedCv && !cvText.trim()) {
          toast.error("Önce CV yükleyin veya yapıştırın.");
          return;
        }
        if (!jdText.trim()) {
          toast.error("Önce iş ilanı (JD) metnini yapıştırın.");
          return;
        }
        setModelBanner("Analiz ediliyor… (ilk seferde model indirilebilir)");
        const semantic = await analyzeInBrowser(
          cvText || JSON.stringify(forgeParsedCv),
          jdText,
          forgeParsedCv?.skills ?? []
        );
        const analysis: MatchAnalysis = {
          matchScore: semantic.matchScore,
          atsScore: semantic.atsScore,
          strengths: semantic.strengths,
          gaps: semantic.gaps,
          suggestions: semantic.suggestions,
          matchedSkills: semantic.matchedKeywords,
          missingSkills: semantic.missingKeywords,
        };
        setForgeAnalysis(analysis);
        setAts({
          atsScore: semantic.atsScore,
          issues: semantic.gaps,
          fixes: semantic.suggestions,
          keywordCoverage: Math.round(
            (semantic.matchedKeywords.length /
              Math.max(
                1,
                semantic.matchedKeywords.length + semantic.missingKeywords.length
              )) *
              100
          ),
        });
        pushForgeHistory({
          action: "analyze",
          summary: `Tarayıcı AI · Eşleşme %${analysis.matchScore} · ATS %${analysis.atsScore}`,
          payload: analysis,
        });
        setModelBanner(null);
        toast.success(`Eşleşme: %${analysis.matchScore} (tarayıcı AI)`);
        setPreviewTab("match");
      } catch (e) {
        setModelBanner(null);
        toast.error(
          "Yapay zeka motoru şu an meşgul. Lütfen bağlantınızı kontrol edip sayfayı yenileyin."
        );
      }
    });

  const onOptimize = () =>
    run(async () => {
      try {
        if (!forgeParsedCv) return;
        // Local heuristic optimizer (already client-side, no network)
        const { optimizeCV } = await import("@/lib/forge/optimize");
        const match = forgeAnalysis;
        const result = optimizeCV(forgeParsedCv, match, jdText);
        setOptimized(result);
        pushForgeHistory({
          action: "optimize",
          summary: `${result.optimizedSkills.length} skills optimized`,
          payload: result,
        });
        toast.success("CV optimize edildi (cihazda)");
        setPreviewTab("preview");
      } catch {
        toast.error("Optimizasyon tamamlanamadı.");
      }
    });

  const onCover = () =>
    run(async () => {
      try {
        if (!forgeParsedCv) return;
        if (!jdText.trim()) {
          toast.error("Önce JD metnini yapıştırın.");
          return;
        }
        const result = await simulateAIResponse("coverletter", forgeParsedCv, {
          jd: jdText,
          tone: forgeTone,
        });
        setCover(result);
        pushForgeHistory({
          action: "coverletter",
          summary: `${result.tone} tone cover letter`,
          payload: result,
        });
        toast.success("Ön yazı oluşturuldu (cihazda)");
        setPreviewTab("cover");
      } catch {
        toast.error("Ön yazı üretilemedi.");
      }
    });

  const onAts = () =>
    run(async () => {
      try {
        if (!forgeParsedCv) return;
        setModelBanner("Analiz ediliyor…");
        // Prefer semantic ATS when JD present; else structural local scan
        if (jdText.trim()) {
          const semantic = await analyzeInBrowser(
            cvText || forgeParsedCv.skills.join(" "),
            jdText,
            forgeParsedCv.skills
          );
          setAts({
            atsScore: semantic.atsScore,
            issues: semantic.gaps,
            fixes: semantic.suggestions,
            keywordCoverage: Math.round(
              (semantic.matchedKeywords.length /
                Math.max(
                  1,
                  semantic.matchedKeywords.length + semantic.missingKeywords.length
                )) *
                100
            ),
          });
          setForgeAnalysis({
            matchScore: semantic.matchScore,
            atsScore: semantic.atsScore,
            strengths: semantic.strengths,
            gaps: semantic.gaps,
            suggestions: semantic.suggestions,
            matchedSkills: semantic.matchedKeywords,
            missingSkills: semantic.missingKeywords,
          });
          pushForgeHistory({
            action: "ats",
            summary: `Tarayıcı AI ATS %${semantic.atsScore}`,
            payload: semantic,
          });
          toast.success(`ATS: %${semantic.atsScore} (tarayıcı AI)`);
        } else {
          const result = analyzeAts(forgeParsedCv, jdText);
          setAts(result);
          pushForgeHistory({
            action: "ats",
            summary: `ATS score: %${result.atsScore}`,
            payload: result,
          });
          toast.success(`ATS: %${result.atsScore}`);
        }
        setModelBanner(null);
        setPreviewTab("feedback");
      } catch (e) {
        setModelBanner(null);
        toast.error(
          "ATS taraması şu an yapılamıyor. Bağlantını kontrol et — sistem birazdan tekrar denenebilir."
        );
      }
    });

  const onInterview = () =>
    run(async () => {
      try {
        const parsed =
          forgeParsedCv || parseCV(cvText || "Aday\nSoftware Engineer\nReact");
        if (!forgeParsedCv && cvText.trim()) setForgeParsedCv(parsed);
        const result = await simulateAIResponse("interview", parsed, { jd: jdText });
        setInterview(result);
        pushForgeHistory({
          action: "interview",
          summary: `${result.questions.length} questions ready`,
          payload: result,
        });
        toast.success("Mülakat soruları hazır (cihazda)");
        setPreviewTab("interview");
      } catch {
        toast.error("Mülakat soruları üretilemedi.");
      }
    });

  const onChat = () => {
    if (!chatInput.trim() || !forgeParsedCv) return;
    const userMsg = chatInput;
    setChatInput("");
    setChatHistory((prev) => [...prev, { sender: "user", text: userMsg }]);

    run(async () => {
      try {
        const result = await simulateAIResponse("chat", forgeParsedCv, {
          message: userMsg,
          jd: jdText,
        });
        setChatHistory((prev) => [
          ...prev,
          {
            sender: "ai",
            text: result.response,
            category: result.category,
            actionableTips: result.actionableTips,
          },
        ]);
        pushForgeHistory({
          action: "chatbot",
          summary: `${result.category}: ${result.response.slice(0, 45)}…`,
          payload: result,
        });
        setPreviewTab("chat");
      } catch {
        toast.error("Sohbet yanıtı üretilemedi.");
      }
    });
  };

  // Form Editor Actions
  const updateParsedField = (patch: Partial<ParsedCV>) => {
    if (forgeParsedCv) {
      setForgeParsedCv({ ...forgeParsedCv, ...patch });
    }
  };

  const updateExperience = (index: number, patch: Partial<any>) => {
    if (forgeParsedCv) {
      const updated = [...forgeParsedCv.experience];
      updated[index] = { ...updated[index], ...patch };
      updateParsedField({ experience: updated });
    }
  };

  const addExperience = () => {
    if (forgeParsedCv) {
      const updated = [
        ...forgeParsedCv.experience,
        { company: "Company", position: "Role", duration: "2024 - Present", description: ["Key achievement"] },
      ];
      updateParsedField({ experience: updated });
    }
  };

  const removeExperience = (index: number) => {
    if (forgeParsedCv) {
      const updated = forgeParsedCv.experience.filter((_, i) => i !== index);
      updateParsedField({ experience: updated });
    }
  };

  const addSkill = (skill: string) => {
    if (forgeParsedCv && skill.trim() && !forgeParsedCv.skills.includes(skill.trim())) {
      updateParsedField({ skills: [...forgeParsedCv.skills, skill.trim()] });
    }
  };

  const removeSkill = (skill: string) => {
    if (forgeParsedCv) {
      updateParsedField({ skills: forgeParsedCv.skills.filter((s) => s !== skill) });
    }
  };

  return (
    <div className="px-4 md:px-8 pb-20 pt-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Workspace Title & Intro */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full text-xs font-bold bg-purple-100/80 text-purple-800 dark:bg-purple-500/10 dark:text-purple-300">
              <Anvil className="w-3.5 h-3.5" />
              SoftBridge · Workspace
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-star-white">{t("forgeTitle")}</h1>
            <p className="text-sm text-muted-steel mt-1 max-w-xl leading-relaxed">{t("forgeDesc")}</p>
            {/* Yerel işleme rozeti */}
            <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: "#4ADE80" }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#4ADE80" }} />
              </span>
              Kariyer Asistanı: Aktif · Yerel İşleme
            </div>
            {/* Analiz progress bar — zarif ve teknik değil */}
            {(analyzing || modelBanner) && (
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-purple-700 dark:text-purple-300">
                    ✨ {modelBanner || "Özgeçmiş analiz ediliyor..."}
                  </span>
                  <span className="text-muted-steel">Lütfen bekleyin</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--border-color)" }}>
                  <div
                    className="h-full rounded-full animate-pulse"
                    style={{ width: "65%", background: "linear-gradient(90deg, #6B21A8, #A855F7, #F97316)" }}
                  />
                </div>
              </div>
            )}
            {/* clientAiError — sessizce yoksay, kullanıcıya gösterme */}
          </div>
          {forgeParsedCv && (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={onExportPdf}
                className="border-cosmic-teal/30 text-star-white hover:bg-cosmic-teal/8">
                <FileDown className="w-4 h-4 mr-1.5" /> {t("exportPdf")}
              </Button>
              <Button size="sm" variant="ghost" className="text-sunset-coral hover:bg-sunset-coral/5" onClick={onClearCv}>
                <RotateCcw className="w-4 h-4 mr-1.5" /> {t("clearCv")}
              </Button>
            </div>
          )}
        </div>

        {/* Dynamic SaaS Layout: Sol Sidebar + Workspace Area */}
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8 items-start">
          
          {/* Sol Sidebar Nav */}
          <aside className="lg:sticky lg:top-24 flex flex-col gap-6 rounded-3xl p-5 border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Anvil className="w-4 h-4 text-purple-600 dark:text-[#C084FC]" strokeWidth={1.5} />
              CareerForge
            </div>
            <nav className="flex flex-col gap-1.5">
              <button
                onClick={() => setActiveSection("analiz")}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all hover:scale-[1.02] cursor-pointer text-left",
                  activeSection === "analiz" ? "bg-purple-600 text-white font-bold shadow-md shadow-purple-500/10" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-purple-600 dark:hover:text-[#C084FC]"
                )}
              >
                <Anvil className="w-4 h-4" strokeWidth={1.5} />
                Analiz & Editör
              </button>
              <button
                onClick={() => setActiveSection("gecmis")}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all hover:scale-[1.02] cursor-pointer text-left",
                  activeSection === "gecmis" ? "bg-purple-600 text-white font-bold shadow-md shadow-purple-500/10" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-purple-600 dark:hover:text-[#C084FC]"
                )}
              >
                <History className="w-4 h-4" strokeWidth={1.5} />
                Geçmiş & Yedekler
              </button>
              <button
                onClick={() => setActiveSection("ayarlar")}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all hover:scale-[1.02] cursor-pointer text-left",
                  activeSection === "ayarlar" ? "bg-purple-600 text-white font-bold shadow-md shadow-purple-500/10" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-purple-600 dark:hover:text-[#C084FC]"
                )}
              >
                <Settings className="w-4 h-4" strokeWidth={1.5} />
                Kariyer Hedefleri
              </button>
            </nav>
            <div className="mt-6 border-t border-slate-100 dark:border-white/5 pt-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Gizlilik Notu</p>
              <p className="text-[10px] text-slate-500 leading-normal">
                Tüm verileriniz tarayıcınızda (yerel) saklanır.
              </p>
            </div>
          </aside>

          {/* Right Workspace Container */}
          <div className="min-w-0 space-y-6">
            
            {activeSection === "gecmis" && (
              <div className="glass-panel rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 shadow-md">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-white/5 pb-3">
                  <div>
                    <h2 className="text-lg font-bold text-star-white">Geçmiş & Yedek Raporları</h2>
                    <p className="text-xs text-slate-500 mt-1">CV yedeklerinizi ve sürüm geçmişinizi yerel cihazınızda saklayın.</p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      id="json-import-editor-sidebar"
                      accept=".json"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            try {
                              const parsedData = JSON.parse(reader.result as string);
                              if (parsedData && parsedData.parsed) {
                                setForgeParsedCv(parsedData.parsed);
                                if (parsedData.text) setForgeCvText(parsedData.text);
                                toast.success("Yedek başarıyla yüklendi!");
                                setActiveSection("analiz");
                                setEditorTab("form");
                              } else {
                                toast.error("Geçersiz yedek dosyası.");
                              }
                            } catch {
                              toast.error("Dosya okunamadı.");
                            }
                          };
                          reader.readAsText(file);
                        }
                      }}
                    />
                    <Button size="sm" variant="outline" onClick={() => document.getElementById("json-import-editor-sidebar")?.click()}>
                      İçe Aktar (Import)
                    </Button>
                    <Button size="sm" variant="primary" onClick={onBackupCv}>
                      Yeni Yedek Oluştur
                    </Button>
                  </div>
                </div>

                {forgeBackups.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">Henüz bu oturumda yedek oluşturulmadı. **Yeni Yedek Oluştur** butonuna tıklayarak profilinizi yedekleyebilirsiniz.</p>
                ) : (
                  <ul className="space-y-2">
                    {forgeBackups.map((bak) => (
                      <li key={bak.id} className="p-4 rounded-2xl border border-slate-100 bg-white/40 dark:bg-white/[0.02] dark:border-white/5 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-semibold text-star-white">{bak.label}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{new Date(bak.createdAt).toLocaleString("tr-TR")}</p>
                        </div>
                        <div className="flex gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              restoreForgeBackup(bak.id);
                              toast.success("Yedek profil başarıyla yüklendi.");
                              setActiveSection("analiz");
                              setEditorTab("form");
                            }}
                          >
                            Geri Yükle
                          </Button>
                          <Button size="sm" variant="ghost" className="text-rose-500 hover:bg-rose-500/5" onClick={() => deleteForgeBackup(bak.id)}>
                            ✕
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {activeSection === "ayarlar" && (
              <div className="glass-panel rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 shadow-md space-y-6">
                <div className="border-b border-slate-100 dark:border-white/5 pb-3">
                  <h2 className="text-lg font-bold text-star-white">Kariyer Hedef Yapılandırması</h2>
                  <p className="text-xs text-slate-500 mt-1">Hedeflediğiniz kariyer hedefini seçin. Analizler ve mülakat hazırlığı bu hedefe göre uyarlanır.</p>
                </div>

                <div className="space-y-4 max-w-md">
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-star-white">Hedef Rolünüz</span>
                    <select
                      value={careerGoalId ?? ""}
                      onChange={(e) => {
                        setCareerGoalId(e.target.value || null);
                        toast.success("Hedef pozisyon güncellendi.");
                      }}
                      className="w-full h-11 rounded-2xl border border-slate-200 bg-white/80 px-4 text-sm font-semibold text-slate-800 dark:bg-panel dark:border-white/10 dark:text-star-white"
                    >
                      {CAREER_GOALS.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.labelTr}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-3">
                    <h3 className="text-sm font-bold text-rose-500">Tehlikeli Bölge</h3>
                    <p className="text-xs text-slate-500 leading-normal">
                      Cihazınızda saklanan tüm CV verilerini, analiz geçmişini ve ayarları tamamen temizleyebilirsiniz. Bu işlem geri alınamaz.
                    </p>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        if (confirm("Tüm yerel verilerinizi silmek istediğinize emin misiniz?")) {
                          clearForgeCv();
                          clearForgeHistory();
                          toast.success("Tüm veriler başarıyla temizlendi.");
                        }
                      }}
                      className="text-rose-600 border border-rose-200/50 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-2xl h-10 px-4"
                    >
                      Tüm Verileri Temizle
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "analiz" && (
              <div className="grid grid-cols-1 xl:grid-cols-[1fr_260px] gap-6 items-start">
                
                {/* Dynamic Split-View Workspace Grid */}
                <div className="grid lg:grid-cols-[43%_57%] gap-6 items-start">
                  
                  {/* Left panel: Editors */}
                  <div className="flex flex-col gap-4">
                    
                    {/* Editor Tabs Navigation */}
                    <div className="flex gap-1 p-1 rounded-2xl bg-purple-500/5 border border-purple-500/10">
                      {(
                        [
                          ["raw", "Yükle"],
                          ["form", "Düzenle"],
                        ] as const
                      ).map(([id, label]) => {
                        const active = editorTab === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setEditorTab(id as EditorTabId)}
                            disabled={id === "form" && !forgeParsedCv}
                            className={cn(
                              "flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer",
                              active
                                ? "bg-purple-600 text-white font-bold shadow-md shadow-purple-500/10"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-100 disabled:opacity-40 disabled:hover:text-slate-600/40"
                            )}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Editor Content Area */}
                    <div className="glass-panel rounded-3xl p-5 min-h-[460px] border border-slate-200/80 dark:border-white/10">
              
              {/* Tab 1: Drop zone + paste */}
              {editorTab === "raw" && (
                <div className="space-y-6">
                  {!forgeParsedCv ? (
                    <>
                      <div
                        className="rounded-2xl p-5 text-center"
                        style={{
                          background: "linear-gradient(135deg, rgba(107,33,168,0.08), rgba(249,115,22,0.06))",
                          border: "1px dashed rgba(168,85,247,0.3)",
                        }}
                      >
                        <div className="text-3xl mb-2">📄</div>
                        <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                          Özgeçmişini Yükle ve Kariyerini Güçlendir
                        </p>
                        <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                          Dosyanı aşağıya bırak ya da metni yapıştır — asistan saniyeler içinde analiz eder.
                        </p>
                        <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-400">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 bg-emerald-500" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                          </span>
                          Veriler cihazınızda kalır — hiçbir şey dışarıya gönderilmez
                        </div>
                      </div>
                      <CvDropZone
                        redirectTo={null}
                        onParsed={(_p, _text, fileName) => {
                          setLastCvFileName(fileName);
                          setParseBanner("CV yüklendi. Sağ panelden analiz sonuçlarını inceleyin.");
                          setEditorTab("form");
                          setPreviewTab("feedback");
                        }}
                      />
                    </>
                  ) : (
                    <div
                      className="rounded-2xl p-3 text-sm"
                      style={{
                        background: "linear-gradient(135deg, rgba(74,222,128,0.08), rgba(52,211,153,0.05))",
                        border: "1px solid rgba(74,222,128,0.25)",
                      }}
                    >
                      <p className="font-semibold text-emerald-800 dark:text-emerald-400">
                        ✅ Özgeçmiş yüklendi{lastCvFileName ? `: ${lastCvFileName}` : ""}
                      </p>
                      <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                        Sağda analiz sonuçlarını incele · Düzenle sekmesiyle güncelle.
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-200">
                        veya metin yapıştır
                      </h3>
                      <FilePickButton
                        label="Dosya seç"
                        variant="outline"
                        size="sm"
                        silentSuccess
                        onText={(text, fileName) => handleCvFile(text, fileName)}
                      />
                    </div>
                    <Textarea
                      value={cvText}
                      onChange={(e) => {
                        setForgeCvText(e.target.value);
                        setParseBanner(null);
                      }}
                      placeholder="CV metnini buraya yapıştırın…"
                      className="min-h-[140px] font-mono text-xs leading-relaxed"
                    />
                    <Button
                      variant="primary"
                      className={cn("w-full font-bold shadow-lg", busy && "opacity-60")}
                      disabled={busy || !cvText.trim()}
                      onClick={onParse}
                    >
                      {busy ? (
                        <>
                          <LoadingSpinner /> Analiz ediliyor...
                        </>
                      ) : (
                        "✨ Özgeçmişi Analiz Et"
                      )}
                    </Button>
                  </div>

                  {parseBanner && (
                    <div
                      className="rounded-xl p-3 text-xs"
                      style={{
                        background: "linear-gradient(135deg, rgba(107,33,168,0.08), rgba(168,85,247,0.05))",
                        border: "1px solid rgba(168,85,247,0.2)",
                      }}
                    >
                      <p className="font-semibold text-purple-700 dark:text-[#C084FC]">🌟 {parseBanner}</p>
                      <p className="mt-0.5" style={{ color: "var(--text-muted)" }}>
                        Düzenlemek için <strong>Düzenle</strong> sekmesine geç.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Form Editor */}
              {editorTab === "form" && forgeParsedCv && (
                <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
                  
                  {/* Personal Info */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-[#C084FC]">{t("personalInfo")}</h4>
                    <div className="flex gap-3 items-center">
                      <div className="w-12 h-12 rounded-full bg-abyss-panel overflow-hidden border flex items-center justify-center shrink-0 relative group">
                        {forgeParsedCv.photoDataUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={forgeParsedCv.photoDataUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <Camera className="w-4 h-4 text-muted-steel" />
                        )}

                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => updateParsedField({ photoDataUrl: reader.result as string });
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder="Full Name"
                          value={forgeParsedCv.name}
                          onChange={(e) => updateParsedField({ name: e.target.value })}
                        />
                        <Input
                          placeholder="Professional Title"
                          value={forgeParsedCv.title || ""}
                          onChange={(e) => updateParsedField({ title: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Email"
                        value={forgeParsedCv.email || ""}
                        onChange={(e) => updateParsedField({ email: e.target.value })}
                      />
                      <Input
                        placeholder="Location"
                        value={forgeParsedCv.location || ""}
                        onChange={(e) => updateParsedField({ location: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-cosmic-teal">{t("summary")}</h4>
                    <Textarea
                      placeholder="Summary..."
                      value={forgeParsedCv.summary || ""}
                      onChange={(e) => updateParsedField({ summary: e.target.value })}
                      className="text-xs min-h-[70px]"
                    />
                  </div>

                  {/* Skills tags */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-cosmic-teal">{t("skills")}</h4>
                    <div className="flex flex-wrap gap-1">
                      {forgeParsedCv.skills.map((s) => (
                        <Badge
                          key={s}
                          variant="soft"
                          className="gap-1 cursor-pointer hover:bg-sunset-coral/10 hover:text-sunset-coral"
                          onClick={() => removeSkill(s)}
                        >
                          {s} ✕
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        id="new-skill-input"
                        placeholder="Add skill..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            addSkill((e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = "";
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const input = document.getElementById("new-skill-input") as HTMLInputElement;
                          if (input) {
                            addSkill(input.value);
                            input.value = "";
                          }
                        }}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Experience List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-cosmic-teal">{t("experience")}</h4>
                      <Button size="sm" variant="outline" onClick={addExperience}>
                        + Add Role
                      </Button>
                    </div>
                    <div className="space-y-3 border-t border-black/5 pt-2">
                      {forgeParsedCv.experience.map((exp, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-panel-elevated/75 border border-black/5 space-y-2 relative group">
                          <button
                            onClick={() => removeExperience(idx)}
                            className="absolute top-2 right-2 text-xs text-sunset-coral opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Remove
                          </button>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              placeholder="Company"
                              value={exp.company}
                              onChange={(e) => updateExperience(idx, { company: e.target.value })}
                            />
                            <Input
                              placeholder="Position"
                              value={exp.position}
                              onChange={(e) => updateExperience(idx, { position: e.target.value })}
                            />
                          </div>
                          <Input
                            placeholder="Duration (e.g. 2022 - 2024)"
                            value={exp.duration}
                            onChange={(e) => updateExperience(idx, { duration: e.target.value })}
                          />
                          <Textarea
                            placeholder="Highlights (one per line)..."
                            value={exp.description.join("\n")}
                            onChange={(e) => updateExperience(idx, { description: e.target.value.split("\n") })}
                            className="text-xs min-h-[60px] font-mono"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}



            </div>
          </div>

          {/* Right panel: Live Preview & AI Tools */}
          <div className="flex flex-col gap-4">
            
            {/* Tool tab links */}
            <div className="flex flex-wrap gap-1 p-1 rounded-2xl bg-purple-500/5 border border-purple-500/10">
              {(
                [
                  ["preview", "👁️", t("tabPreview")],
                  ["feedback", "🎯", t("tabAtsCheck")],
                  ["match", "🤝", t("tabMatchJd")],
                  ["cover", "✉️", t("tabCoverLetter")],
                  ["interview", "🗣️", t("tabInterviewPrep")],
                  ["chat", "💬", t("tabCoachChat")],
                ] as const
              ).map(([id, emoji, label]) => {
                const disabled = !forgeParsedCv && id !== "preview";
                const active = previewTab === id;
                return (
                  <button
                    key={id}
                    disabled={disabled}
                    onClick={() => setPreviewTab(id)}
                    className={cn(
                      "flex-1 px-2 py-1.5 rounded-xl text-[11px] font-semibold cursor-pointer transition-all whitespace-nowrap",
                      active
                        ? "bg-purple-600 text-white font-bold shadow-md shadow-purple-500/10"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-100 disabled:opacity-40 disabled:hover:text-slate-600/40"
                    )}
                  >
                    {emoji} {label}
                  </button>
                );
              })}
            </div>

            {/* Tool Output Window */}
            <div className="glass-panel rounded-3xl p-6 min-h-[460px]" style={{ border: "1px solid rgba(168,85,247,0.12)" }}>
              {clientAiError && (
                <div className="mb-4">
                  <ErrorAlert
                    title="Analiz şu an yapılamıyor"
                    message="Bağlantını kontrol et veya sayfayı yenile. Verilerin güvende."
                  />
                </div>
              )}
              
              {/* Tab 1: Live CV Preview */}
              {previewTab === "preview" && (
                <div>
                  {!forgeParsedCv ? (
                    <div className="text-center py-10">
                      <FileSearch className="w-8 h-8 mx-auto text-muted-steel mb-3" />
                      <p className="text-sm text-muted-steel">{t("noCvLoaded")}</p>
                    </div>
                  ) : (
                    <div className="bg-white text-slate-800 p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm max-w-full font-sans leading-relaxed text-left">
                      <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900 leading-tight">{forgeParsedCv.name}</p>
                          <p className="text-sm font-semibold mt-0.5 text-purple-700 dark:text-[#C084FC]">{forgeParsedCv.title || "Software Professional"}</p>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 mt-2">
                            {forgeParsedCv.email && <span>✉ {forgeParsedCv.email}</span>}
                            {forgeParsedCv.phone && <span>📞 {forgeParsedCv.phone}</span>}
                            {forgeParsedCv.location && <span>📍 {forgeParsedCv.location}</span>}
                          </div>
                        </div>
                        {forgeParsedCv.photoDataUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={forgeParsedCv.photoDataUrl}
                            alt="Avatar"
                            className="w-16 h-16 rounded-full object-cover border-2 border-slate-100 shadow-sm"
                          />
                        )}
                      </div>

                      {forgeParsedCv.summary && (
                        <div className="mb-4">
                           <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-l-4 border-purple-600 pl-2 mb-2">Summary</h3>
                          <p className="text-xs text-slate-600 text-justify">{forgeParsedCv.summary}</p>
                        </div>
                      )}

                      {forgeParsedCv.experience && forgeParsedCv.experience.length > 0 && (
                        <div className="mb-4">
                           <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-l-4 border-purple-600 pl-2 mb-2.5">Experience</h3>
                          <div className="space-y-3">
                            {forgeParsedCv.experience.map((exp, idx) => (
                              <div key={idx} className="text-xs">
                                <div className="flex justify-between font-semibold text-slate-800">
                                  <span>{exp.position}</span>
                                  <span className="text-slate-400 font-normal">{exp.duration}</span>
                                </div>
                                 <p className="font-medium my-0.5 text-purple-700 dark:text-[#C084FC]">{exp.company}</p>
                                {exp.description && exp.description.length > 0 && (
                                  <ul className="list-disc list-inside pl-2 space-y-0.5 text-slate-500">
                                    {exp.description.map((b, bIdx) => (
                                      <li key={bIdx}>{b}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {forgeParsedCv.skills && forgeParsedCv.skills.length > 0 && (
                        <div className="mb-4">
                           <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-l-4 border-purple-600 pl-2 mb-2">Skills</h3>
                          <div className="flex flex-wrap gap-1">
                            {forgeParsedCv.skills.map((s, idx) => (
                              <span key={idx} className="bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {forgeParsedCv.education && forgeParsedCv.education.length > 0 && (
                        <div>
                           <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-l-4 border-purple-600 pl-2 mb-2">Education</h3>
                          <div className="space-y-2">
                            {forgeParsedCv.education.map((edu, idx) => (
                              <div key={idx} className="text-xs">
                                <div className="flex justify-between font-semibold text-slate-800">
                                  <span>{edu.school}</span>
                                  <span className="text-slate-400 font-normal">{edu.year}</span>
                                </div>
                                <p className="text-slate-500">{edu.degree}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Solution journey (not just "analysis done") */}
              {previewTab === "feedback" && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-black/5 pb-3 gap-3">
                    <div>
                      <h2 className="font-extrabold tracking-tighter text-base">
                        Kariyer yolculuğu sonuçları
                      </h2>
                      <p className="text-xs text-slate-500">
                        Mevcut durum → ne kaybediyorsun → sırada ne var
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={busy || !forgeParsedCv}
                      onClick={onAts}
                      className={cn(busy && "opacity-60")}
                    >
                      {busy ? (
                        <>
                          <LoadingSpinner /> {t("analyzingLabel")}
                        </>
                      ) : (
                        "Skoru yenile"
                      )}
                    </Button>
                  </div>

                  {forgeParsedCv || cvFeedback || ats ? (
                    <>
                      <JourneyResults
                        insight={journeyInsight}
                        issues={
                          ats?.issues?.length
                            ? ats.issues
                            : cvFeedback?.improvements?.slice(0, 4)
                        }
                      />
                      <div className="rounded-2xl border border-purple-200/50 bg-purple-50/60 dark:bg-purple-500/10 dark:border-purple-500/20 p-4 space-y-2">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-[#C084FC]">
                          AI Koç fısıltısı
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                          {journeyInsight.coachHookTr}
                        </p>
                        <Link
                          href="/coach"
                          className="inline-flex text-sm font-semibold text-purple-600 dark:text-[#C084FC] hover:underline"
                        >
                          Özgeçmişinle sohbet et →
                        </Link>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-slate-500">
                      Yolculuk başlasın: CV&apos;nizi yükleyin veya yapıştırın — size “analiz bitti”
                      değil, “şimdi ne yapmalısınız” diyeceğiz.
                    </p>
                  )}
                </div>
              )}

              {/* Tab 3: Match JD */}
              {previewTab === "match" && (
                <div className="space-y-4">
                  <div>
                    <h2 className="font-semibold text-sm">Match Job Description (JD)</h2>
                    <p className="text-xs text-muted-steel mt-0.5">Compare your CV skills against a target job ad.</p>
                  </div>
                  <Textarea
                    placeholder="Paste job description details here..."
                    value={jdText}
                    onChange={(e) => setForgeJdText(e.target.value)}
                    className="text-xs min-h-[90px]"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={isLoading || !forgeParsedCv}
                      onClick={onAnalyze}
                      className={cn(isLoading && "opacity-60")}
                    >
                      {isLoading ? (
                        <>
                          <LoadingSpinner /> Analiz ediliyor…
                        </>
                      ) : (
                        "Check Match Score"
                      )}
                    </Button>
                    <Button size="sm" variant="ghostBorder" disabled={isLoading || !forgeParsedCv} onClick={onOptimize}>
                      Optimize for JD
                    </Button>
                  </div>
                  {clientAiError && (
                    <ErrorAlert
                      title="Analiz şu an yapılamıyor"
                      message="Bağlantını kontrol et veya sayfayı yenile."
                    />
                  )}

                  {forgeAnalysis && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-4 bg-panel-elevated/50 p-4 rounded-xl border border-black/5">
                        <div className="w-16 h-16 rounded-full border-4 border-purple-600 text-purple-700 dark:border-purple-400 dark:text-purple-300 flex items-center justify-center font-bold text-base">
                          {forgeAnalysis.matchScore}%
                        </div>
                        <div>
                          <p className="text-sm font-semibold">Job Match Compatibility</p>
                          <p className="text-xs text-muted-steel">Calculated keyword match rate compared to requirements.</p>
                        </div>
                      </div>

                      {/* Matching vs Missing */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1">
                          <p className="font-semibold text-cosmic-teal">Matched Skills ({forgeAnalysis.matchedSkills.length})</p>
                          <p className="text-muted-steel">{forgeAnalysis.matchedSkills.join(", ") || "None yet."}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-sunset-coral">Missing Skills ({forgeAnalysis.missingSkills.length})</p>
                          <p className="text-muted-steel">{forgeAnalysis.missingSkills.join(", ") || "None detected."}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Cover Letter */}
              {previewTab === "cover" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/5 pb-2">
                    <div>
                      <h2 className="font-semibold text-sm">Cover Letter Generator</h2>
                      <p className="text-xs text-muted-steel">Generates customized application letter.</p>
                    </div>
                    <div className="flex gap-1.5">
                      {(["Profesyonel", "Girişimci", "Teknik"] as CoverLetterTone[]).map((t) => (
                        <button
                          key={t}
                          onClick={() => setForgeTone(t)}
                          className={cn(
                            "px-2 py-1 rounded text-[10px] font-semibold border transition-colors cursor-pointer",
                            forgeTone === t ? "bg-star-white text-midnight-void border-transparent" : "border-black/5 text-muted-steel"
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button size="sm" variant="accent" className="w-full" disabled={busy || !forgeParsedCv} onClick={onCover}>
                    {busy ? "Drafting Cover Letter..." : "Generate Cover Letter"}
                  </Button>

                  {cover && (
                    <div className="space-y-3">
                      <Textarea
                        value={cover.coverLetter}
                        readOnly
                        className="min-h-[180px] font-sans text-xs leading-relaxed"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(cover.coverLetter);
                          toast.success("Copied to clipboard!");
                        }}
                      >
                        <Copy className="w-3.5 h-3.5 mr-1" /> Copy Letter
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 5: Interview Prep */}
              {previewTab === "interview" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-black/5 pb-2">
                    <div>
                      <h2 className="font-semibold text-sm">Interview Simulator</h2>
                      <p className="text-xs text-muted-steel">Role-aware questions and response advice.</p>
                    </div>
                    <Button size="sm" variant="accent" disabled={busy} onClick={onInterview}>
                      {busy ? "Generating..." : "Generate Questions"}
                    </Button>
                  </div>

                  {interview ? (
                    <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                      {interview.questions.map((q, idx) => (
                        <div key={idx} className="p-3 rounded-xl border border-black/5 bg-panel-elevated/50 space-y-1.5 text-xs">
                          <p className="font-bold text-cosmic-teal">Q: {q.question}</p>
                          <p className="text-[10px] uppercase text-muted-steel font-semibold">Category: {q.type}</p>
                          <p className="text-muted-steel leading-relaxed bg-black/5 p-2 rounded">
                            <strong className="text-star-white">Coach Tip:</strong> {q.exampleAnswer}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-steel">Click **Generate Questions** to simulate practice runs.</p>
                  )}
                </div>
              )}

              {/* Tab 6: Chat Coach */}
              {previewTab === "chat" && (
                <div className="space-y-3 flex flex-col min-h-[380px] justify-between">
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10 text-xs leading-relaxed">
                      <p className="font-bold text-purple-700 dark:text-purple-300">Kariyer Koçu:</p>
                      <p className="mt-1">Merhaba! Kariyer stratejileri, mülakat hazırlığı veya özgeçmişinizdeki ifadeleri geliştirme konusunda bana dilediğinizi sorabilirsiniz.</p>
                    </div>
                    {chatHistory.map((msg, idx) => (
                      <div key={idx} className="space-y-3">
                        {msg.sender === "user" ? (
                          <div className="p-3 rounded-xl bg-panel border border-slate-200/60 dark:border-slate-800 text-xs leading-relaxed max-w-[85%] ml-auto text-right">
                            <p className="font-semibold text-slate-800 dark:text-slate-200">Siz:</p>
                            <p className="mt-0.5 text-slate-700 dark:text-slate-300">{msg.text}</p>
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10 text-xs leading-relaxed max-w-[90%] mr-auto">
                            <p className="font-bold text-purple-700 dark:text-purple-300">
                              Kariyer Koçu {msg.category ? `(${msg.category})` : ""}:
                            </p>
                            <p className="mt-1 text-slate-700 dark:text-slate-300">{msg.text}</p>
                            {msg.actionableTips && msg.actionableTips.length > 0 && (
                              <ul className="mt-2 space-y-1 text-[11px] text-purple-900/80 dark:text-purple-300/80 list-disc pl-3">
                                {msg.actionableTips.map((tip, i) => <li key={i}>{tip}</li>)}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 border-t border-black/5 pt-3">
                    <Input
                      placeholder="Kariyer koçuna sorun (örn. 'mülakat hazırlığı', 'ATS önerileri')..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && chatInput.trim()) {
                          onChat();
                        }
                      }}
                    />
                    <Button size="sm" disabled={busy || !chatInput.trim()} onClick={onChat}>
                      {busy ? "Cevaplanıyor..." : "Sor"}
                    </Button>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div> {/* Closes Dynamic Split-View Workspace Grid */}

        {/* Right Column: ProTips Panel */}
        <ProTipsPanel editorTab={editorTab} previewTab={previewTab} activeSection={activeSection} />
      </div>
    )}

  </div>
</div>
</div>
</div>
  );
}
