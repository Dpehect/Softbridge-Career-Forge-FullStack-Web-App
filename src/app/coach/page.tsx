"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, RotateCcw, Send, Sparkles,
  ChevronRight, AlertTriangle, CheckCircle2, Lightbulb,
  Brain, MessageSquare, Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/forge/i18n";
import { useCoachAI, type ReadyQuestion } from "@/hooks/useCoachAI";
import { CvUploadPanel } from "@/components/coach/CvUploadPanel";

// ─── Tag colours ──────────────────────────────────────────────────────────────
const TAG_STYLE: Record<ReadyQuestion["tag"], string> = {
  resume:    "bg-blue-500/10 text-blue-400 border-blue-500/20",
  interview: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  ats:       "bg-amber-500/10 text-amber-400 border-amber-500/20",
  salary:    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  growth:    "bg-pink-500/10 text-pink-400 border-pink-500/20",
  gap:       "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

const TAG_LABEL: Record<ReadyQuestion["tag"], { tr: string; en: string }> = {
  resume:    { tr: "CV",       en: "CV"         },
  interview: { tr: "Mülakat", en: "Interview"   },
  ats:       { tr: "ATS",     en: "ATS"         },
  salary:    { tr: "Maaş",    en: "Salary"      },
  growth:    { tr: "Strateji",en: "Strategy"    },
  gap:       { tr: "Eksik",   en: "Gap"         },
};

// ─── Render AI markdown-like text ─────────────────────────────────────────────
function renderMessage(content: string) {
  return content.split("\n").map((line, i) => {
    if (line.startsWith("### ")) {
      return <p key={i} className="font-bold text-cosmic-teal text-sm mt-2 mb-1">{line.slice(4)}</p>;
    }
    if (line.startsWith("#### ")) {
      return <p key={i} className="font-semibold text-star-white text-xs mt-2 mb-0.5">{line.slice(5)}</p>;
    }
    if (line.startsWith("- ❌") || line.startsWith("- ✅") || line.startsWith("- ⚠️") || line.startsWith("- ")) {
      return <li key={i} className="text-xs leading-relaxed ml-2 text-star-white/90 list-none">{line.slice(2)}</li>;
    }
    if (/^\d+\./.test(line)) {
      return <li key={i} className="text-xs leading-relaxed ml-2 text-star-white/90 list-none">{line}</li>;
    }
    if (line.trim() === "") return <div key={i} className="h-1.5" />;
    return (
      <p key={i} className="text-sm leading-relaxed text-star-white/90">
        {line.split(/(\*\*.*?\*\*)/g).map((part, j) =>
          part.startsWith("**") && part.endsWith("**")
            ? <strong key={j} className="text-star-white font-semibold">{part.slice(2, -2)}</strong>
            : part
        )}
      </p>
    );
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CoachPage() {
  const { t, lang } = useTranslation();
  const {
    readyQuestions, cvInsights, cvContext, loading,
    askCoach, clearCoach, coachMessages, hasCv,
  } = useCoachAI();

  const [input, setInput] = useState("");
  const [mounted, setMounted] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ReadyQuestion["tag"] | "all">("all");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isTR = lang === "tr";

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [coachMessages, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    setInput("");
    await askCoach(text);
  };

  const handleReady = async (q: ReadyQuestion) => {
    await askCoach(q.prompt);
  };

  const filteredQuestions = activeFilter === "all"
    ? readyQuestions
    : readyQuestions.filter((q) => q.tag === activeFilter);

  const highPriority = readyQuestions.filter((q) => q.priority === "high");
  const availableTags = [...new Set(readyQuestions.map((q) => q.tag))] as ReadyQuestion["tag"][];

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-cosmic-teal border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-6 pb-24 pt-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge variant="accent" className="mb-3">{t("navCoach")}</Badge>
            <h1 className="font-display text-3xl font-semibold flex items-center gap-2 text-star-white">
              <Brain className="w-8 h-8 text-cosmic-teal" />
              {isTR ? "Yapay Zeka Kariyer Koçu" : "AI Career Coach"}
            </h1>
            <p className="text-muted-steel mt-2 text-sm max-w-xl leading-relaxed">
              {isTR
                ? "CV'ni yükle → Anlık analiz al → Kişiselleştirilmiş sorularla koçluk al."
                : "Upload your CV → Get instant analysis → Receive personalized coaching."}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={clearCoach} className="shrink-0 text-muted-steel hover:text-star-white">
            <RotateCcw className="w-4 h-4 mr-1.5" />
            {isTR ? "Sıfırla" : "Reset"}
          </Button>
        </div>

        {/* ── Main grid ──────────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">

          {/* ═══════════════════════════════════ LEFT: Chat ═══════════════ */}
          <div className="flex flex-col gap-4">

            {/* CV Upload */}
            <CvUploadPanel lang={lang} onAnalyzed={() => {
              // Welcome message after analysis
              const welcome = isTR
                ? `CV'in analiz edildi! **${cvContext.expCount}** iş deneyimi, **${cvContext.skillCount}** beceri ve **${cvContext.title}** hedefiyle sana özel koçluk sorularım hazır. Sağ panelden bir soru seç veya kendin yaz!`
                : `Your CV has been analyzed! With **${cvContext.expCount}** experiences, **${cvContext.skillCount}** skills, and a target of **${cvContext.title}**, your personalized coaching questions are ready. Pick one from the right panel or ask your own!`;
              // Add system message
              useCoachAI; // no-op to keep import, actual msg below
            }} />

            {/* Chat bubble list */}
            <div className="glass-panel rounded-3xl flex flex-col overflow-hidden min-h-[480px]">

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[58vh]">
                {/* Welcome */}
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                  <div className="max-w-[88%] rounded-2xl rounded-bl-md px-4 py-3 bg-abyss-panel border border-white/5 text-star-white">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-cosmic-teal shrink-0" />
                      <span className="text-xs font-semibold text-cosmic-teal">CareerForge Coach</span>
                    </div>
                    <p className="text-sm leading-relaxed">
                      {isTR
                        ? "Merhaba! Ben senin kişisel kariyer koçunum. CV'ni yükleyerek başlayalım — analiz ettikten sonra sana özel sorular ve geri bildirimler oluşturacağım."
                        : "Hello! I'm your personal career coach. Let's start by uploading your CV — once analyzed, I'll generate personalized questions and feedback just for you."}
                    </p>
                  </div>
                </motion.div>

                {/* Messages */}
                {coachMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-7 h-7 rounded-full bg-cosmic-teal/20 border border-cosmic-teal/30 flex items-center justify-center shrink-0 mr-2 mt-1">
                        <Sparkles className="w-3.5 h-3.5 text-cosmic-teal" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[84%] rounded-2xl px-4 py-3 text-sm",
                        msg.role === "user"
                          ? "bg-cosmic-teal text-midnight-void font-medium rounded-br-sm"
                          : "bg-abyss-panel border border-white/5 rounded-bl-sm text-star-white"
                      )}
                    >
                      {msg.role === "assistant"
                        ? <div className="space-y-0.5">{renderMessage(msg.content)}</div>
                        : msg.content}
                    </div>
                  </motion.div>
                ))}

                {/* Thinking */}
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start items-center gap-2"
                  >
                    <div className="w-7 h-7 rounded-full bg-cosmic-teal/20 border border-cosmic-teal/30 flex items-center justify-center shrink-0">
                      <Sparkles className="w-3.5 h-3.5 text-cosmic-teal" />
                    </div>
                    <div className="rounded-2xl rounded-bl-sm bg-abyss-panel border border-white/5 px-4 py-3 text-sm text-muted-steel inline-flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-cosmic-teal" />
                      {isTR ? "Analiz ediliyor…" : "Analyzing…"}
                    </div>
                  </motion.div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input area */}
              <div className="border-t border-white/5 p-4 space-y-3 bg-abyss-panel/30">
                {/* Quick send buttons for high-priority if no CV yet typed */}
                {!hasCv && (
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      isTR ? "Mülakat hazırlığı yap" : "Prepare me for interviews",
                      isTR ? "CV özetimi yaz" : "Write my CV summary",
                      isTR ? "ATS puanımı artır" : "Boost my ATS score",
                    ].map((p) => (
                      <button
                        key={p}
                        onClick={() => void send(p)}
                        className="text-[10px] px-2.5 py-1.5 rounded-lg border border-white/8 text-muted-steel hover:text-cosmic-teal hover:border-cosmic-teal/30 transition-colors cursor-pointer"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 items-end">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void send(input);
                      }
                    }}
                    placeholder={
                      hasCv
                        ? (isTR ? "CV'nle ilgili herhangi bir şeyi sor…" : "Ask anything about your CV…")
                        : (isTR ? "Kariyer sorunuzu yazın…" : "Type your career question…")
                    }
                    className="min-h-[52px] max-h-36 resize-none text-star-white text-sm"
                  />
                  <Button
                    variant="accent"
                    size="icon"
                    className="shrink-0 h-[52px] w-[52px] rounded-xl"
                    disabled={!input.trim() || loading}
                    onClick={() => void send(input)}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════ RIGHT: Sidebar ════════════════ */}
          <div className="space-y-4 lg:sticky lg:top-6">

            {/* CV Insights */}
            <AnimatePresence>
              {hasCv && cvInsights.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="glass-panel rounded-2xl p-4 space-y-2.5 border border-cosmic-teal/10"
                >
                  <h3 className="text-xs font-bold text-muted-steel uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-cosmic-teal" />
                    {isTR ? "CV Sağlık Analizi" : "CV Health Analysis"}
                  </h3>
                  <div className="space-y-2">
                    {cvInsights.map((ins, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex items-start gap-2 text-xs rounded-lg p-2.5",
                          ins.type === "warning" && "bg-amber-500/8 border border-amber-500/20 text-amber-300",
                          ins.type === "tip" && "bg-blue-500/8 border border-blue-500/20 text-blue-300",
                          ins.type === "success" && "bg-emerald-500/8 border border-emerald-500/20 text-emerald-300",
                        )}
                      >
                        {ins.type === "warning" && <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
                        {ins.type === "tip" && <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
                        {ins.type === "success" && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
                        <span className="leading-snug">{ins.message}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Ready Questions Panel */}
            <div className="glass-panel rounded-2xl overflow-hidden border border-cosmic-teal/10">
              {/* Panel header */}
              <div className="p-4 border-b border-white/5">
                <h3 className="text-sm font-semibold text-star-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-cosmic-teal" />
                  {isTR
                    ? hasCv ? "Sana Özel Sorular" : "Hazır Sorular"
                    : hasCv ? "Personalized Questions" : "Ready Questions"}
                </h3>
                <p className="text-[11px] text-muted-steel mt-0.5">
                  {isTR
                    ? hasCv
                      ? "CV'ne göre öncelikli konular oluşturuldu. Tıkla ve cevabı al."
                      : "CV yükledikten sonra kişiselleştirilecek."
                    : hasCv
                      ? "Priority topics generated from your CV. Click to get an answer."
                      : "Will personalize after you upload your CV."}
                </p>
              </div>

              {/* High priority alert */}
              {hasCv && highPriority.length > 0 && (
                <div className="px-4 pt-3 pb-1">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {isTR ? `${highPriority.length} Kritik Alan Tespit Edildi` : `${highPriority.length} Critical Areas Found`}
                  </span>
                </div>
              )}

              {/* Tag filters */}
              {hasCv && availableTags.length > 1 && (
                <div className="px-4 pb-2 pt-1 flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setActiveFilter("all")}
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full border transition-colors cursor-pointer",
                      activeFilter === "all"
                        ? "bg-cosmic-teal text-midnight-void border-cosmic-teal font-semibold"
                        : "border-white/10 text-muted-steel hover:border-cosmic-teal/40"
                    )}
                  >
                    {isTR ? "Tümü" : "All"} ({readyQuestions.length})
                  </button>
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setActiveFilter(tag)}
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full border transition-colors cursor-pointer",
                        activeFilter === tag
                          ? "bg-cosmic-teal text-midnight-void border-cosmic-teal font-semibold"
                          : "border-white/10 text-muted-steel hover:border-cosmic-teal/40"
                      )}
                    >
                      {TAG_LABEL[tag][lang === "tr" ? "tr" : "en"]}
                    </button>
                  ))}
                </div>
              )}

              {/* Question list */}
              <div className="p-3 space-y-1.5 max-h-[52vh] overflow-y-auto">
                {filteredQuestions.length === 0 && !hasCv && (
                  <div className="text-center py-8 space-y-2">
                    <Brain className="w-8 h-8 text-muted-steel/40 mx-auto" />
                    <p className="text-xs text-muted-steel">
                      {isTR
                        ? "CV'ni yükledikten sonra sana özel sorular burada görünecek."
                        : "Upload your CV to see personalized questions here."}
                    </p>
                  </div>
                )}

                {filteredQuestions.map((q) => (
                  <motion.button
                    key={q.id}
                    whileHover={{ x: 2 }}
                    onClick={() => void handleReady(q)}
                    disabled={loading}
                    className={cn(
                      "w-full text-left rounded-xl p-3 border transition-all cursor-pointer group",
                      "bg-black/5 hover:bg-cosmic-teal/5 border-transparent hover:border-cosmic-teal/20",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-1.5">
                        {/* Priority dot + label */}
                        <div className="flex items-center gap-2">
                          {q.priority === "high" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                          )}
                          <span className={cn(
                            "text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full border",
                            TAG_STYLE[q.tag]
                          )}>
                            {TAG_LABEL[q.tag][lang === "tr" ? "tr" : "en"]}
                          </span>
                        </div>
                        {/* Question label */}
                        <p className="text-xs text-muted-steel group-hover:text-star-white leading-snug transition-colors">
                          {q.label}
                        </p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-steel/40 group-hover:text-cosmic-teal shrink-0 mt-0.5 transition-colors" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Tip card */}
            <div className="glass-panel rounded-2xl p-4 border border-cosmic-teal/10">
              <p className="text-[11px] text-muted-steel leading-relaxed">
                <span className="text-cosmic-teal font-semibold">
                  {isTR ? "💡 İpucu: " : "💡 Tip: "}
                </span>
                {isTR
                  ? "Cevaplarda **kalın** kelimeler anahtar iyileştirme noktalarını gösterir. Bir cevabı beğendiysen kopyalayıp CV'ne ekleyebilirsin."
                  : "**Bold** words in answers highlight the key improvement points. If you like an answer, copy it directly into your CV."}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
