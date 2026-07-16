"use client";

import { useMemo, useState, type ElementType } from "react";
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
  ExternalLink,
  FileDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatPill } from "@/components/StatPill";
import { FilePickButton } from "@/components/FilePickButton";
import { CvWizard } from "@/components/CvWizard";
import { CvFeedbackPanel } from "@/components/CvFeedbackPanel";
import { useCareerStore } from "@/store/useCareerStore";
import {
  parseCV,
  analyzeMatch,
  analyzeAts,
  optimizeCV,
  generateCoverLetter,
  generateInterview,
  forgeChatbot,
  CATEGORIES,
  cleanExtractedText,
  looksLikeRawPdf,
  parsedCvToText,
  downloadTextFile,
  downloadJsonFile,
  getJobRecommendations,
  exportCvAsPdf,
  generateCvFeedback,
  type CoverLetterTone,
  type OptimizedCV,
  type CoverLetterResult,
  type InterviewResult,
  type ChatbotResult,
  type AtsResult,
  type JobRecommendation,
  type ParsedCV,
} from "@/lib/forge";
import { cn } from "@/lib/utils";

type TabId =
  | "parse"
  | "create"
  | "analyze"
  | "optimize"
  | "coverletter"
  | "ats"
  | "jobs"
  | "chatbot"
  | "interview"
  | "history";

const READY_MSG =
  "CV'niz hazır. Şimdi iş ilanı yapıştırabilir, optimize edebilir veya iş önerileri alabilirsiniz.";

const tabs: { id: TabId; label: string; icon: ElementType }[] = [
  { id: "parse", label: "CV Parse", icon: FileSearch },
  { id: "create", label: "Create CV", icon: PenLine },
  { id: "analyze", label: "Match", icon: GitCompare },
  { id: "optimize", label: "Optimize", icon: Sparkles },
  { id: "coverletter", label: "Cover Letter", icon: Mail },
  { id: "ats", label: "ATS", icon: ShieldCheck },
  { id: "jobs", label: "Job Ideas", icon: Briefcase },
  { id: "chatbot", label: "Chatbot", icon: MessageSquare },
  { id: "interview", label: "Interview", icon: Mic2 },
  { id: "history", label: "History", icon: History },
];

