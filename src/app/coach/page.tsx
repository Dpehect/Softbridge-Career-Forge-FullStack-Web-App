"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  RotateCcw,
  Send,
  Brain,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  MessageSquare,
  Target,
  Zap,
  Sparkles,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/forge/i18n";
import { useCoachAI, type ReadyQuestion } from "@/hooks/useCoachAI";
import { CvUploadPanel } from "@/components/coach/CvUploadPanel";

const TAG_COLOR: Record<ReadyQuestion["tag"], { bg: string; text: string; border: string }> = {
  resume:    { bg: "rgba(124,58,237,0.06)",  text: "#7C3AED", border: "rgba(124,58,237,0.2)" },
  interview: { bg: "rgba(147,51,234,0.06)",  text: "#9333EA", border: "rgba(147,51,234,0.2)" },
  ats:       { bg: "rgba(245,158,11,0.06)",  text: "#F59E0B", border: "rgba(245,158,11,0.2)" },
  salary:    { bg: "rgba(16,185,129,0.06)",  text: "#10B981", border: "rgba(16,185,129,0.2)" },
  growth:    { bg: "rgba(244,63,94,0.06)",   text: "#F43F5E", border: "rgba(244,63,94,0.2)" },
  gap:       { bg: "rgba(249,115,22,0.06)",  text: "#F97316", border: "rgba(249,115,22,0.2)" },
};

const TAG_LABEL: Record<ReadyQuestion["tag"], { tr: string; en: string }> = {
  resume:    { tr: "CV İyileştirme",  en: "CV Improve"   },
  interview: { tr: "Mülakat Hazırlık",en: "Interview"      },
  ats:       { tr: "ATS Optimizasyon",en: "ATS Optimize"   },
  salary:    { tr: "Maaş Görüşmesi",  en: "Salary Ask"     },
  growth:    { tr: "Kariyer Yol Haritası",en: "Strategy"   },
  gap:       { tr: "Eksik Yetkinlikler", en: "Skill Gap"   },
};

function useTypingEffect(text: string, speed = 8) {
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

function MessageContent({ content, isTyping = false }: { content: string; isTyping?: boolean }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-1.5 text-xs md:text-sm leading-relaxed text-slate-800 dark:text-slate-200">
      {lines.map((line, i) => {
        if (line.startsWith("### ")) return (
          <h4 key={i} className="font-bold text-sm text-purple-700 dark:text-[#C084FC] mt-3 mb-1">
            {line.slice(4)}
          </h4>
        );
        if (line.startsWith("#### ")) return (
          <h5 key={i} className="font-bold text-xs text-slate-900 dark:text-white mt-2 mb-1">{line.slice(5)}</h5>
        );
        if (line.startsWith("|")) return (
          <p key={i} className="font-mono text-xs text-slate-500 bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded">{line}</p>
        );
        if (/^[-*] /.test(line)) return (
          <div key={i} className="flex gap-2 pl-2">
            <span className="text-purple-600 dark:text-[#C084FC] shrink-0 mt-1">•</span>
            <span className="flex-1 leading-normal">
              {line.slice(2).split(/(\*\*.*?\*\*)/g).map((p, j) =>
                p.startsWith("**") && p.endsWith("**")
                  ? <strong key={j} className="text-slate-900 dark:text-white font-bold">{p.slice(2, -2)}</strong>
                  : p
              )}
            </span>
          </div>
        );
        if (/^\d+\. /.test(line)) return (
          <div key={i} className="flex gap-2 pl-2">
            <span className="text-purple-600 dark:text-[#C084FC] font-black shrink-0">{line.match(/^\d+/)?.[0]}.</span>
            <span className="flex-1 leading-normal">
              {line.replace(/^\d+\. /, "").split(/(\*\*.*?\*\*)/g).map((p, j) =>
                p.startsWith("**") && p.endsWith("**")
                  ? <strong key={j} className="text-slate-900 dark:text-white font-bold">{p.slice(2, -2)}</strong>
                  : p
              )}
            </span>
          </div>
        );
        if (line.trim() === "") return <div key={i} className="h-2" />;
        return (
          <p key={i} className="leading-relaxed">
            {line.split(/(\*\*.*?\*\*)/g).map((p, j) =>
              p.startsWith("**") && p.endsWith("**")
                ? <strong key={j} className="text-slate-900 dark:text-white font-bold">{p.slice(2, -2)}</strong>
                : p
            )}
          </p>
        );
      })}
      {isTyping && <span className="typing-cursor" />}
    </div>
  );
}

function TypingMessage({ content }: { content: string }) {
  const { displayed, done } = useTypingEffect(content, 6);
  return <MessageContent content={displayed} isTyping={!done} />;
}

