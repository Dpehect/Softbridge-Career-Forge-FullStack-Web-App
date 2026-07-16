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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatPill } from "@/components/StatPill";
import { FilePickButton } from "@/components/FilePickButton";
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
  type CoverLetterTone,
  type OptimizedCV,
  type CoverLetterResult,
  type InterviewResult,
  type ChatbotResult,
  type AtsResult,
} from "@/lib/forge";
import { cn } from "@/lib/utils";

type TabId =
  | "parse"
  | "analyze"
  | "optimize"
  | "coverletter"
  | "ats"
  | "chatbot"
  | "interview"
  | "history";

const tabs: { id: TabId; label: string; icon: ElementType }[] = [
  { id: "parse", label: "CV Parse", icon: FileSearch },
  { id: "analyze", label: "Match", icon: GitCompare },
  { id: "optimize", label: "Optimize", icon: Sparkles },
  { id: "coverletter", label: "Cover Letter", icon: Mail },
  { id: "ats", label: "ATS", icon: ShieldCheck },
  { id: "chatbot", label: "Chatbot", icon: MessageSquare },
  { id: "interview", label: "Mülakat", icon: Mic2 },
  { id: "history", label: "Geçmiş", icon: History },
];

const SAMPLE_CV = `Ayşe Yılmaz
Senior Frontend Engineer
ayse.yilmaz@email.com | İstanbul | +90 532 000 00 00

Özet
React ve TypeScript ile kullanıcı odaklı web ürünleri geliştiren frontend mühendisi. Tasarım sistemleri, performans ve erişilebilirlik odaklı çalışır.

Deneyim
Senior Frontend Engineer @ Softbridge Solutions | 2023 – Present
- CareerForge ürün yüzeylerini Next.js ile geliştirdim
- Tasarım sistemi bileşenlerini standartlaştırdım
- Core Web Vitals iyileştirmeleri yaptım

Frontend Engineer @ Harbor Commerce | 2021 – 2023
- Merchant onboarding akışını yeniden tasarladım
- Aktivasyon metriklerinde iyileşme sağladım

Beceriler
TypeScript, React, Next.js, Tailwind, Zustand, Jest, Git, Figma

Eğitim
İstanbul Teknik Üniversitesi – Bilgisayar Mühendisliği Lisans 2021`;

const SAMPLE_JD = `Senior Frontend Engineer – Softbridge Solutions
Remote / Hybrid

We are looking for a Senior Frontend Engineer to build high-craft product surfaces with React, TypeScript, and Next.js.

Requirements:
- 5+ years React experience
- Strong TypeScript
- Next.js App Router
- Design systems and accessibility
- Experience with testing (Jest, Playwright)
- Collaboration with design and product

Nice to have: GraphQL, CI/CD, performance optimization, mentoring.`;

