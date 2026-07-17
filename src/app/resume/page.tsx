"use client";

import { type ChangeEvent, useMemo, useState } from "react";
import Image from "next/image";
import {
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  GraduationCap,
  Plus,
  Sparkles,
  Trash2,
  Undo2,
  UserRound,
  Wrench,
  Redo2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FilePickButton } from "@/components/FilePickButton";
import { useCareerStore, parsedToResume, resumeToParsed, type ResumeSectionId } from "@/store/useCareerStore";
import {
  buildJourneyInsight,
  cleanExtractedText,
  exportCvAsPdf,
  generateCvFeedback,
  parseCV,
  type ParsedCV,
} from "@/lib/forge";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/hooks/useHydrated";
import { useMessages } from "@/i18n/useMessages";
import { calculateAtsScore } from "@/features/analysis/atsScore";
import { buildActionableRecommendations, type ActionableRecommendation, type RecommendationAction } from "@/features/analysis/recommendations";
import { AtsScoreBreakdown } from "@/components/AtsScoreBreakdown";
import { ActionableRecommendations } from "@/components/ActionableRecommendations";
import { CloudSyncStatus } from "@/components/sync/CloudSyncStatus";

type EditorSection = ResumeSectionId;

const sections: Array<{ id: EditorSection; icon: typeof UserRound }> = [
  { id: "profile", icon: UserRound },
  { id: "skills", icon: Wrench },
  { id: "experience", icon: FileText },
  { id: "education", icon: GraduationCap },
];