export default function CoachPage() {
  const { lang } = useTranslation();
  const {
    readyQuestions,
    cvInsights,
    loading,
    askCoach,
    clearCoach,
    coachMessages,
    hasCv,
  } = useCoachAI();

  const [input, setInput] = useState("");
  const [mounted, setMounted] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ReadyQuestion["tag"] | "all">("all");
  const [lastMsgId, setLastMsgId] = useState<string | null>(null);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isTR = lang === "tr";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [coachMessages, loading]);

  useEffect(() => {
    const lastAssistant = [...coachMessages].reverse().find((m) => m.role === "assistant");
    if (lastAssistant && lastAssistant.id !== lastMsgId) {
      setLastMsgId(lastAssistant.id);
    }
  }, [coachMessages, lastMsgId]);

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
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin border-purple-600" />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 pb-20 pt-6">
      <div className="max-w-7xl mx-auto space-y-6 text-left">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-500/10 dark:text-purple-300">
              <Brain className="w-3.5 h-3.5" />
              AI Kariyer Danışmanı
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Özgeçmiş Asistanı ile Sohbet
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-xl leading-relaxed">
              Özgeçmişinizdeki eksikleri saptayın, STAR metoduyla mülakat soruları hazırlayın ve kariyer yolculuğunuzu planlayın.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearCoach}
            className="text-slate-500 hover:text-rose-500 gap-1.5 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Sohbeti Temizle
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
          
          {/* Main Chat Workspace */}
          <div className="space-y-4">
            
            {/* Top CV Uploader widget */}
            <div className="glass-panel p-4 rounded-3xl">
              <CvUploadPanel lang={lang} />
            </div>

            {/* Chat Play area */}
            <div className="glass-panel rounded-3xl flex flex-col overflow-hidden min-h-[500px] border border-slate-200/80 dark:border-white/10 shadow-lg">
              
              {/* Message scroll viewport */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5 max-h-[50vh] min-h-[350px]">
                
                {/* Welcome message */}
                <div className="flex gap-3 items-start justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shrink-0 shadow-md">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm p-4 bg-slate-50 dark:bg-white/[0.01] border dark:border-white/5 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300">
                      CareerForge Mentor
                    </span>
                    <p className="text-xs md:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                      {isTR
                        ? "Merhaba! Ben sizin kişisel kariyer danışmanınızım. Özgeçmişinizi yüklediyseniz ona özel en kritik mülakat sorularını çıkarabilir, eksik yeteneklerinizi nasıl tamamlayacağınızı planlayabiliriz. Nasıl yardımcı olabilirim?"
                        : "Hello! I am your AI career mentor. If you've uploaded your resume, we can target your weakest experience bullets, map out STAR interview answers, or plan your next promotion step. How can I help you today?"}
                    </p>
                  </div>
                </div>

                {/* Dynamically mapped messages */}
                {coachMessages.map((msg) => {
                  const isLastAssistant = msg.role === "assistant" && msg.id === lastMsgId;
                  const isUser = msg.role === "user";

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}
                    >
                      {!isUser && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shrink-0 shadow-md">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                      )}
                      
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl p-4 text-left border",
                          isUser
                            ? "bg-purple-600 text-white border-transparent rounded-tr-sm shadow-md"
                            : "bg-slate-50 dark:bg-white/[0.01] dark:border-white/5 rounded-tl-sm"
                        )}
                      >
                        {isUser ? (
                          <p className="text-xs md:text-sm leading-relaxed">{msg.content}</p>
                        ) : isLastAssistant ? (
                          <TypingMessage content={msg.content} />
                        ) : (
                          <MessageContent content={msg.content} />
                        )}
                      </div>
                    </motion.div>
                  );
                })}

                {/* Loading State */}
                {loading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shrink-0 shadow-md">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm p-4 bg-slate-50 dark:bg-white/[0.01] border dark:border-white/5 flex items-center gap-2 text-xs text-slate-500">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                      Mentor düşünüyor...
                    </div>
                  </div>
                )}
                
                <div ref={bottomRef} />
              </div>

              {/* Chat Input panel */}
              <div className="border-t dark:border-white/5 p-4 bg-slate-50/50 dark:bg-slate-900/30 space-y-3">
                {/* Suggestions chips when prompt is empty */}
                {!hasCv && (
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Mülakat simülasyonu yap",
                      "Eksik yeteneklerimi nasıl tamamlarım?",
                      "STAR formatında başarı özetleme",
                    ].map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => void send(prompt)}
                        className="text-[10px] font-bold px-3 py-1 rounded-full border border-purple-200 text-purple-700 dark:border-slate-800 dark:text-slate-400 hover:bg-purple-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        {prompt}
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
                        ? "Özgeçmişiniz hakkında dilediğinizi sorun..."
                        : "Kariyeriniz hakkında bir soru yazın..."
                    }
                    className="min-h-[50px] max-h-36 resize-none text-xs md:text-sm text-slate-800 dark:text-slate-200"
                  />
                  <Button
                    className="shrink-0 h-[50px] w-[50px] rounded-xl text-white shadow-md transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: "linear-gradient(135deg, #6B21A8, #A855F7)",
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

          {/* Right Column Sidebar: Mentoring insights & structured questions */}
          <aside className="space-y-4 lg:sticky lg:top-24">
            
            {/* CV Health indicator widget */}
            {hasCv && cvInsights.length > 0 && (
              <div className="glass-panel p-4 rounded-3xl space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-purple-600" />
                  Özgeçmiş Analiz Detayları
                </h3>

                <div className="space-y-2">
                  {cvInsights.map((ins, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex items-start gap-2 text-xs p-2.5 rounded-2xl border",
                        ins.type === "warning" && "border-amber-500/10 bg-amber-500/[0.02] text-amber-600",
                        ins.type === "success" && "border-emerald-500/10 bg-emerald-500/[0.02] text-emerald-600",
                        ins.type === "tip" && "border-purple-500/10 bg-purple-500/[0.02] text-purple-600"
                      )}
                    >
                      {ins.type === "warning" && <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
                      {ins.type === "success" && <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />}
                      {ins.type === "tip" && <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />}
                      <span className="text-slate-600 dark:text-slate-300 leading-normal">{ins.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Personalized/ready mentor prompts */}
            <div className="glass-panel rounded-3xl overflow-hidden">
              <div className="p-4 border-b dark:border-white/5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-purple-600" />
                  Mentor Soru Şablonları
                </h3>
                <p className="text-[10px] text-slate-500 mt-1">
                  Özgeçmişiniz temel alınarak hazırlanan yönlendirme soruları.
                </p>
              </div>

              {/* Tag Filters */}
              {hasCv && availableTags.length > 1 && (
                <div className="p-3 flex flex-wrap gap-1 border-b dark:border-white/5">
                  <button
                    onClick={() => setActiveFilter("all")}
                    className={cn(
                      "text-[9px] font-bold px-2 py-0.5 rounded-full border transition-all cursor-pointer",
                      activeFilter === "all" ? "bg-purple-600 text-white border-transparent" : "border-slate-200 text-slate-500 dark:border-slate-800"
                    )}
                  >
                    Tümü
                  </button>
                  {availableTags.map((tag) => {
                    const active = activeFilter === tag;
                    const c = TAG_COLOR[tag];
                    return (
                      <button
                        key={tag}
                        onClick={() => setActiveFilter(tag)}
                        className="text-[9px] font-bold px-2 py-0.5 rounded-full border transition-all cursor-pointer"
                        style={{
                          background: active ? c.text : "transparent",
                          borderColor: active ? "transparent" : c.border,
                          color: active ? "white" : c.text,
                        }}
                      >
                        {TAG_LABEL[tag][isTR ? "tr" : "en"]}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Prompt Buttons list */}
              <div className="p-3 space-y-1.5 max-h-[40vh] overflow-y-auto">
                {filteredQuestions.length === 0 && !hasCv && (
                  <p className="text-xs text-slate-500 text-center py-6">
                    Özgeçmiş yükledikten sonra size özel sorular listelenecektir.
                  </p>
                )}
                {filteredQuestions.map((q) => {
                  const c = TAG_COLOR[q.tag];
                  return (
                    <button
                      key={q.id}
                      onClick={() => void send(q.prompt)}
                      disabled={loading}
                      className="w-full text-left rounded-2xl p-3 border border-slate-100/50 bg-slate-50/50 dark:border-white/5 dark:bg-white/[0.01] hover:border-purple-500/20 hover:bg-purple-500/[0.02] cursor-pointer disabled:opacity-50 transition-all flex items-start justify-between gap-2 group"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {q.priority === "high" && (
                            <Zap className="w-3 h-3 text-amber-500 shrink-0" />
                          )}
                          <span
                            className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border"
                            style={{ background: c.bg, borderColor: c.border, color: c.text }}
                          >
                            {TAG_LABEL[q.tag][isTR ? "tr" : "en"]}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white leading-normal truncate">
                          {q.label}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-2 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick coaching info */}
            <div className="glass-panel p-4 rounded-3xl flex gap-3 items-start border-l-4 border-l-purple-500">
              <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-500 leading-normal">
                STAR cevap şablonlarında kullanılan <strong>kalın kelimeler</strong> mülakatçıların duymak istediği anahtar kelimeleri gösterir.
              </p>
            </div>
          </aside>
          
        </div>

      </div>
    </div>
  );
}