export default function ForgePage() {
  const {
    forgeCvText,
    forgeJdText,
    forgeParsedCv,
    forgeAnalysis,
    forgeTone,
    forgeHistory,
    forgeBackups,
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

  const [tab, setTab] = useState<TabId>("parse");
  const [optimized, setOptimized] = useState<OptimizedCV | null>(null);
  const [cover, setCover] = useState<CoverLetterResult | null>(null);
  const [interview, setInterview] = useState<InterviewResult | null>(null);
  const [ats, setAts] = useState<AtsResult | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatResult, setChatResult] = useState<ChatbotResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [parseBanner, setParseBanner] = useState<string | null>(null);
  const [lastCvFileName, setLastCvFileName] = useState<string | null>(null);
  const [jobRecs, setJobRecs] = useState<JobRecommendation[]>([]);
  const [jobNote, setJobNote] = useState("");

  const cvText = forgeCvText;
  const jdText = forgeJdText;

  const ensureParsed = () => {
    if (forgeParsedCv) return forgeParsedCv;
    if (!cvText.trim()) {
      toast.error("Load or create a CV first.");
      return null;
    }
    try {
      const cleaned = cleanExtractedText(cvText);
      if (looksLikeRawPdf(cleaned)) {
        toast.error("CV text looks like raw PDF. Clear it and paste clean text.");
        return null;
      }
      const parsed = parseCV(cleaned);
      setForgeParsedCv(parsed);
      setForgeCvText(cleaned);
      return parsed;
    } catch {
      toast.error("Could not read this CV. Clear and try again.");
      return null;
    }
  };

  const run = async (fn: () => void) => {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 350));
    try {
      fn();
    } finally {
      setBusy(false);
    }
  };

  const runParse = (text: string, source: "manual" | "file" = "manual", fileName?: string) => {
    if (!text.trim()) {
      toast.error("Paste your CV text or choose a PDF/TXT file first.");
      return null;
    }
    const cleaned = cleanExtractedText(text);
    if (looksLikeRawPdf(cleaned) || looksLikeRawPdf(text)) {
      toast.error(
        "This looks like raw PDF code, not readable CV text. Use a text-based PDF, TXT, or paste the text."
      );
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
        summary: `${parsed.name} — ${parsed.skills.length} skills, ${parsed.experience.length} roles${
          source === "file" ? " (file)" : ""
        }`,
        payload: parsed,
      });
      setParseBanner(READY_MSG);
      toast.success(READY_MSG);
      setTab("parse");
      return parsed;
    } catch {
      toast.error(
        "Could not build a clean CV structure. Paste plain text or try another PDF/TXT file."
      );
      setForgeParsedCv(null);
      setParseBanner(null);
      return null;
    }
  };

  const handleCvFile = (text: string, fileName: string) => {
    // Only store cleaned human text — never binary PDF dumps
    const cleaned = cleanExtractedText(text);
    if (!cleaned.trim() || looksLikeRawPdf(cleaned)) {
      toast.error(
        "Could not extract clean text from this file. Paste the CV text instead."
      );
      return;
    }
    setForgeCvText(cleaned);
    run(() => {
      runParse(cleaned, "file", fileName);
    });
  };

  const onClearCv = () => {
    clearForgeCv();
    setOptimized(null);
    setCover(null);
    setInterview(null);
    setAts(null);
    setJobRecs([]);
    setJobNote("");
    setParseBanner(null);
    setLastCvFileName(null);
    toast.message("CV cleared. You can start fresh.");
    setTab("parse");
  };

  const onBackupCv = () => {
    const bak = saveForgeBackup();
    if (!bak) {
      toast.error("Nothing to save. Load or create a CV first.");
      return;
    }
    if (forgeParsedCv) {
      downloadJsonFile(
        `cv-backup-${bak.id}.json`,
        { label: bak.label, parsed: forgeParsedCv, text: forgeCvText }
      );
      downloadTextFile(
        `cv-backup-${bak.id}.txt`,
        forgeCvText || parsedCvToText(forgeParsedCv)
      );
    } else if (forgeCvText.trim()) {
      downloadTextFile(`cv-backup-${bak.id}.txt`, forgeCvText);
    }
    pushForgeHistory({
      action: "backup",
      summary: bak.label,
      payload: { id: bak.id, label: bak.label },
    });
    toast.success("Backup saved in the app and downloaded to your computer.");
  };

  const onWizardComplete = (cv: ParsedCV, text: string) => {
    setForgeCvText(text);
    setForgeParsedCv(cv);
    setParseBanner(READY_MSG);
    pushForgeHistory({
      action: "create",
      summary: `${cv.name} — built from scratch`,
      payload: cv,
    });
    toast.success(READY_MSG);
    setTab("parse");
  };

  const onExportPdf = async () => {
    const parsed = ensureParsed();
    if (!parsed) return;
    try {
      setBusy(true);
      await exportCvAsPdf(parsed);
      toast.success("Professional PDF downloaded.");
    } catch {
      toast.error("Could not export PDF. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const onJobRecs = () => {
    const parsed = ensureParsed();
    if (!parsed) return;
    setBusy(true);
    setTab("jobs");
    void getJobRecommendations(parsed)
      .then(({ items, note }) => {
        setJobRecs(items);
        setJobNote(note);
        pushForgeHistory({
          action: "jobs",
          summary: `${items.length} job ideas for ${parsed.title}`,
          payload: { count: items.length },
        });
        toast.success("Job ideas ready — including web searches and board matches.");
      })
      .catch(() => toast.error("Could not load job ideas right now."))
      .finally(() => setBusy(false));
  };

  const onParse = () =>
    run(() => {
      runParse(cvText, "manual");
    });

  const onAnalyze = () =>
    run(() => {
      const parsed = ensureParsed();
      if (!parsed) return;
      if (!jdText.trim()) {
        toast.error("İş ilanı (JD) metnini de yapıştır.");
        return;
      }
      const analysis = analyzeMatch(parsed, jdText);
      setForgeAnalysis(analysis);
      pushForgeHistory({
        action: "analyze",
        summary: `Match %${analysis.matchScore} · ATS %${analysis.atsScore}`,
        payload: analysis,
      });
      toast.success(`Match skoru: %${analysis.matchScore}`);
      setTab("analyze");
    });

  const onOptimize = () =>
    run(() => {
      const parsed = ensureParsed();
      if (!parsed) return;
      const result = optimizeCV(parsed, forgeAnalysis, jdText);
      setOptimized(result);
      pushForgeHistory({
        action: "optimize",
        summary: `${result.optimizedSkills.length} skill · ${result.optimizedExperience.length} deneyim optimize`,
        payload: result,
      });
      toast.success("CV optimize edildi");
      setTab("optimize");
    });

  const onCover = () =>
    run(() => {
      const parsed = ensureParsed();
      if (!parsed) return;
      if (!jdText.trim()) {
        toast.error("Cover letter için JD gerekli.");
        return;
      }
      const result = generateCoverLetter(parsed, jdText, forgeTone, forgeAnalysis);
      setCover(result);
      pushForgeHistory({
        action: "coverletter",
        summary: `${result.tone} ton · ${result.keyPoints.length} vurgu`,
        payload: result,
      });
      toast.success("Cover letter hazır");
      setTab("coverletter");
    });

  const onAts = () =>
    run(() => {
      const parsed = ensureParsed();
      if (!parsed) return;
      const result = analyzeAts(parsed, jdText);
      setAts(result);
      pushForgeHistory({
        action: "ats",
        summary: `ATS %${result.atsScore} · kelime örtüşme %${result.keywordCoverage}`,
        payload: result,
      });
      toast.success(`ATS skoru: %${result.atsScore}`);
      setTab("ats");
    });

  const onInterview = () =>
    run(() => {
      const parsed = ensureParsed() || parseCV(cvText || "Aday\nSoftware Engineer\nReact TypeScript");
      if (!forgeParsedCv && cvText.trim()) setForgeParsedCv(parsed);
      const result = generateInterview(parsed, jdText);
      setInterview(result);
      pushForgeHistory({
        action: "interview",
        summary: `${result.questions.length} soru · ${result.roleHint}`,
        payload: result,
      });
      toast.success("Mülakat seti hazır");
      setTab("interview");
    });

  const onChat = () =>
    run(() => {
      const result = forgeChatbot(chatInput, forgeParsedCv, forgeAnalysis);
      setChatResult(result);
      pushForgeHistory({
        action: "chatbot",
        summary: `${result.category}: ${result.response.slice(0, 80)}…`,
        payload: result,
      });
      setTab("chatbot");
    });

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Panoya kopyalandı");
    } catch {
      toast.error("Kopyalanamadı");
    }
  };

  const historyPreview = useMemo(() => forgeHistory.slice(0, 8), [forgeHistory]);
  const cvFeedback = useMemo(
    () => (forgeParsedCv ? generateCvFeedback(forgeParsedCv, forgeCvText) : null),
    [forgeParsedCv, forgeCvText]
  );

  return (
    <div className="px-4 md:px-8 pb-20 pt-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Badge variant="accent" className="mb-3">
            SoftBridge · Forge AI
          </Badge>
          <h1 className="font-display text-3xl md:text-4xl font-semibold flex items-center gap-2">
            <Anvil className="w-8 h-8 text-cosmic-teal" />
            Forge
          </h1>
          <p className="text-muted-steel mt-2 max-w-2xl leading-relaxed">
            Hi — I&apos;m Forge from SoftBridge CareerForge (SoftBridge Solutions). Build or upload a
            CV, match jobs, optimize for ATS, export a polished PDF, and prepare for interviews —
            private to your browser.
          </p>
          <a
            href="https://github.com/Dpehect/Softbridge-Career-Forge-FullStack-Web-App/tree/main"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-black/10 bg-star-white text-midnight-void px-4 py-2 text-sm font-semibold shadow-[0_6px_20px_rgba(92,46,31,0.08)] hover:bg-cosmic-teal transition-colors"
          >
            Open Source on GitHub
          </a>
        </div>

        <div className="grid lg:grid-cols-[1fr_1fr] gap-4 mb-6">
          <div className="glass-panel rounded-2xl p-4 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-steel">
                CV metni
              </p>
              <div className="flex flex-wrap items-center gap-1.5">
                <FilePickButton
                  label="Choose CV from computer"
                  silentSuccess
                  onText={(text, fileName) => handleCvFile(text, fileName)}
                />
                <FilePickButton
                  label="Browse folders"
                  variant="ghost"
                  silentSuccess
                  onText={(text, fileName) => handleCvFile(text, fileName)}
                />
                <Button size="sm" variant="ghost" onClick={onClearCv}>
                  <RotateCcw className="w-3.5 h-3.5" /> Clear / Reset CV
                </Button>
              </div>
            </div>
            <p className="text-[11px] text-muted-steel">
              Paste text or choose a <strong>PDF/TXT</strong> file. No sample CVs. Scanned PDFs need a
              searchable export or manual paste.
            </p>
            <Textarea
              value={cvText}
              onChange={(e) => {
                setForgeCvText(e.target.value);
                setParseBanner(null);
              }}
              placeholder="Paste your CV text here…"
              className="min-h-[180px] font-mono text-xs"
            />
          </div>
          <div className="glass-panel rounded-2xl p-4 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-steel">
                Job description
              </p>
              <div className="flex flex-wrap items-center gap-1.5">
                <FilePickButton
                  label="Choose JD file"
                  onText={(text) => setForgeJdText(text)}
                />
              </div>
            </div>
            <p className="text-[11px] text-muted-steel">
              Paste a job ad or upload a text file for match scoring.
            </p>
            <Textarea
              value={jdText}
              onChange={(e) => setForgeJdText(e.target.value)}
              placeholder="Paste the job description here…"
              className="min-h-[180px] font-mono text-xs"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <Button variant="accent" disabled={busy} onClick={onParse}>
            Parse
          </Button>
          <Button variant="default" disabled={busy} onClick={onAnalyze}>
            Compare
          </Button>
          <Button variant="outline" disabled={busy} onClick={onOptimize}>
            Optimize
          </Button>
          <Button variant="outline" disabled={busy} onClick={onCover}>
            Cover letter
          </Button>
          <Button variant="outline" disabled={busy} onClick={onAts}>
            ATS check
          </Button>
          <Button variant="outline" disabled={busy} onClick={onJobRecs}>
            <Briefcase className="w-4 h-4" /> Job ideas
          </Button>
          <Button variant="outline" disabled={busy} onClick={onInterview}>
            Mock interview
          </Button>
          <Button variant="soft" disabled={busy} onClick={onBackupCv}>
            <Save className="w-4 h-4" /> Backup CV
          </Button>
          <Button variant="outline" disabled={busy} onClick={() => void onExportPdf()}>
            <FileDown className="w-4 h-4" /> Export PDF
          </Button>
          <Button variant="ghost" disabled={busy} onClick={onClearCv}>
            <RotateCcw className="w-4 h-4" /> Clear CV
          </Button>
          <Button variant="ghost" disabled={busy} onClick={() => setTab("create")}>
            <PenLine className="w-4 h-4" /> Create from scratch
          </Button>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer",
                  tab === t.id
                    ? "bg-star-white text-midnight-void border-transparent"
                    : "border-black/8 text-muted-steel hover:text-star-white"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="glass-panel rounded-3xl p-5 md:p-7 min-h-[320px]">
          {tab === "parse" && (
            <div className="space-y-5">
              <div>
                <h2 className="font-semibold text-lg">Structured CV</h2>
                <p className="text-sm text-muted-steel mt-1">
                  Paste text or pick a PDF/TXT file. Clean text only — no raw PDF code. Results show
                  below and go to Past Analyses.
                </p>
              </div>

              <div className="rounded-2xl border border-black/8 bg-panel-elevated/40 p-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <FilePickButton
                    label="Choose CV from computer"
                    variant="accent"
                    size="default"
                    silentSuccess
                    onText={(text, fileName) => handleCvFile(text, fileName)}
                  />
                  <FilePickButton
                    label="Browse folders"
                    variant="outline"
                    size="default"
                    silentSuccess
                    onText={(text, fileName) => handleCvFile(text, fileName)}
                  />
                  <Button variant="soft" disabled={busy || !cvText.trim()} onClick={onParse}>
                    Parse text
                  </Button>
                  <Button variant="outline" size="default" onClick={onBackupCv}>
                    <Save className="w-4 h-4" /> Backup
                  </Button>
                  <Button variant="ghost" size="default" onClick={onClearCv}>
                    <RotateCcw className="w-4 h-4" /> Clear
                  </Button>
                </div>
                <p className="text-[11px] text-muted-steel">
                  Formats: <strong>PDF</strong>, <strong>TXT</strong> (MD ok). Click to open the system
                  file window — browse folders by clicking. Auto-parse after pick.
                </p>
                <Textarea
                  value={cvText}
                  onChange={(e) => {
                    setForgeCvText(e.target.value);
                    setParseBanner(null);
                  }}
                  placeholder="Paste CV text here… or choose a file above."
                  className="min-h-[140px] font-mono text-xs"
                />
                {lastCvFileName && (
                  <p className="text-xs text-muted-steel">
                    Last file:{" "}
                    <span className="font-semibold text-star-white">{lastCvFileName}</span>
                  </p>
                )}
              </div>

              {parseBanner && (
                <div className="rounded-2xl border border-cosmic-teal/25 bg-cosmic-teal/10 px-4 py-3 space-y-1">
                  <p className="text-sm font-semibold text-star-white">{parseBanner}</p>
                  <p className="text-xs text-muted-steel">
                    Next: paste a job description to compare, or run Optimize.
                  </p>
                </div>
              )}

              {!forgeParsedCv ? (
                <p className="text-sm text-muted-steel">
                  Henüz parse yok. Metin yapıştırıp <strong>Metni Parse Et</strong> de veya{" "}
                  <strong>Bilgisayardan CV Seç</strong> ile dosya yükle.
                </p>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2 justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="accent">Structured CV</Badge>
                      <span className="text-xs text-muted-steel">Ready for jobs & export</span>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => void onExportPdf()}>
                      <FileDown className="w-4 h-4" /> Export PDF
                    </Button>
                  </div>
                  {forgeParsedCv.photoDataUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={forgeParsedCv.photoDataUrl}
                      alt=""
                      className="w-16 h-16 rounded-2xl object-cover border border-black/8"
                    />
                  )}
                  <div className="flex flex-wrap gap-2">
                    <StatPill label="Name" value={forgeParsedCv.name} />
                    <StatPill label="Title" value={forgeParsedCv.title} />
                    <StatPill label="Skills" value={forgeParsedCv.skills.length} />
                    <StatPill label="Roles" value={forgeParsedCv.experience.length} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-muted-steel mb-1">Contact</p>
                      <p>{forgeParsedCv.email || "—"}</p>
                      <p className="text-muted-steel">{forgeParsedCv.phone || "No phone"}</p>
                      <p className="text-muted-steel">{forgeParsedCv.location || "No location"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-muted-steel mb-1">Summary</p>
                      <p className="text-ink-soft leading-relaxed">
                        {forgeParsedCv.summary || "No summary detected"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-muted-steel mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {forgeParsedCv.skills.map((s) => (
                        <Badge key={s} variant="soft">
                          {s}
                        </Badge>
                      ))}
                      {forgeParsedCv.skills.length === 0 && (
                        <span className="text-sm text-muted-steel">No skills detected</span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase text-muted-steel">Experience</p>
                    {forgeParsedCv.experience.length === 0 && (
                      <p className="text-sm text-muted-steel">No experience blocks detected</p>
                    )}
                    {forgeParsedCv.experience.map((e, i) => (
                      <div key={i} className="rounded-xl border border-black/5 p-3 bg-panel-elevated/50">
                        <p className="font-semibold text-sm">
                          {e.position} · {e.company}
                        </p>
                        <p className="text-xs text-muted-steel mb-2">{e.duration}</p>
                        <ul className="space-y-1">
                          {e.description.map((d) => (
                            <li key={d} className="text-sm text-ink-soft">
                              • {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  {cvFeedback && <CvFeedbackPanel feedback={cvFeedback} />}
                  {forgeParsedCv.education.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase text-muted-steel mb-2">Education</p>
                      <ul className="space-y-1 text-sm">
                        {forgeParsedCv.education.map((edu, i) => (
                          <li key={i}>
                            {edu.school} — {edu.degree} ({edu.year})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="text-xs text-cosmic-teal">
                    Sonuç burada ve geçmişte saklanmıştır. Sonraki adım: iş ilanı yapıştır →{" "}
                    <strong>Karşılaştır</strong> veya <strong>Optimize et</strong>.
                  </p>
                </>
              )}
            </div>
          )}

          {tab === "create" && (
            <CvWizard onComplete={onWizardComplete} />
          )}

          {tab === "jobs" && (
            <div className="space-y-4">
              <h2 className="font-semibold text-lg">Job recommendations</h2>
              <p className="text-sm text-muted-steel">
                Based on your CV: CareerForge roles, live remote listings when available, and ready
                web searches (LinkedIn / Indeed / RemoteOK).
              </p>
              <Button variant="accent" disabled={busy} onClick={onJobRecs}>
                {busy ? "Searching…" : "Refresh job ideas"}
              </Button>
              {jobNote && <p className="text-xs text-cosmic-teal">{jobNote}</p>}
              {jobRecs.length === 0 ? (
                <p className="text-sm text-muted-steel">
                  Load a CV first, then click <strong>Job ideas</strong>.
                </p>
              ) : (
                <ul className="space-y-3">
                  {jobRecs.map((j) => (
                    <li
                      key={j.id}
                      className="rounded-2xl border border-black/8 bg-panel-elevated/50 p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between"
                    >
                      <div>
                        <div className="flex flex-wrap gap-1.5 mb-1">
                          <Badge variant="accent">%{j.matchScore}</Badge>
                          <Badge variant="soft">{j.source}</Badge>
                        </div>
                        <p className="font-semibold">{j.title}</p>
                        <p className="text-sm text-muted-steel">
                          {j.company} · {j.location}
                        </p>
                        <p className="text-xs text-ink-soft mt-1">{j.reason}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {j.tags.slice(0, 4).map((t) => (
                            <Badge key={t}>{t}</Badge>
                          ))}
                        </div>
                      </div>
                      <a
                        href={j.url}
                        target={j.url.startsWith("http") ? "_blank" : undefined}
                        rel={j.url.startsWith("http") ? "noreferrer" : undefined}
                        className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl px-4 text-sm font-semibold bg-star-white text-midnight-void shrink-0"
                      >
                        Open <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {tab === "analyze" && (
            <div className="space-y-4">
              <h2 className="font-semibold text-lg">Job ad × CV match</h2>
              {!forgeAnalysis ? (
                <p className="text-sm text-muted-steel">CV + JD ile <strong>Karşılaştır</strong> çalıştır.</p>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    <StatPill label="Match" value={`%${forgeAnalysis.matchScore}`} />
                    <StatPill label="ATS" value={`%${forgeAnalysis.atsScore}`} />
                    <StatPill label="Eşleşen" value={forgeAnalysis.matchedSkills.length} />
                    <StatPill label="Eksik" value={forgeAnalysis.missingSkills.length} />
                  </div>
                  <Section title="Güçlü yönler" items={forgeAnalysis.strengths} />
                  <Section title="Boşluklar" items={forgeAnalysis.gaps} />
                  <Section title="Öneriler" items={forgeAnalysis.suggestions} />
                  <div>
                    <p className="text-[10px] font-bold uppercase text-muted-steel mb-2">
                      Eşleşen beceriler
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {forgeAnalysis.matchedSkills.map((s) => (
                        <Badge key={s} variant="accent">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-muted-steel mb-2">
                      Eksik beceriler
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {forgeAnalysis.missingSkills.map((s) => (
                        <Badge key={s}>{s}</Badge>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-cosmic-teal">
                    Sonraki adım: Optimize et veya Cover letter üret.
                  </p>
                </>
              )}
            </div>
          )}

          {tab === "optimize" && (
            <div className="space-y-4">
              <h2 className="font-semibold text-lg">ATS dostu optimizasyon</h2>
              {!optimized ? (
                <p className="text-sm text-muted-steel">
                  Parse sonrası <strong>Optimize et</strong>’e bas. JD varsa daha isabetli olur.
                </p>
              ) : (
                <>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-muted-steel mb-1">Özet</p>
                    <p className="text-sm leading-relaxed">{optimized.optimizedSummary}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {optimized.optimizedSkills.map((s) => (
                      <Badge key={s} variant="soft">
                        {s}
                      </Badge>
                    ))}
                  </div>
                  {optimized.optimizedExperience.map((e, i) => (
                    <div key={i} className="rounded-xl border border-black/5 p-3">
                      <p className="font-semibold text-sm">
                        {e.position} · {e.company}{" "}
                        <span className="text-muted-steel font-normal">({e.duration})</span>
                      </p>
                      <ul className="mt-2 space-y-1">
                        {e.description.map((d) => (
                          <li key={d} className="text-sm">
                            • {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <Section title="Genel öneriler" items={optimized.generalSuggestions} />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      copyText(
                        [
                          optimized.optimizedSummary,
                          "",
                          optimized.optimizedSkills.join(", "),
                          "",
                          ...optimized.optimizedExperience.flatMap((e) => [
                            `${e.position} | ${e.company} | ${e.duration}`,
                            ...e.description.map((d) => `- ${d}`),
                            "",
                          ]),
                        ].join("\n")
                      )
                    }
                  >
                    <Copy className="w-4 h-4" /> Optimize metni kopyala
                  </Button>
                </>
              )}
            </div>
          )}

          {tab === "coverletter" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 justify-between">
                <h2 className="font-semibold text-lg">Cover letter</h2>
                <div className="flex gap-1.5">
                  {(["Profesyonel", "Girişimci", "Teknik"] as CoverLetterTone[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setForgeTone(t)}
                      className={cn(
                        "px-3 py-1 rounded-lg text-xs font-semibold border cursor-pointer",
                        forgeTone === t
                          ? "bg-cosmic-teal/15 text-cosmic-teal border-cosmic-teal/25"
                          : "border-black/8 text-muted-steel"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              {!cover ? (
                <p className="text-sm text-muted-steel">
                  Ton seç → CV + JD ile <strong>Cover letter</strong> üret.
                </p>
              ) : (
                <>
                  <div className="flex flex-wrap gap-1.5">
                    {cover.keyPoints.map((k) => (
                      <Badge key={k} variant="accent">
                        {k}
                      </Badge>
                    ))}
                  </div>
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans bg-panel-elevated/60 border border-black/5 rounded-2xl p-4">
                    {cover.coverLetter}
                  </pre>
                  <Button size="sm" variant="outline" onClick={() => copyText(cover.coverLetter)}>
                    <Copy className="w-4 h-4" /> Kopyala
                  </Button>
                </>
              )}
            </div>
          )}

          {tab === "ats" && (
            <div className="space-y-4">
              <h2 className="font-semibold text-lg">ATS uyumluluk</h2>
              {!ats ? (
                <p className="text-sm text-muted-steel">
                  <strong>ATS kontrol</strong> ile skor ve iyileştirme listesi al.
                </p>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    <StatPill label="ATS skoru" value={`%${ats.atsScore}`} />
                    <StatPill label="Kelime örtüşme" value={`%${ats.keywordCoverage}`} />
                  </div>
                  <Section title="Sorunlar" items={ats.issues} />
                  <Section title="Düzeltmeler" items={ats.fixes} />
                  <p className="text-xs text-cosmic-teal">
                    Sonraki adım: Optimize çıktısını Resume forge’a taşı.
                  </p>
                </>
              )}
            </div>
          )}

          {tab === "chatbot" && (
            <div className="space-y-4">
              <h2 className="font-semibold text-lg">Kısıtlı chatbot</h2>
              <p className="text-sm text-muted-steel">
                Sadece hazır kategoriler. Serbest sohbet yok — net ve uygulanabilir cevap.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setChatInput(c)}
                    className="px-2.5 py-1 rounded-lg text-[11px] border border-black/8 text-muted-steel hover:text-cosmic-teal hover:border-cosmic-teal/30 cursor-pointer"
                  >
                    {c}
                  </button>
                ))}
              </div>
              <Textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Örn: Deneyim Güçlendirme — maddelerimi metrikli yaz"
                className="min-h-[80px]"
              />
              <Button variant="accent" disabled={busy || !chatInput.trim()} onClick={onChat}>
                Forge’a sor
              </Button>
              {chatResult && (
                <div className="rounded-2xl border border-black/5 bg-abyss-panel/50 p-4 space-y-3">
                  <Badge variant="accent">{chatResult.category}</Badge>
                  <p className="text-sm leading-relaxed">{chatResult.response}</p>
                  <Section title="Uygulanabilir ipuçları" items={chatResult.actionableTips} />
                  <p className="text-xs text-cosmic-teal">Sonraki adım: {chatResult.nextStep}</p>
                </div>
              )}
            </div>
          )}

          {tab === "interview" && (
            <div className="space-y-4">
              <h2 className="font-semibold text-lg">Mock interview</h2>
              {!interview ? (
                <p className="text-sm text-muted-steel">
                  CV (ve isteğe bağlı JD) ile <strong>Mock interview</strong> üret.
                </p>
              ) : (
                <>
                  <p className="text-sm text-muted-steel">Rol ipucu: {interview.roleHint}</p>
                  <Section title="İpuçları" items={interview.tips} />
                  <div className="space-y-3">
                    {interview.questions.map((q, i) => (
                      <div key={i} className="rounded-xl border border-black/5 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge>{q.type}</Badge>
                          <span className="text-[10px] font-mono text-muted-steel">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                        </div>
                        <p className="font-semibold text-sm mb-2">{q.question}</p>
                        <p className="text-sm text-ink-soft leading-relaxed">
                          <span className="text-cosmic-teal font-semibold">Örnek: </span>
                          {q.exampleAnswer}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {tab === "history" && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-lg">Past analyses</h2>
                  {forgeHistory.length > 0 && (
                    <Button size="sm" variant="ghost" onClick={clearForgeHistory}>
                      <Trash2 className="w-4 h-4" /> Clear history
                    </Button>
                  )}
                </div>
                {historyPreview.length === 0 ? (
                  <p className="text-sm text-muted-steel">No history yet. Run a tool first.</p>
                ) : (
                  <ul className="space-y-2">
                    {historyPreview.map((h) => (
                      <li
                        key={h.id}
                        className="rounded-xl border border-black/5 px-3 py-3 flex flex-col sm:flex-row sm:items-center gap-2 justify-between"
                      >
                        <div>
                          <Badge variant="soft" className="mb-1">
                            {h.action}
                          </Badge>
                          <p className="text-sm">{h.summary}</p>
                        </div>
                        <p className="text-[11px] text-muted-steel shrink-0">
                          {new Date(h.createdAt).toLocaleString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">CV backups</h3>
                {forgeBackups.length === 0 ? (
                  <p className="text-sm text-muted-steel">
                    No backups yet. Use <strong>Backup CV</strong> to save one.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {forgeBackups.map((b) => (
                      <li
                        key={b.id}
                        className="rounded-xl border border-black/5 px-3 py-3 flex flex-col sm:flex-row sm:items-center gap-2 justify-between"
                      >
                        <div>
                          <p className="text-sm font-semibold">{b.label}</p>
                          <p className="text-[11px] text-muted-steel">
                            {new Date(b.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (restoreForgeBackup(b.id)) {
                                setParseBanner(READY_MSG);
                                toast.success("Backup restored.");
                                setTab("parse");
                              }
                            }}
                          >
                            Restore
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteForgeBackup(b.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <p className="text-xs text-muted-steel">
                History and backups stay in your browser (localStorage) — not sent to a server.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-steel mb-2">{title}</p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="text-sm text-ink-soft flex gap-2">
            <span className="text-cosmic-teal">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
