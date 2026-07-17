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
  } = useCareerStore();

  const { t } = useTranslation();
  const router = useRouter();

  const [editorTab, setEditorTab] = useState<EditorTabId>("raw");
  const [previewTab, setPreviewTab] = useState<PreviewTabId>("preview");

  const [mounted, setMounted] = useState(false);
  const [optimized, setOptimized] = useState<OptimizedCV | null>(null);
  const [cover, setCover] = useState<CoverLetterResult | null>(null);
  const [interview, setInterview] = useState<InterviewResult | null>(null);
  const [ats, setAts] = useState<AtsResult | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatResult, setChatResult] = useState<ChatbotResult | null>(null);
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

  if (!mounted || isLoadingModel) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 py-16">
        <div
          className="w-12 h-12 rounded-full border-[3px] border-t-transparent animate-spin"
          style={{ borderColor: "#4F46E5", borderTopColor: "transparent" }}
        />
        <div className="text-center space-y-1">
          <p className="font-extrabold tracking-tighter text-lg text-star-white">
            Kariyer Asistanı Hazırlanıyor…
          </p>
          <p className="text-sm text-slate-500 max-w-sm">
            {statusMessage ||
              "İlk seferde model tarayıcınıza iner (5–10 sn). Verileriniz cihazınızda kalır."}
          </p>
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
          "Analiz şu an yapılamıyor. Bağlantını kontrol et veya birkaç saniye sonra tekrar dene."
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

  const onChat = () =>
    run(async () => {
      try {
        if (!forgeParsedCv) return;
        const result = await simulateAIResponse("chat", forgeParsedCv, {
          message: chatInput,
          jd: jdText,
        });
        setChatResult(result);
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
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: "rgba(168,85,247,0.12)", color: "#A855F7" }}>
              <Anvil className="w-3.5 h-3.5" />
              SoftBridge · Workspace
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-star-white">{t("forgeTitle")}</h1>
            <p className="text-sm text-muted-steel mt-1 max-w-xl leading-relaxed">{t("forgeDesc")}</p>
            <p className="text-xs text-indigo-600 mt-2 font-semibold">
              %100 tarayıcı AI · sunucu yok · API anahtarı yok · verileriniz gizli
            </p>
            {(analyzing || modelBanner) && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/90 px-3 py-2 text-xs font-semibold text-indigo-800 dark:bg-indigo-500/10 dark:border-indigo-500/30 dark:text-indigo-200">
                <LoadingSpinner />
                {modelBanner || statusMessage || "Analiz ediliyor…"}
              </div>
            )}
            {clientAiError && (
              <div className="mt-2">
                <ErrorAlert
                  title="Analiz şu an yapılamıyor"
                  message="Bağlantını kontrol et veya sayfayı yenile. Model indirilemediyse tekrar dene — verilerin güvende."
                />
              </div>
            )}
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

        {/* Dynamic Split-View Workspace Grid */}
        <div className="grid lg:grid-cols-[42%_58%] gap-6 items-start">
          
          {/* Left panel: Editors */}
          <div className="flex flex-col gap-4">
            
            {/* Editor Tabs Navigation */}
            <div className="flex gap-1 p-1 rounded-2xl bg-indigo-50/80 border border-indigo-100 dark:bg-indigo-500/10 dark:border-indigo-500/20">
              {(
                [
                  ["raw", "Yükle"],
                  ["form", "Düzenle"],
                  ["versions", `Yedekler (${forgeBackups.length})`],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setEditorTab(id as EditorTabId)}
                  disabled={id === "form" && !forgeParsedCv}
                  className={cn(
                    "flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-40",
                    editorTab === id
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                      : "text-slate-600 hover:text-indigo-600 dark:text-slate-300"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Editor Content Area */}
            <div className="glass-panel rounded-3xl p-5 min-h-[460px] border border-slate-200/80 dark:border-white/10">
              
              {/* Tab 1: Drop zone + paste */}
              {editorTab === "raw" && (
                <div className="space-y-5">
                  {!forgeParsedCv ? (
                    <>
                      <div className="text-center space-y-1 pb-1">
                        <h3 className="font-bold tracking-tight text-base text-star-white">
                          İlk analizinle kariyerini güçlendir
                        </h3>
                        <p className="text-xs text-slate-500">
                          CV&apos;ni yükle — yapay zeka tarayıcında çalışır, verin sunucuya gitmez.
                        </p>
                      </div>
                      <CvDropZone
                        redirectTo={null}
                        compact
                        onParsed={(_p, _text, fileName) => {
                          setLastCvFileName(fileName);
                          setParseBanner("CV yüklendi. Sağ panelden analiz sonuçlarını inceleyin.");
                          setEditorTab("form");
                          setPreviewTab("feedback");
                        }}
                      />
                    </>
                  ) : (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                      <p className="font-semibold">
                        CV yüklendi{lastCvFileName ? `: ${lastCvFileName}` : ""}
                      </p>
                      <p className="text-xs mt-1 opacity-90">
                        Sağda yolculuk sonuçlarını gör · “Düzenle” ile alanları güncelle.
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
                          <LoadingSpinner /> Analiz ediliyor…
                        </>
                      ) : (
                        "Yapıştırılan metni analiz et"
                      )}
                    </Button>
                  </div>

                  {parseBanner && (
                    <div className="rounded-xl border border-indigo-200 bg-indigo-50/90 p-3 text-xs dark:border-indigo-500/30 dark:bg-indigo-500/10">
                      <p className="font-semibold text-indigo-800 dark:text-indigo-200">
                        {parseBanner}
                      </p>
                      <p className="mt-0.5 text-slate-600 dark:text-slate-400">
                        Alanları düzenlemek için <strong>Düzenle</strong> sekmesine geç.
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
                    <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: "#A855F7" }}>{t("personalInfo")}</h4>
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

              {/* Tab 3: Backups & Versions */}
              {editorTab === "versions" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Backup files</h3>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        id="json-import-editor"
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
                                  toast.success("Backup imported successfully!");
                                  setEditorTab("form");
                                } else {
                                  toast.error("Invalid backup file.");
                                }
                              } catch {
                                toast.error("Could not parse file.");
                              }
                            };
                            reader.readAsText(file);
                          }
                        }}
                      />
                      <Button size="sm" variant="outline" onClick={() => document.getElementById("json-import-editor")?.click()}>
                        Import JSON
                      </Button>
                      <Button size="sm" variant="accent" onClick={onBackupCv}>
                        Create Backup
                      </Button>
                    </div>
                  </div>

                  {/* Render Backups */}
                  {forgeBackups.length === 0 ? (
                    <p className="text-xs text-muted-steel">No backups created in this session. Click **Create Backup** to download your current status as a backup file.</p>
                  ) : (
                    <ul className="space-y-2">
                      {forgeBackups.map((bak) => (
                        <li key={bak.id} className="p-3 rounded-xl border border-black/5 bg-panel-elevated/50 flex justify-between items-center text-xs">
                          <div>
                            <p className="font-semibold">{bak.label}</p>
                            <p className="text-[10px] text-muted-steel">{new Date(bak.createdAt).toLocaleString()}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                restoreForgeBackup(bak.id);
                                toast.success("Backup profile loaded.");
                                setEditorTab("form");
                              }}
                            >
                              Restore
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => deleteForgeBackup(bak.id)}>
                              ✕
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* Right panel: Live Preview & AI Tools */}
          <div className="flex flex-col gap-4">
            
            {/* Tool tab links */}
            <div className="flex flex-wrap gap-1 p-1 rounded-2xl" style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.12)" }}>
              {(
                [
                  ["preview", "👁️", "Preview"],
                  ["feedback", "🎯", "ATS Check"],
                  ["match", "🤝", "Match JD"],
                  ["cover", "✉️", "Cover Letter"],
                  ["interview", "🗣️", "Interview"],
                  ["chat", "💬", "Coach Chat"],
                ] as const
              ).map(([id, emoji, label]) => (
                <button
                  key={id}
                  onClick={() => setPreviewTab(id)}
                  className="flex-1 px-2 py-1.5 rounded-xl text-[11px] font-semibold cursor-pointer transition-all whitespace-nowrap"
                  style={previewTab === id
                    ? { background: "linear-gradient(135deg,#6B21A8,#A855F7)", color: "white", boxShadow: "0 4px 12px rgba(107,33,168,0.3)" }
                    : { color: "var(--text-muted)" }}
                >
                  {emoji} {label}
                </button>
              ))}
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
                          <p className="text-sm font-semibold mt-0.5" style={{ color: "#6B21A8" }}>{forgeParsedCv.title || "Software Professional"}</p>
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
                           <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-l-4 pl-2 mb-2" style={{ borderColor: "#6B21A8" }}>Summary</h3>
                          <p className="text-xs text-slate-600 text-justify">{forgeParsedCv.summary}</p>
                        </div>
                      )}

                      {forgeParsedCv.experience && forgeParsedCv.experience.length > 0 && (
                        <div className="mb-4">
                           <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-l-4 pl-2 mb-2.5" style={{ borderColor: "#6B21A8" }}>Experience</h3>
                          <div className="space-y-3">
                            {forgeParsedCv.experience.map((exp, idx) => (
                              <div key={idx} className="text-xs">
                                <div className="flex justify-between font-semibold text-slate-800">
                                  <span>{exp.position}</span>
                                  <span className="text-slate-400 font-normal">{exp.duration}</span>
                                </div>
                                 <p className="font-medium my-0.5" style={{ color: "#6B21A8" }}>{exp.company}</p>
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
                           <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-l-4 pl-2 mb-2" style={{ borderColor: "#6B21A8" }}>Skills</h3>
                          <div className="flex flex-wrap gap-1">
                            {forgeParsedCv.skills.map((s, idx) => (
                              <span key={idx} className="bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {forgeParsedCv.education && forgeParsedCv.education.length > 0 && (
                        <div>
                           <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-l-4 pl-2 mb-2" style={{ borderColor: "#6B21A8" }}>Education</h3>
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
                      <div className="rounded-2xl border border-indigo-200/50 bg-indigo-50/60 dark:bg-indigo-500/10 dark:border-indigo-500/20 p-4 space-y-2">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                          AI Koç fısıltısı
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                          {journeyInsight.coachHookTr}
                        </p>
                        <Link
                          href="/coach"
                          className="inline-flex text-sm font-semibold text-indigo-600 hover:underline"
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
                        <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center font-bold text-base" style={{ borderColor: "#A855F7", color: "#A855F7" }}>
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
                    <div className="p-3 rounded-xl bg-cosmic-teal/5 border border-cosmic-teal/10 text-xs leading-relaxed">
                      <p className="font-bold text-cosmic-teal">Career Coach:</p>
                      <p className="mt-1">Hi there! Ask me any career strategy advice, mülakat prep questions, or CV phrasing modifications.</p>
                    </div>
                    {chatResult && (
                      <div className="space-y-3">
                        <div className="p-3 rounded-xl bg-panel-elevated border text-xs leading-relaxed self-end">
                          <p className="font-semibold">You:</p>
                          <p className="mt-0.5 text-muted-steel">{chatInput}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-cosmic-teal/5 border border-cosmic-teal/10 text-xs leading-relaxed">
                          <p className="font-bold text-cosmic-teal">Career Coach ({chatResult.category}):</p>
                          <p className="mt-1">{chatResult.response}</p>
                          {chatResult.actionableTips && (
                            <ul className="mt-2 space-y-1 text-[11px] text-muted-steel list-disc pl-3">
                              {chatResult.actionableTips.map((tip, i) => <li key={i}>{tip}</li>)}
                            </ul>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 border-t border-black/5 pt-3">
                    <Input
                      placeholder="Ask the coach (e.g., 'mülakat prep', 'ATS tips')..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && chatInput.trim()) {
                          onChat();
                        }
                      }}
                    />
                    <Button size="sm" disabled={busy || !chatInput.trim()} onClick={onChat}>
                      {busy ? "Replying..." : "Ask"}
                    </Button>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