export default function ForgePage() {
  const {
    forgeCvText,
    forgeJdText,
    forgeParsedCv,
    forgeAnalysis,
    forgeTone,
    forgeHistory,
    setForgeCvText,
    setForgeJdText,
    setForgeParsedCv,
    setForgeAnalysis,
    setForgeTone,
    pushForgeHistory,
    clearForgeHistory,
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

  const cvText = forgeCvText;
  const jdText = forgeJdText;

  const ensureParsed = () => {
    if (!cvText.trim()) {
      toast.error("Önce CV metnini yapıştır.");
      return null;
    }
    const parsed = forgeParsedCv && forgeCvText ? forgeParsedCv : parseCV(cvText);
    setForgeParsedCv(parsed);
    return parsed;
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
      toast.error("Önce CV metnini yapıştır veya bilgisayardan CV seç.");
      return null;
    }
    const parsed = parseCV(text);
    setForgeParsedCv(parsed);
    if (fileName) setLastCvFileName(fileName);
    pushForgeHistory({
      action: "parse",
      summary: `${parsed.name} — ${parsed.skills.length} beceri, ${parsed.experience.length} deneyim${
        source === "file" ? " (dosya)" : ""
      }`,
      payload: parsed,
    });
    const successMsg =
      "CV'niz başarıyla yüklendi ve parse edildi. Şimdi iş ilanı yapıştırabilir veya doğrudan optimizasyon yapabilirsiniz.";
    setParseBanner(successMsg);
    toast.success(successMsg);
    toast.message("Sonuç burada ve geçmişte saklanmıştır");
    setTab("parse");
    return parsed;
  };

  const handleCvFile = (text: string, fileName: string) => {
    setForgeCvText(text);
    run(() => {
      runParse(text, "file", fileName);
    });
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
          <p className="text-muted-steel mt-2 max-w-2xl">
            CV parse, JD match, ATS optimizasyonu, cover letter, kısıtlı chatbot ve mock interview —
            hepsi tarayıcıda, local ve gizli. Ben SoftBridge Solutions’ın kariyer asistanıyım.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_1fr] gap-4 mb-6">
          <div className="glass-panel rounded-2xl p-4 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-steel">
                CV metni
              </p>
              <div className="flex flex-wrap items-center gap-1.5">
                <FilePickButton
                  label="Bilgisayardan CV Seç"
                  silentSuccess
                  onText={(text, fileName) => handleCvFile(text, fileName)}
                />
                <FilePickButton
                  label="Klasöre Göz At"
                  variant="ghost"
                  silentSuccess
                  onText={(text, fileName) => handleCvFile(text, fileName)}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setForgeCvText(SAMPLE_CV);
                    setLastCvFileName(null);
                    run(() => {
                      runParse(SAMPLE_CV, "manual");
                    });
                  }}
                >
                  Örnek
                </Button>
              </div>
            </div>
            <p className="text-[11px] text-muted-steel">
              Metin yapıştır veya <strong>Bilgisayardan CV Seç</strong> / <strong>Klasöre Göz At</strong>{" "}
              (PDF, TXT). Sürükle-bırak yok — dosya penceresinde klasörlere tıklayarak gez. Seçim sonrası
              otomatik parse edilir.
            </p>
            <Textarea
              value={cvText}
              onChange={(e) => {
                setForgeCvText(e.target.value);
                setParseBanner(null);
              }}
              placeholder="CV’ni buraya yapıştır veya bilgisayardan dosya seç…"
              className="min-h-[180px] font-mono text-xs"
            />
          </div>
          <div className="glass-panel rounded-2xl p-4 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-steel">
                İş ilanı (JD)
              </p>
              <div className="flex flex-wrap items-center gap-1.5">
                <FilePickButton
                  label="JD dosyası seç"
                  onText={(text) => setForgeJdText(text)}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setForgeJdText(SAMPLE_JD);
                    toast.message("Örnek JD yüklendi");
                  }}
                >
                  Örnek
                </Button>
              </div>
            </div>
            <p className="text-[11px] text-muted-steel">
              Sistem dosya penceresinde klasörlere tıklayarak ilerle; sürüklemen gerekmez.
            </p>
            <Textarea
              value={jdText}
              onChange={(e) => setForgeJdText(e.target.value)}
              placeholder="İş ilanını buraya yapıştır veya dosya seç…"
              className="min-h-[180px] font-mono text-xs"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <Button variant="accent" disabled={busy} onClick={onParse}>
            Parse
          </Button>
          <Button variant="default" disabled={busy} onClick={onAnalyze}>
            Karşılaştır
          </Button>
          <Button variant="outline" disabled={busy} onClick={onOptimize}>
            Optimize et
          </Button>
          <Button variant="outline" disabled={busy} onClick={onCover}>
            Cover letter
          </Button>
          <Button variant="outline" disabled={busy} onClick={onAts}>
            ATS kontrol
          </Button>
          <Button variant="outline" disabled={busy} onClick={onInterview}>
            Mock interview
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
                <h2 className="font-semibold text-lg">Yapılandırılmış CV</h2>
                <p className="text-sm text-muted-steel mt-1">
                  CV’ni aşağıya yapıştır veya bilgisayarından dosya seç. Parse sonucu bu bölümde
                  yapılandırılmış görünür; geçmişe de kaydedilir.
                </p>
              </div>

              <div className="rounded-2xl border border-black/8 bg-panel-elevated/40 p-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <FilePickButton
                    label="Bilgisayardan CV Seç"
                    variant="accent"
                    size="default"
                    silentSuccess
                    onText={(text, fileName) => handleCvFile(text, fileName)}
                  />
                  <FilePickButton
                    label="Klasöre Göz At"
                    variant="outline"
                    size="default"
                    silentSuccess
                    onText={(text, fileName) => handleCvFile(text, fileName)}
                  />
                  <Button
                    variant="soft"
                    disabled={busy || !cvText.trim()}
                    onClick={onParse}
                  >
                    Metni Parse Et
                  </Button>
                </div>
                <p className="text-[11px] text-muted-steel">
                  Desteklenen formatlar: <strong>PDF</strong>, <strong>TXT</strong> (ve MD). Butona bas →
                  dosya penceresi açılır → klasörlere tıklayarak ilerle → seçince otomatik parse.
                </p>
                <Textarea
                  value={cvText}
                  onChange={(e) => {
                    setForgeCvText(e.target.value);
                    setParseBanner(null);
                  }}
                  placeholder="CV metnini buraya yapıştır… veya yukarıdan bilgisayarından dosya seç."
                  className="min-h-[140px] font-mono text-xs"
                />
                {lastCvFileName && (
                  <p className="text-xs text-muted-steel">
                    Son seçilen dosya: <span className="font-semibold text-star-white">{lastCvFileName}</span>
                  </p>
                )}
              </div>

              {parseBanner && (
                <div className="rounded-2xl border border-cosmic-teal/25 bg-cosmic-teal/10 px-4 py-3 space-y-1">
                  <p className="text-sm font-semibold text-star-white">{parseBanner}</p>
                  <p className="text-xs text-cosmic-teal font-medium">
                    Sonuç burada ve geçmişte saklanmıştır.
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
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="accent">Parse sonucu</Badge>
                    <span className="text-xs text-muted-steel">Yapılandırılmış görünüm</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatPill label="Ad" value={forgeParsedCv.name} />
                    <StatPill label="Unvan" value={forgeParsedCv.title} />
                    <StatPill label="Beceri" value={forgeParsedCv.skills.length} />
                    <StatPill label="Deneyim" value={forgeParsedCv.experience.length} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-muted-steel mb-1">İletişim</p>
                      <p>{forgeParsedCv.email || "—"}</p>
                      <p className="text-muted-steel">{forgeParsedCv.phone || "Telefon yok"}</p>
                      <p className="text-muted-steel">{forgeParsedCv.location || "Konum yok"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-muted-steel mb-1">Özet</p>
                      <p className="text-ink-soft leading-relaxed">
                        {forgeParsedCv.summary || "Özet algılanamadı"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-muted-steel mb-2">Beceriler</p>
                    <div className="flex flex-wrap gap-1.5">
                      {forgeParsedCv.skills.map((s) => (
                        <Badge key={s} variant="soft">
                          {s}
                        </Badge>
                      ))}
                      {forgeParsedCv.skills.length === 0 && (
                        <span className="text-sm text-muted-steel">Beceri algılanamadı</span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase text-muted-steel">Deneyim</p>
                    {forgeParsedCv.experience.length === 0 && (
                      <p className="text-sm text-muted-steel">Deneyim bloğu algılanamadı</p>
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
                  {forgeParsedCv.education.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase text-muted-steel mb-2">Eğitim</p>
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

          {tab === "analyze" && (
            <div className="space-y-4">
              <h2 className="font-semibold text-lg">JD × CV karşılaştırması</h2>
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">Geçmiş analizler</h2>
                {forgeHistory.length > 0 && (
                  <Button size="sm" variant="ghost" onClick={clearForgeHistory}>
                    <Trash2 className="w-4 h-4" /> Temizle
                  </Button>
                )}
              </div>
              {historyPreview.length === 0 ? (
                <p className="text-sm text-muted-steel">Henüz kayıt yok. Bir işlem çalıştır.</p>
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
                        {new Date(h.createdAt).toLocaleString("tr-TR")}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-muted-steel">
                Geçmiş tarayıcı localStorage’ında tutulur; sunucuya gitmez.
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
