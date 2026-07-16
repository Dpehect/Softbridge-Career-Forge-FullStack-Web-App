"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, RotateCcw, Send, Brain,
  ChevronRight, AlertTriangle, CheckCircle2, Lightbulb,
  MessageSquare, Target, Zap, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/forge/i18n";
import { useCoachAI, type ReadyQuestion } from "@/hooks/useCoachAI";
import { CvUploadPanel } from "@/components/coach/CvUploadPanel";

// ─── Tag colors ────────────────────────────────────────────────────────────────
const TAG_COLOR: Record<ReadyQuestion["tag"], { bg: string; text: string; border: string }> = {
  resume:    { bg: "rgba(124,58,237,0.12)",  text: "#7C3AED", border: "rgba(124,58,237,0.25)" },
  interview: { bg: "rgba(147,51,234,0.12)",  text: "#9333EA", border: "rgba(147,51,234,0.25)" },
  ats:       { bg: "rgba(251,191,36,0.12)",  text: "#F59E0B", border: "rgba(251,191,36,0.25)" },
  salary:    { bg: "rgba(74,222,128,0.12)",  text: "#22C55E", border: "rgba(74,222,128,0.25)" },
  growth:    { bg: "rgba(251,113,133,0.12)", text: "#FB7185", border: "rgba(251,113,133,0.25)" },
  gap:       { bg: "rgba(249,115,22,0.12)",  text: "#F97316", border: "rgba(249,115,22,0.25)" },
};

const TAG_LABEL: Record<ReadyQuestion["tag"], { tr: string; en: string }> = {
  resume:    { tr: "CV",       en: "CV"         },
  interview: { tr: "Mülakat", en: "Interview"   },
  ats:       { tr: "ATS",     en: "ATS"         },
  salary:    { tr: "Maaş",    en: "Salary"      },
  growth:    { tr: "Strateji",en: "Strategy"    },
  gap:       { tr: "Eksik",   en: "Gap"         },
};

// ─── Typing animation hook ────────────────────────────────────────────────────
function useTypingEffect(text: string, speed = 12) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    if (!text) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return { displayed, done };
}

// ─── Render formatted message ─────────────────────────────────────────────────
function MessageContent({ content, isTyping = false }: { content: string; isTyping?: boolean }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-0.5 text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith("### ")) return (
          <p key={i} className="font-bold text-[13px] mt-2 mb-1" style={{ color: "#7C3AED" }}>
            {line.slice(4)}
          </p>
        );
        if (line.startsWith("#### ")) return (
          <p key={i} className="font-semibold text-star-white text-xs mt-2 mb-0.5">{line.slice(5)}</p>
        );
        if (line.startsWith("|")) return (
          <p key={i} className="text-xs font-mono text-muted-steel">{line}</p>
        );
        if (/^[-*] /.test(line)) return (
          <div key={i} className="flex gap-2 text-xs">
            <span className="text-cosmic-teal mt-0.5 shrink-0">•</span>
            <span className="text-star-white/90 leading-snug">
              {line.slice(2).split(/(\*\*.*?\*\*)/g).map((p, j) =>
                p.startsWith("**") && p.endsWith("**")
                  ? <strong key={j} className="text-star-white font-semibold">{p.slice(2, -2)}</strong>
                  : p
              )}
            </span>
          </div>
        );
        if (/^\d+\. /.test(line)) return (
          <div key={i} className="flex gap-2 text-xs">
            <span className="text-cosmic-teal font-bold shrink-0">{line.match(/^\d+/)?.[0]}.</span>
            <span className="text-star-white/90 leading-snug">
              {line.replace(/^\d+\. /, "").split(/(\*\*.*?\*\*)/g).map((p, j) =>
                p.startsWith("**") && p.endsWith("**")
                  ? <strong key={j} className="text-star-white font-semibold">{p.slice(2, -2)}</strong>
                  : p
              )}
            </span>
          </div>
        );
        if (line.trim() === "") return <div key={i} className="h-1" />;
        return (
          <p key={i} className="text-sm text-star-white/90">
            {line.split(/(\*\*.*?\*\*)/g).map((p, j) =>
              p.startsWith("**") && p.endsWith("**")
                ? <strong key={j} className="text-star-white font-semibold">{p.slice(2, -2)}</strong>
                : p
            )}
          </p>
        );
      })}
      {isTyping && <span className="typing-cursor" />}
    </div>
  );
}

