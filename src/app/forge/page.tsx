"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, Check, FileSearch, History, RotateCcw, Save, ShieldCheck, Target, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FilePickButton } from "@/components/FilePickButton";
import { AtsScoreBreakdown } from "@/components/AtsScoreBreakdown";
import { ActionableRecommendations } from "@/components/ActionableRecommendations";
import { useCareerStore } from "@/store/useCareerStore";
import { analyzeAts, analyzeMatch, cleanExtractedText, looksLikeRawPdf, parseCV } from "@/lib/forge";
import { buildActionableRecommendations } from "@/features/analysis/recommendations";
import { useHydrated } from "@/hooks/useHydrated";
import { useMessages } from "@/i18n/useMessages";
import { cn } from "@/lib/utils";

type View = "analysis" | "match" | "history";

export default function ForgePage() {
  const mounted = useHydrated();
  const { locale, messages } = useMessages();
  const [view, setView] = useState<View>("analysis");
  const [parseError, setParseError] = useState<string | null>(null);
  const {
    forgeCvText,
    forgeJdText,
    forgeParsedCv,
    forgeAnalysis,
    forgeHistory,
    forgeBackups,
    setForgeCvText,
    setForgeJdText,
    setForgeParsedCv,
    setForgeAnalysis,
    pushForgeHistory,
    clearForgeCv,
    saveForgeBackup,
    restoreForgeBackup,
    deleteForgeBackup,
    loadDemoProfile,
  } = useCareerStore();

  const copy = locale === "tr" ? {
    kicker: "CV Analizi", title: "CV'nizi kanıt, yapı ve hedef rol açısından inceleyin.", lede: "Genel ATS puanı belge kalitesini; hedef rol uyumu ise gerçek ilan metniyle örtüşmeyi ayrı ayrı gösterir.",
    analysis: "Genel analiz", match: "Hedef rol uyumu", history: "Geçmiş ve yedekler", local: "Standart analiz bu tarayıcıda çalışır", loaded: "CV hazır", replace: "CV'yi değiştir", clear: "CV'yi temizle", edit: "CV Düzenleyiciye Git",
    emptyTitle: "Analiz için CV'nizi ekleyin", emptyBody: "Metin seçilebilir PDF, DOCX veya TXT yükleyin; dilerseniz CV metnini doğrudan yapıştırın.", paste: "CV metnini yapıştırın", analyze: "CV'yi Analiz Et", choose: "Dosya seç", demo: "Demo Profille İncele", parseError: "Belge yapısı çözümlenemedi. Metin seçilebilir bir dosya veya düz metin deneyin.", rawPdf: "Ham PDF verisi algılandı. Dosyayı seçiciyle yükleyin veya düz metin yapıştırın.", imported: "CV analiz için hazır.",
    scoreTitle: "Genel ATS kalitesi", scoreNote: "Bu puan iş ilanından bağımsızdır ve altı ölçütün toplamıdır.", actionCta: "Önerileri CV Düzenleyicide Uygula", matchTitle: "Gerçek ilan metniyle karşılaştırın", matchBody: "İlan metnini yapıştırın. Bu skor genel ATS puanını değiştirmez; yalnızca beceri ve terminoloji örtüşmesini ölçer.", jdPlaceholder: "Hedef iş ilanının tamamını buraya yapıştırın", runMatch: "Uyumu Hesapla", matched: "Eşleşen sinyaller", missing: "Eksik sinyaller", strengths: "Güçlü taraflar", suggestions: "Sıradaki düzeltmeler", noMatch: "Henüz hedef ilan analizi yapılmadı.", requiresCv: "Önce CV ekleyin.", requiresJd: "İş ilanı metni gerekli.", matchReady: "Hedef rol uyumu hesaplandı.", roleScore: "Hedef rol uyumu", generalScore: "Genel ATS", separate: "Bu iki puan farklı soruları yanıtlar.",
    backup: "Çalışma alanı yedeği oluştur", backupReady: "Yedek oluşturuldu ve eşitleme sırasına alındı.", backupEmpty: "Yedek oluşturmak için önce CV ekleyin.", backups: "CV yedekleri", activity: "Analiz geçmişi", noBackup: "Henüz yedek yok.", noHistory: "Henüz analiz geçmişi yok.", restore: "Geri yükle", restored: "Yedek geri yüklendi.", delete: "Yedeği sil", sample: "Demo veri", privacy: "Standart analiz tarayıcıda çalışır. Düzenlenmiş çalışma alanı hesabınıza güvenli şekilde kaydedilir; orijinal CV dosyası açıkça yüklemeyi seçmediğiniz sürece saklanmaz.",
  } : {
    kicker: "Resume Analysis", title: "Review your resume for evidence, structure, and target-role alignment.", lede: "The overall ATS score measures document quality; target-role alignment separately measures overlap with a real job description.",
    analysis: "Overall analysis", match: "Target-role alignment", history: "History and backups", local: "Standard analysis runs in this browser", loaded: "Resume ready", replace: "Replace resume", clear: "Clear resume", edit: "Open Resume Editor",
    emptyTitle: "Add your resume to begin analysis", emptyBody: "Upload a text-based PDF, DOCX, or TXT file, or paste the resume text directly.", paste: "Paste resume text", analyze: "Analyze Resume", choose: "Choose file", demo: "Explore Demo Profile", parseError: "The document structure could not be parsed. Try a text-based file or plain text.", rawPdf: "Raw PDF data was detected. Upload the file with the picker or paste plain text.", imported: "Resume is ready for analysis.",
    scoreTitle: "Overall ATS quality", scoreNote: "This score is independent of a job listing and totals six criteria.", actionCta: "Apply Recommendations in Resume Editor", matchTitle: "Compare with a real job description", matchBody: "Paste the full listing. This score does not change the overall ATS score; it only measures skill and terminology overlap.", jdPlaceholder: "Paste the full target job description", runMatch: "Calculate Alignment", matched: "Matched signals", missing: "Missing signals", strengths: "Strengths", suggestions: "Next corrections", noMatch: "No target-role analysis yet.", requiresCv: "Add a resume first.", requiresJd: "A job description is required.", matchReady: "Target-role alignment calculated.", roleScore: "Target-role alignment", generalScore: "Overall ATS", separate: "These scores answer different questions.",
    backup: "Create workspace backup", backupReady: "Backup created and queued for sync.", backupEmpty: "Add a resume before creating a backup.", backups: "Resume backups", activity: "Analysis history", noBackup: "No backups yet.", noHistory: "No analysis history yet.", restore: "Restore", restored: "Backup restored.", delete: "Delete backup", sample: "Demo data", privacy: "Standard analysis runs in your browser. The edited workspace is securely saved to your account; the original resume file is not stored unless you explicitly choose it.",
  };

  const ats = useMemo(() => forgeParsedCv ? analyzeAts(forgeParsedCv, "", locale) : null, [forgeParsedCv, locale]);
  const atsResult = ats ? { total: ats.atsScore, status: ats.status, categories: ats.breakdown } : null;
  const recommendations = useMemo(() => forgeParsedCv ? buildActionableRecommendations(forgeParsedCv, locale) : [], [forgeParsedCv, locale]);

  const parseResume = (raw: string, fileName?: string) => {
    const cleaned = cleanExtractedText(raw);
    if (!cleaned.trim()) {
      setParseError(copy.parseError);
      return;
    }
    if (looksLikeRawPdf(cleaned) || looksLikeRawPdf(raw)) {
      setParseError(copy.rawPdf);
      return;
    }
    try {
      const parsed = parseCV(cleaned);
      setForgeCvText(cleaned);
      setForgeParsedCv(parsed);
      setForgeAnalysis(null);
      pushForgeHistory({ action: "parse", summary: locale === "tr" ? `${parsed.name} CV'si analiz edildi` : `${parsed.name}'s resume was analyzed`, payload: { fileName, candidate: parsed.name } });
      setParseError(null);
      setView("analysis");
      toast.success(copy.imported);
    } catch {
      setParseError(copy.parseError);
    }
  };

  const runMatch = () => {
    if (!forgeParsedCv) return toast.error(copy.requiresCv);
    if (!forgeJdText.trim()) return toast.error(copy.requiresJd);
    const result = analyzeMatch(forgeParsedCv, forgeJdText, locale);
    setForgeAnalysis(result);
    pushForgeHistory({ action: "analyze", summary: `${copy.roleScore}: ${result.matchScore}/100`, payload: result });
    toast.success(copy.matchReady);
  };

  if (!mounted) {
    return <div className="grid min-h-[60vh] place-items-center" role="status"><span className="h-6 w-6 animate-spin rounded-full border-2 border-line-strong border-t-brand" /><span className="sr-only">{messages.common.loading}</span></div>;
  }

  return (
    <main className="product-page">
      <header className="grid gap-7 border-b border-line pb-9 lg:grid-cols-[1fr_auto] lg:items-end">
        <div><p className="page-kicker"><FileSearch className="h-3.5 w-3.5" /> {copy.kicker}</p><h1 className="page-title-compact mt-4 max-w-3xl">{copy.title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-ink-2">{copy.lede}</p></div>
        <div className="flex items-center gap-2 text-xs font-semibold text-positive"><ShieldCheck className="h-4 w-4" /> {copy.local}</div>
      </header>

      {!forgeParsedCv ? (
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.55fr)]">
          <section className="surface-panel p-6 sm:p-8" aria-labelledby="empty-analysis-title">
            <h2 id="empty-analysis-title" className="text-xl font-semibold text-ink">{copy.emptyTitle}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-ink-2">{copy.emptyBody}</p>
            <div className="mt-6 flex flex-wrap gap-2"><FilePickButton label={copy.choose} size="default" variant="primary" accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" silentSuccess onText={(text, fileName) => parseResume(text, fileName)} /><Button variant="outline" onClick={() => { loadDemoProfile(); setParseError(null); }}>{copy.demo}</Button></div>
            <div className="my-6 flex items-center gap-3 text-[0.6875rem] text-ink-3"><span className="h-px flex-1 bg-line" />{locale === "tr" ? "veya" : "or"}<span className="h-px flex-1 bg-line" /></div>
            <label htmlFor="resume-paste" className="section-label">{copy.paste}</label><Textarea id="resume-paste" value={forgeCvText} onChange={(event) => setForgeCvText(event.target.value)} className="mt-3 min-h-56 font-mono text-xs" placeholder={copy.paste} />
            {parseError && <div className="mt-4 flex gap-2 border border-danger/25 bg-[var(--danger-wash)] p-3 text-xs leading-5 text-danger" role="alert"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{parseError}</div>}
            <Button className="mt-4 w-full" variant="primary" disabled={!forgeCvText.trim()} onClick={() => parseResume(forgeCvText)}>{copy.analyze}</Button>
          </section>
          <aside className="surface-subtle p-6"><p className="section-label">{locale === "tr" ? "Veri sınırları" : "Data boundaries"}</p><p className="mt-4 text-sm leading-6 text-ink-2">{copy.privacy}</p><div className="mt-7 border-t border-line pt-5"><p className="text-xs font-semibold text-ink">{messages.ats.explanation}</p><ul className="mt-3 space-y-2 text-xs text-ink-3">{[messages.ats.structure, messages.ats.completeness, messages.ats.experience, messages.ats.keywords, messages.ats.impact, messages.ats.contact].map((item) => <li key={item} className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-positive" />{item}</li>)}</ul></div></aside>
        </div>
      ) : (
        <>
          <section className="mt-7 flex flex-col gap-4 border border-line bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="section-label">{copy.loaded}</p><h2 className="mt-2 text-lg font-semibold text-ink">{forgeParsedCv.name}</h2><p className="mt-1 text-xs text-ink-3">{forgeParsedCv.title} · {forgeParsedCv.skills.length} {locale === "tr" ? "beceri" : "skills"}</p></div>
            <div className="flex flex-wrap gap-2"><FilePickButton label={copy.replace} silentSuccess onText={(text, fileName) => parseResume(text, fileName)} /><Link href="/resume" className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] bg-brand px-4 text-sm font-semibold text-[var(--action-primary-ink)]">{copy.edit} <ArrowRight className="h-4 w-4" /></Link><Button size="icon" variant="ghost" aria-label={copy.clear} title={copy.clear} onClick={() => { clearForgeCv(); setParseError(null); }}><RotateCcw className="h-4 w-4" /></Button></div>
          </section>

          <nav className="mt-7 flex overflow-x-auto border-b border-line" aria-label={copy.kicker}>{([{ id: "analysis", label: copy.analysis, icon: FileSearch }, { id: "match", label: copy.match, icon: Target }, { id: "history", label: copy.history, icon: History }] as const).map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setView(id)} className={cn("inline-flex min-h-11 items-center gap-2 border-b-2 px-4 text-xs font-semibold", view === id ? "border-brand text-ink" : "border-transparent text-ink-3 hover:text-ink")} aria-current={view === id ? "page" : undefined}><Icon className="h-4 w-4" />{label}</button>)}</nav>

          {view === "analysis" && atsResult && (
            <div className="mt-8 grid gap-10 xl:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
              <div><AtsScoreBreakdown result={atsResult} /><p className="mt-4 text-[0.6875rem] leading-5 text-ink-3">{copy.scoreNote}</p></div>
              <div><ActionableRecommendations items={recommendations} /><Link href="/resume" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] bg-brand px-4 text-sm font-semibold text-[var(--action-primary-ink)]">{copy.actionCta} <ArrowRight className="h-4 w-4" /></Link></div>
            </div>
          )}

          {view === "match" && (
            <div className="mt-8 grid gap-10 xl:grid-cols-[minmax(18rem,0.7fr)_minmax(0,1.3fr)]">
              <section><p className="section-label">{copy.matchTitle}</p><p className="mt-3 text-sm leading-6 text-ink-2">{copy.matchBody}</p><Textarea value={forgeJdText} onChange={(event) => setForgeJdText(event.target.value)} className="mt-5 min-h-64 text-xs" placeholder={copy.jdPlaceholder} /><Button variant="primary" className="mt-3 w-full" onClick={runMatch} disabled={!forgeJdText.trim()}>{copy.runMatch}</Button></section>
              {forgeAnalysis ? <section className="surface-panel overflow-hidden" aria-labelledby="role-score-title"><div className="grid gap-px bg-line sm:grid-cols-2"><div className="bg-surface p-6"><p className="section-label">{copy.roleScore}</p><p id="role-score-title" className="metric-number mt-3 text-4xl font-semibold text-brand-strong">{forgeAnalysis.matchScore}<span className="text-sm text-ink-3">/100</span></p></div><div className="bg-surface-2 p-6"><p className="section-label">{copy.generalScore}</p><p className="metric-number mt-3 text-4xl font-semibold text-ink">{ats?.atsScore ?? 0}<span className="text-sm text-ink-3">/100</span></p></div></div><p className="border-b border-line p-5 text-xs leading-5 text-ink-3">{copy.separate}</p><div className="grid gap-6 p-6 sm:grid-cols-2"><div><p className="text-xs font-semibold text-positive">{copy.matched} · {forgeAnalysis.matchedSkills.length}</p><p className="mt-3 text-xs leading-5 text-ink-2">{forgeAnalysis.matchedSkills.join(" · ") || messages.common.noData}</p></div><div><p className="text-xs font-semibold text-caution">{copy.missing} · {forgeAnalysis.missingSkills.length}</p><p className="mt-3 text-xs leading-5 text-ink-2">{forgeAnalysis.missingSkills.join(" · ") || messages.common.noData}</p></div></div><div className="border-t border-line p-6"><p className="section-label">{copy.suggestions}</p><ul className="mt-4 space-y-3">{forgeAnalysis.suggestions.map((item) => <li key={item} className="flex gap-2 text-xs leading-5 text-ink-2"><ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-strong" />{item}</li>)}</ul></div></section> : <div className="grid min-h-72 place-items-center border border-dashed border-line p-8 text-center"><div><Target className="mx-auto h-5 w-5 text-ink-3" /><p className="mt-3 text-sm font-semibold text-ink">{copy.noMatch}</p></div></div>}
            </div>
          )}

          {view === "history" && (
            <div className="mt-8 grid gap-10 xl:grid-cols-2">
              <section><div className="flex items-center justify-between border-b border-line pb-4"><div><p className="section-label">{copy.backups}</p><h2 className="mt-2 text-lg font-semibold text-ink">{forgeBackups.length}</h2></div><Button variant="outline" onClick={() => { const backup = saveForgeBackup(locale === "tr" ? `CV yedeği · ${forgeParsedCv.name}` : `Resume backup · ${forgeParsedCv.name}`); toast[backup ? "success" : "error"](backup ? copy.backupReady : copy.backupEmpty); }}><Save className="h-4 w-4" />{copy.backup}</Button></div>{forgeBackups.length ? <ul>{forgeBackups.map((backup) => <li key={backup.id} className="flex items-center justify-between gap-4 border-b border-line py-4"><div><p className="text-xs font-semibold text-ink">{backup.label}</p><p className="mt-1 text-[0.6875rem] text-ink-3">{new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(backup.createdAt))}</p></div><div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => { restoreForgeBackup(backup.id); toast.success(copy.restored); }}>{copy.restore}</Button><Button size="icon" variant="ghost" aria-label={copy.delete} title={copy.delete} onClick={() => deleteForgeBackup(backup.id)}><Trash2 className="h-4 w-4 text-danger" /></Button></div></li>)}</ul> : <p className="py-10 text-sm text-ink-3">{copy.noBackup}</p>}</section>
              <section><div className="border-b border-line pb-4"><p className="section-label">{copy.activity}</p><h2 className="mt-2 text-lg font-semibold text-ink">{forgeHistory.length}</h2></div>{forgeHistory.length ? <ol>{forgeHistory.map((item) => <li key={item.id} className="grid grid-cols-[2rem_1fr] gap-3 border-b border-line py-4"><span className="font-mono text-[0.6875rem] text-ink-3">{item.action.slice(0, 2).toUpperCase()}</span><div><p className="text-xs font-medium text-ink">{item.summary}</p><p className="mt-1 text-[0.6875rem] text-ink-3">{new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.createdAt))}</p></div></li>)}</ol> : <p className="py-10 text-sm text-ink-3">{copy.noHistory}</p>}</section>
            </div>
          )}

          <p className="mt-10 border-t border-line pt-5 text-[0.6875rem] leading-5 text-ink-3">{copy.privacy}</p>
        </>
      )}
    </main>
  );
}
