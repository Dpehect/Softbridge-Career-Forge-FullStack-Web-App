"use client";

import { type ChangeEvent, useMemo, useState } from "react";
import {
  Camera,
  Check,
  Download,
  FileText,
  GraduationCap,
  Plus,
  Sparkles,
  Trash2,
  UserRound,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FilePickButton } from "@/components/FilePickButton";
import { useCareerStore, parsedToResume, resumeToParsed } from "@/store/useCareerStore";
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

type EditorSection = "profile" | "skills" | "experience" | "education";

const sections: Array<{ id: EditorSection; label: string; icon: typeof UserRound }> = [
  { id: "profile", label: "Profil", icon: UserRound },
  { id: "skills", label: "Beceriler", icon: Wrench },
  { id: "experience", label: "Deneyim", icon: FileText },
  { id: "education", label: "Eğitim", icon: GraduationCap },
];

export default function ResumePage() {
  const mounted = useHydrated();
  const [activeSection, setActiveSection] = useState<EditorSection>("profile");
  const [skillDraft, setSkillDraft] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [showImport, setShowImport] = useState(false);
  const {
    resume,
    updateResume,
    setResume,
    forgeParsedCv,
    careerGoalId,
    lastAnalysisMeta,
    addSkills,
    pushForgeHistory,
  } = useCareerStore();

  const hasContent = Boolean(resume.fullName || resume.headline || resume.summary || resume.skills.length || resume.experience.length);
  const parsed = useMemo(() => resumeToParsed(resume), [resume]);
  const feedback = useMemo(() => hasContent ? generateCvFeedback(parsed) : null, [hasContent, parsed]);
  const journey = useMemo(
    () => buildJourneyInsight({ cv: forgeParsedCv ?? (hasContent ? parsed : null), goalId: careerGoalId, feedback }),
    [forgeParsedCv, hasContent, parsed, careerGoalId, feedback]
  );

  if (!mounted) {
    return <div className="grid min-h-[60vh] place-items-center"><span className="h-6 w-6 animate-spin rounded-full border-2 border-line-strong border-t-brand" /></div>;
  }

  const applyParsed = (cv: ParsedCV, source: string) => {
    setResume(parsedToResume(cv));
    pushForgeHistory({ action: "parse", summary: `${cv.name} · ${source}`, payload: cv });
    setShowImport(false);
    toast.success("Belge düzenleyiciye aktarıldı.");
  };

  const importText = (raw: string, source: string) => {
    try {
      const cleaned = cleanExtractedText(raw);
      applyParsed(parseCV(cleaned), source);
      setPasteText(cleaned);
    } catch {
      toast.error("Belge yapısı çözümlenemedi.");
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
    const reader = new FileReader();
    reader.onload = () => updateResume({ photoDataUrl: String(reader.result) });
    reader.readAsDataURL(file);
  };

  return (
    <main className="product-page">
      <header className="grid gap-6 border-b border-line pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="page-kicker"><FileText className="h-3.5 w-3.5" /> Özgeçmiş stüdyosu</p>
          <h1 className="page-title-compact mt-4">Belgenizi bir kanıt editörü gibi yönetin.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-2">Düzenleme, ATS kontrolü ve baskı önizlemesi aynı belge üzerinde ilerler.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setShowImport((value) => !value)}><Plus className="h-4 w-4" /> Belge ekle</Button>
          <Button
            variant="primary"
            disabled={!hasContent}
            onClick={async () => {
              await exportCvAsPdf(parsed);
              toast.success("PDF hazırlandı.");
            }}
          >
            <Download className="h-4 w-4" /> PDF indir
          </Button>
        </div>
      </header>

      {showImport && (
        <section className="mt-6 surface-subtle p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
            <div className="min-w-56">
              <p className="text-xs font-semibold text-ink">Belge içe aktar</p>
              <p className="mt-1 text-[0.6875rem] leading-5 text-ink-3">PDF/TXT seçin veya düz metni yapıştırın.</p>
              <FilePickButton label="Dosya seç" className="mt-3" variant="outline" size="sm" silentSuccess onText={(text, fileName) => importText(text, fileName)} />
            </div>
            <div className="flex-1">
              <Textarea value={pasteText} onChange={(event) => setPasteText(event.target.value)} placeholder="Özgeçmiş metni" className="min-h-28 bg-surface text-xs" />
              <Button variant="primary" size="sm" className="mt-2" disabled={!pasteText.trim()} onClick={() => importText(pasteText, "Yapıştırılan metin")}>Metni çözümle</Button>
            </div>
          </div>
        </section>
      )}

      {hasContent && (
        <section className="mt-6 grid gap-px border border-line bg-line sm:grid-cols-[1fr_1fr_1.4fr]">
          <div className="bg-surface p-4">
            <p className="section-label">ATS skoru</p>
            <p className="metric-number mt-2 text-2xl font-semibold text-brand-strong">{journey.atsScore}%</p>
          </div>
          <div className="bg-surface p-4">
            <p className="section-label">Belge gücü</p>
            <p className="metric-number mt-2 text-2xl font-semibold text-ink">{feedback?.overallScore || 0}%</p>
          </div>
          <div className="bg-surface p-4">
            <p className="section-label">Sıradaki iyileştirme</p>
            <p className="mt-2 text-xs leading-5 text-ink-2">{feedback?.improvements[0] || "Önce temel profil bilgilerini tamamlayın."}</p>
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
                  <p className="mt-3 text-sm font-semibold">Belge önizlemesi</p>
                  <p className="mt-2 max-w-xs text-xs leading-5 text-[var(--paper-muted)]">Sağdaki alanları doldurduğunuzda ATS dostu tek sütun düzeni burada görünür.</p>
                </div>
              </div>
            ) : (
              <div>
                <header className="flex items-start justify-between gap-6 border-b border-[var(--paper-line)] pb-6">
                  <div>
                    <h2 className="text-2xl font-semibold leading-none">{resume.fullName || "Ad Soyad"}</h2>
                    <p className="mt-2 text-xs font-semibold text-[var(--paper-accent)]">{(resume.headline || "Profesyonel başlık").toUpperCase()}</p>
                    <p className="mt-3 text-[0.6875rem] text-[var(--paper-muted)]">{[resume.email, resume.location].filter(Boolean).join(" · ")}</p>
                  </div>
                  {resume.photoDataUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={resume.photoDataUrl} alt="Profil" className="h-14 w-14 rounded-full border border-[var(--paper-line)] object-cover" />
                  )}
                </header>

                {resume.summary && (
                  <ResumeBlock title="Profil"><p className="text-xs leading-5 text-[var(--paper-copy)]">{resume.summary}</p></ResumeBlock>
                )}

                {resume.experience.length > 0 && (
                  <ResumeBlock title="Deneyim">
                    <div className="space-y-5">
                      {resume.experience.map((item) => (
                        <article key={item.id}>
                          <div className="flex items-baseline justify-between gap-4">
                            <p className="text-xs font-semibold">{item.role || "Pozisyon"} <span className="font-normal text-[var(--paper-muted)]">· {item.company || "Şirket"}</span></p>
                            <span className="shrink-0 text-[0.625rem] text-[var(--paper-muted)]">{item.start} – {item.end}</span>
                          </div>
                          <ul className="mt-2 list-disc space-y-1 pl-4 text-[0.6875rem] leading-5 text-[var(--paper-copy)] marker:text-[var(--paper-accent)]">
                            {item.highlights.filter(Boolean).map((highlight, index) => <li key={`${item.id}-${index}`}>{highlight}</li>)}
                          </ul>
                        </article>
                      ))}
                    </div>
                  </ResumeBlock>
                )}

                {resume.skills.length > 0 && (
                  <ResumeBlock title="Beceriler"><p className="text-[0.6875rem] leading-5 text-[var(--paper-copy)]">{resume.skills.join(" · ")}</p></ResumeBlock>
                )}

                {resume.education.length > 0 && (
                  <ResumeBlock title="Eğitim">
                    <div className="space-y-2">
                      {resume.education.map((item) => (
                        <div key={item.id} className="flex items-baseline justify-between gap-4 text-xs">
                          <p className="font-semibold">{item.school} <span className="font-normal text-[var(--paper-muted)]">· {item.degree}</span></p>
                          <span className="text-[0.625rem] text-[var(--paper-muted)]">{item.year}</span>
                        </div>
                      ))}
                    </div>
                  </ResumeBlock>
                )}
              </div>
            )}
          </div>
        </section>

        <aside className="surface-panel overflow-hidden xl:sticky xl:top-32">
          <nav className="grid grid-cols-4 border-b border-line bg-surface-2" aria-label="Özgeçmiş bölümleri">
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
                  <Icon className="h-4 w-4" /><span className="truncate">{section.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="max-h-[calc(100vh-12rem)] overflow-y-auto p-5 sm:p-6">
            {activeSection === "profile" && (
              <div className="space-y-4">
                <EditorHeading title="Profil bilgileri" note="İşe alım ekibinin ilk gördüğü kimlik ve konumlandırma." />
                <div className="flex items-center gap-3 border-b border-line pb-4">
                  <label className="relative grid h-12 w-12 cursor-pointer place-items-center overflow-hidden rounded-full border border-line bg-surface-2 text-ink-3">
                    {resume.photoDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={resume.photoDataUrl} alt="" className="h-full w-full object-cover" />
                    ) : <Camera className="h-4 w-4" />}
                    <input type="file" accept="image/*" className="sr-only" onChange={uploadPhoto} />
                  </label>
                  <div><p className="text-xs font-semibold text-ink">Profil fotoğrafı</p><p className="mt-1 text-[0.625rem] text-ink-3">İsteğe bağlı · ATS sürümünde kaldırılabilir</p></div>
                </div>
                <Field label="Ad soyad"><Input value={resume.fullName} onChange={(event) => updateResume({ fullName: event.target.value })} /></Field>
                <Field label="Profesyonel başlık"><Input value={resume.headline} onChange={(event) => updateResume({ headline: event.target.value })} /></Field>
                <div className="grid gap-3 sm:grid-cols-2"><Field label="E-posta"><Input value={resume.email} onChange={(event) => updateResume({ email: event.target.value })} /></Field><Field label="Konum"><Input value={resume.location} onChange={(event) => updateResume({ location: event.target.value })} /></Field></div>
                <Field label="Özet"><Textarea value={resume.summary} onChange={(event) => updateResume({ summary: event.target.value })} className="min-h-36" /></Field>
              </div>
            )}

            {activeSection === "skills" && (
              <div>
                <EditorHeading title="Beceri kanıtları" note="Yalnızca mülakatta savunabileceğiniz becerileri tutun." />
                <div className="mt-5 flex flex-wrap gap-2">
                  {resume.skills.map((skill) => <button key={skill} type="button" onClick={() => updateResume({ skills: resume.skills.filter((item) => item !== skill) })} className="rounded-full border border-line bg-surface-2 px-2.5 py-1 text-[0.6875rem] text-ink-2 hover:border-negative/40 hover:text-negative">{skill} ×</button>)}
                </div>
                <div className="mt-4 flex gap-2"><Input value={skillDraft} onChange={(event) => setSkillDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addSkill(); } }} placeholder="Yeni beceri" /><Button variant="outline" size="icon" onClick={() => addSkill()} aria-label="Beceri ekle"><Plus className="h-4 w-4" /></Button></div>
                {journey.missingSkills.length > 0 && (
                  <div className="mt-7 border-t border-line pt-5">
                    <div className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-info" /><p className="text-xs font-semibold text-ink">Hedef rolde arananlar</p></div>
                    <div className="mt-3 flex flex-wrap gap-2">{journey.missingSkills.slice(0, 5).map((skill) => <button key={skill} type="button" onClick={() => { const count = addSkills([skill]); toast[count ? "success" : "info"](count ? `${skill} eklendi.` : `${skill} zaten mevcut.`); }} className="rounded-full bg-[var(--info-wash)] px-2.5 py-1 text-[0.6875rem] font-medium text-info">+ {skill}</button>)}</div>
                  </div>
                )}
              </div>
            )}

            {activeSection === "experience" && (
              <div>
                <div className="flex items-start justify-between gap-4"><EditorHeading title="Deneyim kanıtları" note="Her maddeyi eylem, yöntem ve sonuçla kurun." /><Button variant="outline" size="sm" onClick={() => updateResume({ experience: [{ id: `exp-${Date.now()}`, role: "", company: "", start: "", end: "", highlights: [] }, ...resume.experience] })}><Plus className="h-3.5 w-3.5" /> Ekle</Button></div>
                <div className="mt-5 space-y-6">
                  {resume.experience.map((item, index) => (
                    <div key={item.id} className="border-t border-line pt-5 first:border-t-0 first:pt-0">
                      <div className="flex gap-2"><div className="grid flex-1 gap-2 sm:grid-cols-2"><Input value={item.role} onChange={(event) => { const experience = [...resume.experience]; experience[index] = { ...item, role: event.target.value }; updateResume({ experience }); }} placeholder="Pozisyon" /><Input value={item.company} onChange={(event) => { const experience = [...resume.experience]; experience[index] = { ...item, company: event.target.value }; updateResume({ experience }); }} placeholder="Şirket" /></div><button type="button" onClick={() => updateResume({ experience: resume.experience.filter((entry) => entry.id !== item.id) })} className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-control)] text-ink-3 hover:bg-[var(--negative-wash)] hover:text-negative" aria-label="Deneyimi sil"><Trash2 className="h-3.5 w-3.5" /></button></div>
                      <div className="mt-2 grid grid-cols-2 gap-2"><Input value={item.start} onChange={(event) => { const experience = [...resume.experience]; experience[index] = { ...item, start: event.target.value }; updateResume({ experience }); }} placeholder="Başlangıç" /><Input value={item.end} onChange={(event) => { const experience = [...resume.experience]; experience[index] = { ...item, end: event.target.value }; updateResume({ experience }); }} placeholder="Bitiş" /></div>
                      <Textarea value={item.highlights.join("\n")} onChange={(event) => { const experience = [...resume.experience]; experience[index] = { ...item, highlights: event.target.value.split("\n") }; updateResume({ experience }); }} className="mt-2 min-h-32 text-xs" placeholder="Her satıra bir ölçülebilir sonuç" />
                    </div>
                  ))}
                  {!resume.experience.length && <EmptyEditor text="Henüz deneyim eklenmedi." />}
                </div>
              </div>
            )}

            {activeSection === "education" && (
              <div>
                <div className="flex items-start justify-between gap-4"><EditorHeading title="Eğitim" note="Okul, program ve tarih bilgisini sade tutun." /><Button variant="outline" size="sm" onClick={() => updateResume({ education: [...resume.education, { id: `edu-${Date.now()}`, school: "", degree: "", year: "" }] })}><Plus className="h-3.5 w-3.5" /> Ekle</Button></div>
                <div className="mt-5 space-y-5">
                  {resume.education.map((item, index) => (
                    <div key={item.id} className="border-t border-line pt-5 first:border-t-0 first:pt-0">
                      <div className="flex gap-2"><div className="grid flex-1 gap-2"><Input value={item.school} onChange={(event) => { const education = [...resume.education]; education[index] = { ...item, school: event.target.value }; updateResume({ education }); }} placeholder="Okul" /><Input value={item.degree} onChange={(event) => { const education = [...resume.education]; education[index] = { ...item, degree: event.target.value }; updateResume({ education }); }} placeholder="Program / derece" /><Input value={item.year} onChange={(event) => { const education = [...resume.education]; education[index] = { ...item, year: event.target.value }; updateResume({ education }); }} placeholder="Yıl" /></div><button type="button" onClick={() => updateResume({ education: resume.education.filter((entry) => entry.id !== item.id) })} className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-control)] text-ink-3 hover:bg-[var(--negative-wash)] hover:text-negative" aria-label="Eğitimi sil"><Trash2 className="h-3.5 w-3.5" /></button></div>
                    </div>
                  ))}
                  {!resume.education.length && <EmptyEditor text="Henüz eğitim eklenmedi." />}
                </div>
              </div>
            )}
          </div>

          {lastAnalysisMeta && <div className="flex items-center gap-2 border-t border-line bg-surface-2 px-5 py-3 text-[0.6875rem] text-ink-3"><Check className="h-3.5 w-3.5 text-positive" /> Son analiz: {lastAnalysisMeta.fileName || lastAnalysisMeta.targetTitle || "özgeçmiş"}</div>}
        </aside>
      </div>
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