// ─── Last AI message with typing effect ───────────────────────────────────────
function TypingMessage({ content }: { content: string }) {
  const { displayed, done } = useTypingEffect(content, 8);
  return <MessageContent content={displayed} isTyping={!done} />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CoachPage() {
  const { lang } = useTranslation();
  const {
    readyQuestions, cvInsights, loading,
    askCoach, clearCoach, coachMessages, hasCv,
  } = useCoachAI();

  const [input, setInput] = useState("");
  const [mounted, setMounted] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ReadyQuestion["tag"] | "all">("all");
  const [lastMsgId, setLastMsgId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isTR = lang === "tr";

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [coachMessages, loading]);

  // Track last assistant message for typing effect
  useEffect(() => {
    const lastAssistant = [...coachMessages].reverse().find((m) => m.role === "assistant");
    if (lastAssistant && lastAssistant.id !== lastMsgId) {
      setLastMsgId(lastAssistant.id);
    }
  }, [coachMessages]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    setInput("");
    await askCoach(text);
  }, [askCoach, loading]);

  const filteredQuestions = activeFilter === "all"
    ? readyQuestions
    : readyQuestions.filter((q) => q.tag === activeFilter);

  const availableTags = [...new Set(readyQuestions.map((q) => q.tag))] as ReadyQuestion["tag"][];
  const highPriority = readyQuestions.filter((q) => q.priority === "high");

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "#7C3AED", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-6 pb-24 pt-6">
      <div className="max-w-7xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: "rgba(124,58,237,0.12)", color: "#7C3AED" }}>
              <Brain className="w-3.5 h-3.5" />
              {isTR ? "Chat with your Resume" : "Chat with your Resume"}
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tighter text-star-white">
              {isTR ? "Özgeçmişinle sohbet et" : "Chat with your resume"}
            </h1>
            <p className="text-slate-500 mt-1.5 text-sm max-w-xl leading-relaxed">
              {isTR
                ? "SSS değil — danışman. En zor mülakat sorunu, STAR cevap iskeletini ve yarın yapman gereken tek adımı birlikte çıkarırız."
                : "Not an FAQ — a counselor. We surface your hardest interview question, STAR answer skeletons, and the one fix to make tomorrow."}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={clearCoach}
            className="shrink-0 text-muted-steel hover:text-star-white gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" />
            {isTR ? "Sıfırla" : "Reset"}
          </Button>
        </div>

        <div className="grid lg:grid-cols-[1fr_370px] gap-5 items-start">

          {/* ═══════════ LEFT: Chat ═══════════ */}
          <div className="flex flex-col gap-4">
            {/* CV Upload */}
            <CvUploadPanel lang={lang} />

            {/* Chat window */}
            <div className="glass-panel rounded-3xl flex flex-col overflow-hidden" style={{ minHeight: "520px" }}>
              <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ maxHeight: "54vh" }}>

                {/* Welcome bubble */}
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5 justify-start">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "linear-gradient(135deg,#6D28D9,#F472B6)" }}>
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="max-w-[86%] rounded-2xl rounded-bl-sm px-4 py-3 text-sm"
                    style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)" }}>
                    <p className="text-xs font-bold mb-1.5" style={{ color: "#7C3AED" }}>CareerForge Coach</p>
                    <p className="text-star-white/90 leading-relaxed">
                      {isTR
                        ? "Merhaba — ben danışmanınım. CV'nle sohbet edelim: Bu CV ile bir mülakata girsen en zorlanacağın soru genelde “Neden önceki projeniz başarısız oldu / ne ters gitti?” olur. İstersen STAR metoduna uygun 3 cevap şablonu çıkarayım."
                        : "Hi — I'm your counselor. Let's chat with your resume: the hardest interview question is often “Why did a past project fail?” Want 3 STAR-ready answer templates for that?"}
                    </p>
                  </div>
                </motion.div>

                {/* Message history */}
                {coachMessages.map((msg, idx) => {
                  const isLastAssistant = msg.role === "assistant" && msg.id === lastMsgId;
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn("flex gap-2.5", msg.role === "user" ? "justify-end" : "justify-start")}
                    >
                      {msg.role === "assistant" && (
                        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: "linear-gradient(135deg,#6D28D9,#F472B6)" }}>
                          <Sparkles className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                      <div className={cn(
                        "max-w-[84%] rounded-2xl px-4 py-3",
                        msg.role === "user"
                          ? "text-white rounded-br-sm text-sm font-medium"
                          : "rounded-bl-sm"
                      )}
                        style={msg.role === "user"
                          ? { background: "linear-gradient(135deg,#6D28D9,#9333EA)", boxShadow: "0 4px 16px rgba(109,40,217,0.3)" }
                          : { background: "rgba(124,58,237,0.07)", border: "1px solid rgba(124,58,237,0.12)" }
                        }
                      >
                        {msg.role === "assistant"
                          ? (isLastAssistant
                            ? <TypingMessage content={msg.content} />
                            : <MessageContent content={msg.content} />)
                          : msg.content}
                      </div>
                    </motion.div>
                  );
                })}

                {/* Thinking indicator */}
                {loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5 justify-start">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: "linear-gradient(135deg,#6D28D9,#F472B6)" }}>
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="rounded-2xl rounded-bl-sm px-4 py-3 inline-flex items-center gap-2"
                      style={{ background: "rgba(124,58,237,0.07)", border: "1px solid rgba(124,58,237,0.12)" }}>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: "#7C3AED" }} />
                      <span className="text-sm text-muted-steel">{isTR ? "Analiz ediliyor…" : "Thinking…"}</span>
                    </div>
                  </motion.div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input area */}
              <div className="border-t p-4 space-y-3" style={{ borderColor: "rgba(124,58,237,0.1)", background: "rgba(124,58,237,0.03)" }}>
                {!hasCv && (
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      isTR ? "Mülakat soruları hazırla" : "Prepare mock interview questions",
                      isTR ? "CV özetimi yaz" : "Write my professional summary",
                      isTR ? "ATS puanımı artır" : "Boost my ATS score",
                    ].map((p) => (
                      <button key={p} onClick={() => void send(p)}
                        className="text-[10px] px-2.5 py-1 rounded-lg border transition-colors cursor-pointer text-muted-steel hover:text-star-white"
                        style={{ borderColor: "rgba(124,58,237,0.2)" }}>
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
                        ? (isTR ? "CV'nle ilgili herhangi bir şey sor…" : "Ask anything about your CV…")
                        : (isTR ? "Kariyer sorunuzu yazın…" : "Type your career question…")
                    }
                    className="min-h-[52px] max-h-36 resize-none text-star-white text-sm"
                  />
                  <Button
                    size="icon"
                    className="shrink-0 h-[52px] w-[52px] rounded-xl text-white transition-all hover:scale-105"
                    style={{
                      background: "linear-gradient(135deg,#6D28D9,#9333EA)",
                      boxShadow: input.trim() ? "0 4px 16px rgba(109,40,217,0.4)" : "none",
                    }}
                    disabled={!input.trim() || loading}
                    onClick={() => void send(input)}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════ RIGHT: Sidebar ═══════════ */}
          <div className="space-y-4 lg:sticky lg:top-6">

            {/* CV Health Insights */}
            <AnimatePresence>
              {hasCv && cvInsights.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="glass-panel rounded-2xl p-4 space-y-2.5">
                  <h3 className="text-xs font-bold text-muted-steel uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-cosmic-teal" />
                    {isTR ? "CV Sağlık Analizi" : "CV Health"}
                  </h3>
                  {cvInsights.map((ins, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs rounded-xl p-2.5"
                      style={{
                        background: ins.type === "warning" ? "rgba(245,158,11,0.08)"
                          : ins.type === "success" ? "rgba(74,222,128,0.08)"
                          : "rgba(124,58,237,0.08)",
                        border: `1px solid ${ins.type === "warning" ? "rgba(245,158,11,0.2)"
                          : ins.type === "success" ? "rgba(74,222,128,0.2)"
                          : "rgba(124,58,237,0.2)"}`,
                        color: ins.type === "warning" ? "#F59E0B"
                          : ins.type === "success" ? "#22C55E"
                          : "#7C3AED",
                      }}>
                      {ins.type === "warning" && <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
                      {ins.type === "tip" && <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
                      {ins.type === "success" && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
                      <span className="text-muted-steel leading-snug">{ins.message}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Ready Questions panel */}
            <div className="glass-panel rounded-2xl overflow-hidden">
              <div className="p-4 border-b" style={{ borderColor: "rgba(124,58,237,0.1)" }}>
                <h3 className="text-sm font-bold text-star-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" style={{ color: "#7C3AED" }} />
                  {hasCv
                    ? (isTR ? "Sana Özel Sorular" : "Personalized Questions")
                    : (isTR ? "Hazır Sorular" : "Ready Questions")}
                </h3>
                <p className="text-[11px] text-muted-steel mt-0.5">
                  {hasCv
                    ? (isTR ? "CV'ne göre öncelikli konular. Tıkla → cevap al." : "CV-based priority topics. Click → get an answer.")
                    : (isTR ? "CV yükle → sorular kişiselleşir." : "Upload your CV → questions personalize.")}
                </p>
              </div>

              {/* High priority alert */}
              {hasCv && highPriority.length > 0 && (
                <div className="px-4 pt-3 pb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1" style={{ color: "#F59E0B" }}>
                    <AlertTriangle className="w-3 h-3" />
                    {isTR ? `${highPriority.length} kritik alan tespit edildi` : `${highPriority.length} critical areas found`}
                  </span>
                </div>
              )}

              {/* Tag filters */}
              {hasCv && availableTags.length > 1 && (
                <div className="px-4 py-2 flex flex-wrap gap-1.5">
                  <button onClick={() => setActiveFilter("all")}
                    className="text-[10px] px-2.5 py-0.5 rounded-full border transition-all cursor-pointer font-semibold"
                    style={{
                      background: activeFilter === "all" ? "#6D28D9" : "transparent",
                      borderColor: activeFilter === "all" ? "#6D28D9" : "rgba(124,58,237,0.2)",
                      color: activeFilter === "all" ? "white" : "#9580B8",
                    }}>
                    {isTR ? "Tümü" : "All"} ({readyQuestions.length})
                  </button>
                  {availableTags.map((tag) => {
                    const c = TAG_COLOR[tag];
                    return (
                      <button key={tag} onClick={() => setActiveFilter(tag)}
                        className="text-[10px] px-2.5 py-0.5 rounded-full border transition-all cursor-pointer font-semibold"
                        style={{
                          background: activeFilter === tag ? c.bg : "transparent",
                          borderColor: activeFilter === tag ? c.border : "rgba(124,58,237,0.15)",
                          color: activeFilter === tag ? c.text : "#9580B8",
                        }}>
                        {TAG_LABEL[tag][isTR ? "tr" : "en"]}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Question list */}
              <div className="p-3 space-y-1.5 overflow-y-auto" style={{ maxHeight: "46vh" }}>
                {filteredQuestions.length === 0 && !hasCv && (
                  <div className="text-center py-8 space-y-2">
                    <Brain className="w-8 h-8 mx-auto" style={{ color: "rgba(124,58,237,0.3)" }} />
                    <p className="text-xs text-muted-steel">
                      {isTR ? "CV yükledikten sonra kişiselleştirilmiş sorular burada görünecek." : "Upload your CV to see personalized questions here."}
                    </p>
                  </div>
                )}
                {filteredQuestions.map((q) => {
                  const c = TAG_COLOR[q.tag];
                  return (
                    <motion.button
                      key={q.id}
                      whileHover={{ x: 2 }}
                      onClick={() => void askCoach(q.prompt)}
                      disabled={loading}
                      className="w-full text-left rounded-xl p-3 border transition-all cursor-pointer group disabled:opacity-50"
                      style={{ borderColor: "transparent", background: "rgba(124,58,237,0.04)" }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = c.border;
                        (e.currentTarget as HTMLElement).style.background = c.bg;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = "transparent";
                        (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.04)";
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-1.5">
                            {q.priority === "high" && (
                              <Zap className="w-3 h-3 shrink-0" style={{ color: "#F59E0B" }} />
                            )}
                            <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full border"
                              style={{ background: c.bg, borderColor: c.border, color: c.text }}>
                              {TAG_LABEL[q.tag][isTR ? "tr" : "en"]}
                            </span>
                          </div>
                          <p className="text-xs text-muted-steel group-hover:text-star-white leading-snug transition-colors">
                            {q.label}
                          </p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-steel/40 group-hover:text-cosmic-teal shrink-0 mt-1 transition-colors" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Tip */}
            <div className="glass-panel rounded-2xl p-4">
              <p className="text-[11px] text-muted-steel leading-relaxed">
                <span className="font-bold" style={{ color: "#7C3AED" }}>
                  {isTR ? "💡 İpucu: " : "💡 Tip: "}
                </span>
                {isTR
                  ? "Cevaplardaki kalın kelimeler anahtar noktaları gösterir. Beğendiğin cevabı doğrudan CV'ne kopyalayabilirsin."
                  : "Bold words highlight key points. You can copy any answer directly into your CV."}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
