"use client";

import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  BrainCircuit,
  Check,
  CircleDot,
  Loader2,
  RotateCcw,
  Send,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CvUploadPanel } from "@/components/coach/CvUploadPanel";
import { useCoachAI, type ReadyQuestion } from "@/hooks/useCoachAI";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/hooks/useHydrated";
import { useMessages } from "@/i18n/useMessages";
import { useCareerStore } from "@/store/useCareerStore";

const coachDecorationPattern = /[👋🔍🗣️🎯💼💰💪🌱✅🔥💜]/gu;

function CoachMessage({ content }: { content: string }) {
  return (
    <div className="min-w-0 space-y-2 break-words text-sm leading-6 text-ink-2">
      {content.split("\n").map((line, index) => {
        const cleanedLine = line.replace(coachDecorationPattern, "").trim();
        if (!cleanedLine) return <div key={index} className="h-1" />;
        if (cleanedLine.startsWith("### ")) return <h3 key={index} className="pt-2 text-base font-semibold text-ink">{cleanedLine.slice(4)}</h3>;
        if (cleanedLine.startsWith("#### ")) return <h4 key={index} className="pt-2 text-sm font-semibold text-ink">{cleanedLine.slice(5)}</h4>;
        if (/^[-*] /.test(cleanedLine)) return <p key={index} className="flex gap-2 pl-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand" /><RichText text={cleanedLine.slice(2)} /></p>;
        if (/^\d+\. /.test(cleanedLine)) {
          const number = cleanedLine.match(/^\d+/)?.[0];
          return <p key={index} className="grid grid-cols-[1.5rem_1fr] gap-2 pl-1"><span className="font-mono text-xs text-brand-strong">{number}.</span><RichText text={cleanedLine.replace(/^\d+\. /, "")} /></p>;
        }
        if (cleanedLine.startsWith("|")) return <p key={index} className="break-all border-l-2 border-line-strong pl-3 font-mono text-xs text-ink-3">{cleanedLine.replaceAll("|", "  ")}</p>;
        if (cleanedLine.startsWith("```")) return null;
        return <p key={index}><RichText text={cleanedLine} /></p>;
      })}
    </div>
  );
}

function RichText({ text }: { text: string }) {
  return <>{text.split(/(\*\*.*?\*\*)/g).map((part, index) => part.startsWith("**") && part.endsWith("**") ? <strong key={index} className="font-semibold text-ink">{part.slice(2, -2)}</strong> : part)}</>;
}