export default function ResumePage() {
  const mounted = useHydrated();
  const { locale, messages, page } = useMessages();
  const copy = page.resume;
  const [activeSection, setActiveSection] = useState<EditorSection>("profile");
  const [skillDraft, setSkillDraft] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [suggestionOverrides, setSuggestionOverrides] = useState<Record<string, string>>({});
  const {
    resume,
    updateResume,
    setResume,
    forgeParsedCv,
    careerGoalId,
    lastAnalysisMeta,
    addSkills,
    pushForgeHistory,
    undoResume,
    redoResume,
    resumePast,
    resumeFuture,
    resumeSectionOrder,
    moveResumeSection,
    loadDemoProfile,
  } = useCareerStore();

  const hasContent = Boolean(resume.fullName || resume.headline || resume.summary || resume.skills.length || resume.experience.length);
  const parsed = useMemo(() => resumeToParsed(resume), [resume]);
  const analysisCv = forgeParsedCv ?? parsed;
  const feedback = useMemo(() => hasContent ? generateCvFeedback(analysisCv, "", locale) : null, [analysisCv, hasContent, locale]);
  const atsResult = useMemo(() => hasContent ? calculateAtsScore(analysisCv) : null, [analysisCv, hasContent]);
  const recommendations = useMemo(() => hasContent ? buildActionableRecommendations(analysisCv, locale) : [], [analysisCv, hasContent, locale]);
  const displayedRecommendations = useMemo(
    () => recommendations.map((item) => suggestionOverrides[item.id] ? { ...item, after: suggestionOverrides[item.id] } : item),
    [recommendations, suggestionOverrides]
  );
  const journey = useMemo(
    () => buildJourneyInsight({ cv: hasContent ? analysisCv : null, goalId: careerGoalId, feedback }),
    [analysisCv, hasContent, careerGoalId, feedback]
  );

  if (!mounted) {
    return <div className="grid min-h-[60vh] place-items-center"><span className="h-6 w-6 animate-spin rounded-full border-2 border-line-strong border-t-brand" /></div>;
  }

  const applyParsed = (cv: ParsedCV, source: string) => {
    setResume(parsedToResume(cv));
    pushForgeHistory({ action: "parse", summary: `${cv.name} · ${source}`, payload: cv });
    setShowImport(false);
    toast.success(copy.imported);
  };

  const importText = (raw: string, source: string) => {
    try {
      const cleaned = cleanExtractedText(raw);
      applyParsed(parseCV(cleaned), source);
      setPasteText(cleaned);
    } catch {
      toast.error(copy.parseError);
    }
  };

  const addSkill = (value = skillDraft) => {
    const skill = value.trim();
    if (!skill || resume.skills.some((item) => item.toLowerCase() === skill.toLowerCase())) return;
    updateResume({ skills: [...resume.skills, skill] });
    setSkillDraft("");
  };

  const uploadPhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const accepted = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (!accepted.has(file.type)) {
      toast.error(locale === "tr" ? "JPG, PNG veya WebP görsel seçin." : "Choose a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error(locale === "tr" ? "Profil görseli en fazla 2 MB olabilir." : "Profile images must be 2 MB or smaller.");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => updateResume({ photoDataUrl: String(reader.result) });
    reader.onerror = () => toast.error(locale === "tr" ? "Görsel okunamadı." : "The image could not be read.");
    reader.readAsDataURL(file);
  };

  const handleRecommendation = (item: ActionableRecommendation, action: RecommendationAction) => {
    if (action === "undo") {
      undoResume();
      return;
    }
    if (action === "apply") {
      if (item.requiresConfirmation) {
        setActiveSection(item.id === "keyword-coverage" ? "skills" : "experience");
        toast.warning(locale === "tr" ? "Örnek, gerçek veriniz doğrulanmadan uygulanmadı." : "The example was not applied until you confirm it with real data.");
        return;
      }
      if (item.id === "summary-positioning") updateResume({ summary: item.after });
      toast.success(locale === "tr" ? "Öneri CV'ye uygulandı." : "Suggestion applied to the resume.");
      return;
    }
    const current = suggestionOverrides[item.id] ?? item.after;
    if (action === "shorter") {
      const shorter = current.length > 120 ? `${current.slice(0, 117).trim()}...` : current;
      setSuggestionOverrides((value) => ({ ...value, [item.id]: shorter }));
    } else if (action === "technical") {
      const skills = resume.skills.slice(0, 3).join(", ");
      setSuggestionOverrides((value) => ({
        ...value,
        [item.id]: locale === "tr" ? `${current} Teknik bağlam: ${skills || "kullandığınız araçlar"}.` : `${current} Technical context: ${skills || "tools used"}.`,
      }));
    } else {
      setSuggestionOverrides((value) => ({
        ...value,
        [item.id]: locale === "tr" ? `Alternatif: ${item.correction}` : `Alternative: ${item.correction}`,
      }));
    }
  };

  return (
    <main className="product-page">
      <header className="grid gap-6 border-b border-line pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="page-kicker"><FileText className="h-3.5 w-3.5" /> {copy.kicker}</p>
          <h1 className="page-title-compact mt-4">{copy.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-2">{copy.lede}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <CloudSyncStatus className="mr-2" />
          <Button variant="ghost" size="icon" onClick={undoResume} disabled={!resumePast.length} aria-label={messages.common.undo} title={messages.common.undo}><Undo2 className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={redoResume} disabled={!resumeFuture.length} aria-label={messages.common.redo} title={messages.common.redo}><Redo2 className="h-4 w-4" /></Button>
          <Button variant="outline" onClick={() => setShowImport((value) => !value)}><Plus className="h-4 w-4" /> {copy.import}</Button>
          <Button
            variant="primary"
            disabled={!hasContent}
            onClick={async () => {
              await exportCvAsPdf(parsed);
              toast.success(messages.header.pdfReady);
            }}
          >
            <Download className="h-4 w-4" /> {copy.download}
          </Button>
        </div>
      </header>

      {showImport && (
        <section className="mt-6 surface-subtle p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
            <div className="min-w-56">
              <p className="text-xs font-semibold text-ink">{copy.importTitle}</p>
              <p className="mt-1 text-[0.6875rem] leading-5 text-ink-3">{copy.importBody}</p>
              <FilePickButton label={copy.chooseFile} className="mt-3" variant="outline" size="sm" silentSuccess onText={(text, fileName) => importText(text, fileName)} />
            </div>
            <div className="flex-1">
              <Textarea value={pasteText} onChange={(event) => setPasteText(event.target.value)} placeholder={copy.pastePlaceholder} className="min-h-28 bg-surface text-xs" />
              <Button variant="primary" size="sm" className="mt-2" disabled={!pasteText.trim()} onClick={() => importText(pasteText, locale === "tr" ? "Yapıştırılan metin" : "Pasted text")}>{copy.parse}</Button>
            </div>
          </div>
        </section>
      )}

      {hasContent && (
        <section className="mt-6 grid gap-px border border-line bg-line sm:grid-cols-[1fr_1fr_1.4fr]">
          <div className="bg-surface p-4">
            <p className="section-label">{copy.atsScore}</p>
            <p className="metric-number mt-2 text-2xl font-semibold text-brand-strong">{atsResult?.total ?? 0}%</p>
          </div>
          <div className="bg-surface p-4">
            <p className="section-label">{copy.documentStrength}</p>
            <p className="metric-number mt-2 text-2xl font-semibold text-ink">{feedback?.overallScore || 0}%</p>
          </div>
          <div className="bg-surface p-4">
            <p className="section-label">{copy.nextImprovement}</p>
            <p className="mt-2 text-xs leading-5 text-ink-2">{feedback?.improvements[0] || (locale === "tr" ? "Önce temel profil bilgilerini tamamlayın." : "Complete the essential profile details first.")}</p>
          </div>
        </section>
      )}

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(21rem,0.8fr)] xl:items-start">
        <section className="relative min-h-[48rem] overflow-hidden bg-surface-2 p-3 sm:p-8">
          <div className="mx-auto min-h-[46rem] max-w-[46rem] rounded-[var(--radius-control)] border border-[var(--paper-line)] bg-[var(--paper-bg)] px-7 py-9 text-[var(--paper-ink)] shadow-[var(--elevation-2)] sm:px-12 sm:py-12">
            {!hasContent ? (
              <div className="grid min-h-[38rem] place-items-center text-center">
                <div>
                  <FileText className="mx-auto h-6 w-6 text-[var(--paper-muted)]" />
                  <p className="mt-3 text-sm font-semibold">{copy.preview}</p>
                  <p className="mt-2 max-w-xs text-xs leading-5 text-[var(--paper-muted)]">{copy.previewBody}</p>
                </div>
              </div>
            ) : (
              <div>
                <header className="flex items-start justify-between gap-6 border-b border-[var(--paper-line)] pb-6">
                  <div>
                    <h2 className="text-2xl font-semibold leading-none">{resume.fullName || copy.fullName}</h2>
                    <p className="mt-2 text-xs font-semibold text-[var(--paper-accent)]">{(resume.headline || copy.headline).toUpperCase()}</p>
                    <p className="mt-3 text-[0.6875rem] text-[var(--paper-muted)]">{[resume.email, resume.phone, resume.location].filter(Boolean).join(" · ")}</p>
                  </div>
                  {resume.photoDataUrl && (
                    <Image src={resume.photoDataUrl} alt={copy.photo} width={56} height={56} unoptimized className="h-14 w-14 rounded-full border border-[var(--paper-line)] object-cover" />
                  )}
                </header>

                {resumeSectionOrder.map((sectionId) => {
                  if (sectionId === "profile" && resume.summary) return <ResumeBlock key={sectionId} title={copy.profile}><p className="text-xs leading-5 text-[var(--paper-copy)]">{resume.summary}</p></ResumeBlock>;
                  if (sectionId === "experience" && resume.experience.length) return (
                    <ResumeBlock key={sectionId} title={copy.experience}>
                      <div className="space-y-5">{resume.experience.map((item) => <article key={item.id}><div className="flex items-baseline justify-between gap-4"><p className="text-xs font-semibold">{item.role || copy.role} <span className="font-normal text-[var(--paper-muted)]">· {item.company || copy.company}</span></p><span className="shrink-0 text-[0.625rem] text-[var(--paper-muted)]">{item.start} – {item.end}</span></div><ul className="mt-2 list-disc space-y-1 pl-4 text-[0.6875rem] leading-5 text-[var(--paper-copy)] marker:text-[var(--paper-accent)]">{item.highlights.filter(Boolean).map((highlight, index) => <li key={`${item.id}-${index}`}>{highlight}</li>)}</ul></article>)}</div>
                    </ResumeBlock>
                  );
                  if (sectionId === "skills" && resume.skills.length) return <ResumeBlock key={sectionId} title={copy.skills}><p className="text-[0.6875rem] leading-5 text-[var(--paper-copy)]">{resume.skills.join(" · ")}</p></ResumeBlock>;
                  if (sectionId === "education" && resume.education.length) return <ResumeBlock key={sectionId} title={copy.education}><div className="space-y-2">{resume.education.map((item) => <div key={item.id} className="flex items-baseline justify-between gap-4 text-xs"><p className="font-semibold">{item.school} <span className="font-normal text-[var(--paper-muted)]">· {item.degree}</span></p><span className="text-[0.625rem] text-[var(--paper-muted)]">{item.year}</span></div>)}</div></ResumeBlock>;
                  return null;
                })}
              </div>
            )}
          </div>
        </section>

        <aside className="surface-panel overflow-hidden xl:sticky xl:top-32">
          <nav className="grid grid-cols-4 border-b border-line bg-surface-2" aria-label={copy.reorder}>
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "flex min-w-0 flex-col items-center gap-1 border-r border-line px-2 py-3 text-[0.625rem] font-medium last:border-r-0",
                    activeSection === section.id ? "bg-surface text-brand-strong" : "text-ink-3 hover:text-ink"
                  )}
                  aria-current={activeSection === section.id ? "page" : undefined}
                >
                  <Icon className="h-4 w-4" /><span className="truncate">{copy[section.id]}</span>
                </button>
              );
            })}
          </nav>

          <div className="max-h-[calc(100vh-12rem)] overflow-y-auto p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between border-b border-line pb-3">
              <span className="text-[0.6875rem] text-ink-3">{copy.autosaved}</span>
              <div className="flex gap-1">
                <button type="button" onClick={() => moveResumeSection(activeSection, -1)} disabled={resumeSectionOrder.indexOf(activeSection) === 0} className="grid h-11 w-11 place-items-center rounded-[var(--radius-control)] text-ink-3 hover:bg-surface-2 hover:text-ink disabled:opacity-40" aria-label={copy.moveUp} title={copy.moveUp}><ChevronUp className="h-4 w-4" /></button>
                <button type="button" onClick={() => moveResumeSection(activeSection, 1)} disabled={resumeSectionOrder.indexOf(activeSection) === resumeSectionOrder.length - 1} className="grid h-11 w-11 place-items-center rounded-[var(--radius-control)] text-ink-3 hover:bg-surface-2 hover:text-ink disabled:opacity-40" aria-label={copy.moveDown} title={copy.moveDown}><ChevronDown className="h-4 w-4" /></button>
              </div>
            </div>
            {activeSection === "profile" && (
              <div className="space-y-4">
                <EditorHeading title={copy.profileInfo} note={copy.profileNote} />
                <div className="flex items-center gap-3 border-b border-line pb-4">
                  <label className="relative grid h-12 w-12 cursor-pointer place-items-center overflow-hidden rounded-full border border-line bg-surface-2 text-ink-3">
                    {resume.photoDataUrl ? (
                      <Image src={resume.photoDataUrl} alt="" width={48} height={48} unoptimized className="h-full w-full object-cover" />
                    ) : <Camera className="h-4 w-4" />}
                    <input type="file" accept="image/*" className="sr-only" onChange={uploadPhoto} />
                  </label>
                  <div><p className="text-xs font-semibold text-ink">{copy.photo}</p><p className="mt-1 text-[0.625rem] text-ink-3">{copy.photoNote}</p></div>
                </div>
                <Field label={copy.fullName}><Input value={resume.fullName} onChange={(event) => updateResume({ fullName: event.target.value })} /></Field>
                <Field label={copy.headline}><Input value={resume.headline} onChange={(event) => updateResume({ headline: event.target.value })} /></Field>
                <div className="grid gap-3 sm:grid-cols-3"><Field label={copy.email}><Input type="email" value={resume.email} onChange={(event) => updateResume({ email: event.target.value })} /></Field><Field label={copy.phone}><Input type="tel" value={resume.phone || ""} onChange={(event) => updateResume({ phone: event.target.value })} /></Field><Field label={copy.location}><Input value={resume.location} onChange={(event) => updateResume({ location: event.target.value })} /></Field></div>
                <Field label={copy.summary}><Textarea value={resume.summary} onChange={(event) => updateResume({ summary: event.target.value })} className="min-h-36" /></Field>
              </div>
            )}

            {activeSection === "skills" && (
              <div>
                <EditorHeading title={copy.skillEvidence} note={copy.skillNote} />
                <div className="mt-5 flex flex-wrap gap-2">
                  {resume.skills.map((skill) => <button key={skill} type="button" onClick={() => updateResume({ skills: resume.skills.filter((item) => item !== skill) })} className="rounded-full border border-line bg-surface-2 px-2.5 py-1 text-[0.6875rem] text-ink-2 hover:border-negative/40 hover:text-negative">{skill} ×</button>)}
                </div>
                <div className="mt-4 flex gap-2"><Input value={skillDraft} onChange={(event) => setSkillDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addSkill(); } }} placeholder={copy.newSkill} /><Button variant="outline" size="icon" onClick={() => addSkill()} aria-label={copy.addSkill}><Plus className="h-4 w-4" /></Button></div>
                {journey.missingSkills.length > 0 && (
                  <div className="mt-7 border-t border-line pt-5">
                    <div className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-info" /><p className="text-xs font-semibold text-ink">{copy.roleNeeds}</p></div>
                    <div className="mt-3 flex flex-wrap gap-2">{journey.missingSkills.slice(0, 5).map((skill) => <button key={skill} type="button" onClick={() => { const confirmed = window.confirm(locale === "tr" ? `${skill} becerisini gerçek deneyiminizle doğrulayabiliyor musunuz?` : `Can you verify ${skill} with real experience?`); if (!confirmed) return; const count = addSkills([skill]); toast[count ? "success" : "info"](count ? (locale === "tr" ? `${skill} eklendi.` : `${skill} added.`) : (locale === "tr" ? `${skill} zaten mevcut.` : `${skill} already exists.`)); }} className="min-h-11 rounded-full bg-[var(--info-wash)] px-3 text-[0.6875rem] font-medium text-info">+ {skill}</button>)}</div>
                  </div>
                )}
              </div>
            )}

            {activeSection === "experience" && (
              <div>
                <div className="flex items-start justify-between gap-4"><EditorHeading title={copy.experienceEvidence} note={copy.experienceNote} /><Button variant="outline" size="sm" onClick={() => updateResume({ experience: [{ id: `exp-${Date.now()}`, role: "", company: "", start: "", end: "", highlights: [] }, ...resume.experience] })}><Plus className="h-3.5 w-3.5" /> {messages.common.add}</Button></div>
                <div className="mt-5 space-y-6">
                  {resume.experience.map((item, index) => (
                    <div key={item.id} className="border-t border-line pt-5 first:border-t-0 first:pt-0">
                      <div className="flex gap-2"><div className="grid flex-1 gap-2 sm:grid-cols-2"><Input value={item.role} onChange={(event) => { const experience = [...resume.experience]; experience[index] = { ...item, role: event.target.value }; updateResume({ experience }); }} placeholder={copy.role} /><Input value={item.company} onChange={(event) => { const experience = [...resume.experience]; experience[index] = { ...item, company: event.target.value }; updateResume({ experience }); }} placeholder={copy.company} /></div><button type="button" onClick={() => updateResume({ experience: resume.experience.filter((entry) => entry.id !== item.id) })} className="grid h-11 w-11 shrink-0 place-items-center rounded-[var(--radius-control)] text-ink-3 hover:bg-[var(--negative-wash)] hover:text-negative" aria-label={copy.deleteExperience}><Trash2 className="h-3.5 w-3.5" /></button></div>
                      <div className="mt-2 grid grid-cols-2 gap-2"><Input value={item.start} onChange={(event) => { const experience = [...resume.experience]; experience[index] = { ...item, start: event.target.value }; updateResume({ experience }); }} placeholder={copy.start} /><Input value={item.end} onChange={(event) => { const experience = [...resume.experience]; experience[index] = { ...item, end: event.target.value }; updateResume({ experience }); }} placeholder={copy.end} /></div>
                      <Textarea value={item.highlights.join("\n")} onChange={(event) => { const experience = [...resume.experience]; experience[index] = { ...item, highlights: event.target.value.split("\n") }; updateResume({ experience }); }} className="mt-2 min-h-32 text-xs" placeholder={copy.highlights} />
                    </div>
                  ))}
                  {!resume.experience.length && <EmptyEditor text={copy.noExperience} />}
                </div>
              </div>
            )}

            {activeSection === "education" && (
              <div>
                <div className="flex items-start justify-between gap-4"><EditorHeading title={copy.education} note={copy.educationNote} /><Button variant="outline" size="sm" onClick={() => updateResume({ education: [...resume.education, { id: `edu-${Date.now()}`, school: "", degree: "", year: "" }] })}><Plus className="h-3.5 w-3.5" /> {messages.common.add}</Button></div>
                <div className="mt-5 space-y-5">
                  {resume.education.map((item, index) => (
                    <div key={item.id} className="border-t border-line pt-5 first:border-t-0 first:pt-0">
                      <div className="flex gap-2"><div className="grid flex-1 gap-2"><Input value={item.school} onChange={(event) => { const education = [...resume.education]; education[index] = { ...item, school: event.target.value }; updateResume({ education }); }} placeholder={copy.school} /><Input value={item.degree} onChange={(event) => { const education = [...resume.education]; education[index] = { ...item, degree: event.target.value }; updateResume({ education }); }} placeholder={copy.degree} /><Input value={item.year} onChange={(event) => { const education = [...resume.education]; education[index] = { ...item, year: event.target.value }; updateResume({ education }); }} placeholder={copy.year} /></div><button type="button" onClick={() => updateResume({ education: resume.education.filter((entry) => entry.id !== item.id) })} className="grid h-11 w-11 shrink-0 place-items-center rounded-[var(--radius-control)] text-ink-3 hover:bg-[var(--negative-wash)] hover:text-negative" aria-label={copy.deleteEducation}><Trash2 className="h-3.5 w-3.5" /></button></div>
                    </div>
                  ))}
                  {!resume.education.length && <EmptyEditor text={copy.noEducation} />}
                </div>
              </div>
            )}
          </div>

          {lastAnalysisMeta && <div className="flex items-center gap-2 border-t border-line bg-surface-2 px-5 py-3 text-[0.6875rem] text-ink-3"><Check className="h-3.5 w-3.5 text-positive" /> {copy.lastAnalysis}: {lastAnalysisMeta.fileName || lastAnalysisMeta.targetTitle || copy.preview}</div>}
        </aside>
      </div>

      {!hasContent && (
        <section className="mt-10 grid gap-5 border-t border-line pt-8 sm:grid-cols-[1fr_auto] sm:items-center">
          <div><h2 className="text-lg font-semibold text-ink">{messages.empty.resumeTitle}</h2><p className="mt-2 text-sm leading-6 text-ink-2">{messages.empty.resumeBody}</p></div>
          <div className="flex flex-wrap gap-2"><Button variant="primary" onClick={() => setShowImport(true)}>{messages.empty.upload}</Button><Button variant="outline" onClick={loadDemoProfile}>{messages.demo.open}</Button></div>
        </section>
      )}

      {atsResult && <div className="mt-10"><AtsScoreBreakdown result={atsResult} /></div>}
      <div className="mt-10"><ActionableRecommendations items={displayedRecommendations} onAction={handleRecommendation} /></div>
    </main>
  );
}

function ResumeBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mt-7"><h3 className="mb-3 text-[0.6875rem] font-bold text-[var(--paper-muted)]">{title.toUpperCase()}</h3>{children}</section>;
}

function EditorHeading({ title, note }: { title: string; note: string }) {
  return <div><h2 className="text-sm font-semibold text-ink">{title}</h2><p className="mt-1 text-[0.6875rem] leading-5 text-ink-3">{note}</p></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-[0.6875rem] font-medium text-ink-2">{label}</span>{children}</label>;
}

function EmptyEditor({ text }: { text: string }) {
  return <div className="rounded-[var(--radius-control)] border border-dashed border-line-strong p-5 text-center text-xs text-ink-3">{text}</div>;
}