export default function CoachPage() {
  const mounted = useHydrated();
  const { locale, messages, page } = useMessages();
  const copy = page.coach;
  const loadDemoProfile = useCareerStore((state) => state.loadDemoProfile);
  const tagLabels: Record<ReadyQuestion["tag"], string> = {
    resume: copy.resume,
    interview: copy.interview,
    ats: copy.ats,
    salary: copy.salary,
    growth: copy.growth,
    gap: copy.gap,
  };
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<ReadyQuestion["tag"] | "all">("all");
  const messagesRef = useRef<HTMLDivElement>(null);
  const {
    readyQuestions,
    cvInsights,
    cvContext,
    loading,
    askCoach,
    clearCoach,
    coachMessages,
    hasCv,
  } = useCoachAI();

  useEffect(() => {
    const container = messagesRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [coachMessages, loading]);

  const questions = useMemo(
    () => filter === "all" ? readyQuestions : readyQuestions.filter((question) => question.tag === filter),
    [readyQuestions, filter]
  );
  const tags = useMemo(() => [...new Set(readyQuestions.map((question) => question.tag))], [readyQuestions]);

  const send = async (event: FormEvent) => {
    event.preventDefault();
    const message = input.trim();
    if (!message || loading) return;
    setInput("");
    await askCoach(message);
  };

  if (!mounted) {
    return <div className="grid min-h-[60vh] place-items-center"><span className="h-6 w-6 animate-spin rounded-full border-2 border-line-strong border-t-brand" /></div>;
  }

  return (
    <main className="product-page">
      <header className="grid gap-6 border-b border-line pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="page-kicker"><BrainCircuit className="h-3.5 w-3.5" /> {copy.kicker}</p>
          <h1 className="page-title-compact mt-4">{copy.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-2">{copy.lede}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={clearCoach}><RotateCcw className="h-3.5 w-3.5" /> {copy.clear}</Button>
      </header>

      {!hasCv && (
        <section className="mt-6 grid gap-4 border border-info/25 bg-[var(--info-wash)] p-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div><h2 className="text-sm font-semibold text-ink">{messages.empty.coachTitle}</h2><p className="mt-1 text-xs leading-5 text-ink-2">{messages.empty.coachBody}</p></div>
          <div className="flex flex-wrap gap-2"><Link href="/forge"><Button variant="primary">{messages.empty.upload}</Button></Link><Button variant="outline" onClick={loadDemoProfile}>{messages.demo.open}</Button></div>
        </section>
      )}

      <div className="mt-8 grid overflow-hidden border border-line bg-surface xl:min-h-[42rem] xl:grid-cols-[17rem_minmax(0,1fr)_18rem]">
        <aside className="order-2 border-t border-line bg-surface-2 p-5 xl:order-1 xl:border-r xl:border-t-0">
          <p className="section-label">{copy.prompts}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            <button type="button" onClick={() => setFilter("all")} className={cn("min-h-11 rounded-full px-3 text-[0.6875rem] font-medium", filter === "all" ? "bg-ink text-background" : "border border-line bg-surface text-ink-3")}>{copy.all}</button>
            {tags.map((tag) => <button key={tag} type="button" onClick={() => setFilter(tag)} className={cn("min-h-11 rounded-full px-3 text-[0.6875rem] font-medium", filter === tag ? "bg-ink text-background" : "border border-line bg-surface text-ink-3")}>{tagLabels[tag]}</button>)}
          </div>
          <div className="mt-5 space-y-1">
            {questions.slice(0, 7).map((question) => (
              <button
                key={question.id}
                type="button"
                onClick={() => void askCoach(question.prompt)}
                disabled={loading}
                className="interactive-row w-full border-b border-line px-1 py-3 text-left disabled:opacity-50"
              >
                <span className="text-[0.625rem] font-semibold text-brand-strong">{tagLabels[question.tag]}</span>
                <span className="mt-1 block text-xs font-medium leading-5 text-ink">{question.label}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="order-1 flex h-[36rem] min-w-0 flex-col sm:h-[42rem] xl:order-2 xl:h-auto">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-positive" />
              <span className="text-xs font-semibold text-ink">{copy.coachName}</span>
            </div>
            <span className="text-[0.6875rem] text-ink-3">{hasCv ? `${cvContext.title} ${copy.context}` : copy.general}</span>
          </div>

          <div ref={messagesRef} className="flex-1 space-y-6 overflow-x-hidden overflow-y-auto px-4 py-6 sm:px-7">
            {coachMessages.map((message) => (
              <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "min-w-0 max-w-[90%] rounded-[var(--radius-panel)] px-4 py-3 sm:max-w-[82%]",
                  message.role === "user" ? "bg-ink text-background" : "border border-line bg-surface-2"
                )}>
                  {message.role === "user" ? <p className="text-sm leading-6">{message.content}</p> : <CoachMessage content={message.content} />}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-ink-3"><Loader2 className="h-3.5 w-3.5 animate-spin" /> {copy.evaluating}</div>
            )}
            <div />
          </div>

          <form onSubmit={send} className="border-t border-line bg-surface-2 p-3 sm:p-4">
            <div className="flex items-end gap-2">
              <Textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                placeholder={copy.placeholder}
                className="min-h-12 max-h-32 resize-none bg-surface"
                aria-label={copy.placeholder}
              />
              <Button type="submit" variant="primary" size="icon" disabled={!input.trim() || loading} aria-label={copy.send} title={copy.send}><Send className="h-4 w-4" /></Button>
            </div>
            <p className="mt-2 text-[0.625rem] text-ink-3">{copy.keyHint}</p>
          </form>
        </section>

        <aside className="order-3 border-t border-line p-5 xl:border-l xl:border-t-0">
          <div className="border-b border-line pb-5"><CvUploadPanel lang={locale} /></div>

          <div className="mt-6">
            <div className="flex items-center justify-between"><p className="section-label">{copy.signals}</p><Sparkles className="h-4 w-4 text-info" /></div>
            <div className="mt-4 space-y-3">
              {cvInsights.length ? cvInsights.map((insight, index) => (
                <div key={`${insight.type}-${index}`} className="grid grid-cols-[1.25rem_1fr] gap-2 border-b border-line pb-3 last:border-b-0">
                  {insight.type === "success" ? <Check className="mt-0.5 h-3.5 w-3.5 text-positive" /> : insight.type === "warning" ? <AlertCircle className="mt-0.5 h-3.5 w-3.5 text-caution" /> : <CircleDot className="mt-0.5 h-3.5 w-3.5 text-info" />}
                  <p className="text-[0.6875rem] leading-5 text-ink-2">{insight.message}</p>
                </div>
              )) : <p className="text-xs leading-5 text-ink-3">{copy.noSignals}</p>}
            </div>
          </div>

          {hasCv && (
            <dl className="mt-7 grid grid-cols-2 gap-px border border-line bg-line">
              <div className="bg-surface p-3"><dt className="text-[0.625rem] text-ink-3">{copy.skills}</dt><dd className="metric-number mt-1 text-lg font-semibold text-ink">{cvContext.skillCount}</dd></div>
              <div className="bg-surface p-3"><dt className="text-[0.625rem] text-ink-3">{copy.experiences}</dt><dd className="metric-number mt-1 text-lg font-semibold text-ink">{cvContext.expCount}</dd></div>
            </dl>
          )}
        </aside>
      </div>
    </main>
  );
}
