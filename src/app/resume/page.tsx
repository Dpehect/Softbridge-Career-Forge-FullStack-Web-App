"use client";

import { type ChangeEvent, useMemo, useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
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
  Eye,
  EyeOff,
  Palette,
  Clock,
  Save,
  AlertTriangle,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Eye as EyeIcon,
  Copy,
  Edit2,
  Layout,
  Layers,
  HelpCircle,
  ArrowLeft,
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
import { useMessages } from "@/i18n/useMessages";
import { calculateAtsScore } from "@/features/analysis/atsScore";
import { buildActionableRecommendations, type ActionableRecommendation, type RecommendationAction } from "@/features/analysis/recommendations";
import { AtsScoreBreakdown } from "@/components/AtsScoreBreakdown";
import { ActionableRecommendations } from "@/components/ActionableRecommendations";
import { CloudSyncStatus } from "@/components/sync/CloudSyncStatus";
import type { CvBackup } from "@/lib/forge/types";

type EditorTab = "profile" | "experience" | "skills" | "credentials" | "sections" | "styling";

export default function ResumePage() {
  const mounted = useHydrated();
  const { locale, messages, page } = useMessages();
  const copy = page.resume;
  const isTr = locale === "tr";

  const [activeTab, setActiveTab] = useState<EditorTab>("profile");
  const [skillDraft, setSkillDraft] = useState("");
  const [langDraft, setLangDraft] = useState({ name: "", level: "" });
  const [socialDraft, setSocialDraft] = useState({ label: "", url: "" });
  const [pasteText, setPasteText] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [versionLabel, setVersionLabel] = useState("");
  const [suggestionOverrides, setSuggestionOverrides] = useState<Record<string, string>>({});
  
  const [newCustomSecTitle, setNewCustomSecTitle] = useState("");
  const [compareBackup, setCompareBackup] = useState<CvBackup | null>(null);

  const paperRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

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
    forgeBackups,
    saveForgeBackup,
    restoreForgeBackup,
    deleteForgeBackup,
    resetResume,
    clearForgeCv,
  } = useCareerStore();

  const hasContent = Boolean(resume.fullName || resume.headline || resume.summary || resume.skills.length || resume.experience.length);
  const parsed = useMemo(() => resumeToParsed(resume), [resume]);
  const analysisCv = forgeParsedCv ?? parsed;
  const feedback = useMemo(() => hasContent ? generateCvFeedback(analysisCv, "", locale) : null, [analysisCv, hasContent, locale]);
  const atsResult = useMemo(() => hasContent ? calculateAtsScore(analysisCv, locale) : null, [analysisCv, hasContent, locale]);
  const recommendations = useMemo(() => hasContent ? buildActionableRecommendations(analysisCv, locale) : [], [analysisCv, hasContent, locale]);
  const displayedRecommendations = useMemo(
    () => recommendations.map((item) => suggestionOverrides[item.id] ? { ...item, after: suggestionOverrides[item.id] } : item),
    [recommendations, suggestionOverrides]
  );

  // Monitor A4 page overflow
  useEffect(() => {
    const el = paperRef.current;
    if (!el) return;
    setIsOverflowing(el.scrollHeight > 1150);
  }, [resume, resumeSectionOrder]);

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

  const handleRecommendation = (item: ActionableRecommendation, action: RecommendationAction) => {
    if (action === "undo") {
      undoResume();
      return;
    }
    if (action === "apply") {
      if (item.requiresConfirmation) {
        setActiveTab("skills");
        toast.warning(isTr ? "Örnek, gerçek veriniz doğrulanmadan uygulanmadı." : "The example was not applied until you confirm it with real data.");
        return;
      }
      if (item.id === "summary-positioning") updateResume({ summary: item.after });
      toast.success(isTr ? "Öneri CV'ye uygulandı." : "Suggestion applied to the resume.");
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
        [item.id]: isTr ? `${current} Teknik bağlam: ${skills || "kullandığınız araçlar"}.` : `${current} Technical context: ${skills || "tools used"}.`,
      }));
    } else {
      setSuggestionOverrides((value) => ({
        ...value,
        [item.id]: isTr ? `Alternatif: ${item.correction}` : `Alternative: ${item.correction}`,
      }));
    }
  };

  const toggleVisibility = (section: string) => {
    const visibility = resume.sectionVisibility || {};
    updateResume({
      sectionVisibility: {
        ...visibility,
        [section]: visibility[section] === false ? true : false,
      },
    });
  };

  const updateStyle = (patch: Partial<NonNullable<typeof resume.customization>>) => {
    updateResume({
      customization: {
        template: resume.customization?.template || "classic",
        fontFamily: resume.customization?.fontFamily || "sans",
        primaryColor: resume.customization?.primaryColor || "brand",
        ...patch,
      },
    });
  };

  const handleCreateVersion = () => {
    const label = versionLabel.trim();
    if (!label) {
      toast.error(isTr ? "Lütfen bir sürüm adı girin." : "Please enter a version name.");
      return;
    }
    const backup = saveForgeBackup(label);
    if (backup) {
      toast.success(isTr ? "Yeni CV sürümü kaydedildi." : "New resume version saved.");
      setVersionLabel("");
    } else {
      toast.error(isTr ? "Kaydedilecek CV verisi bulunamadı." : "No resume data found to save.");
    }
  };

  const handleAddCustomSection = () => {
    const title = newCustomSecTitle.trim();
    if (!title) {
      toast.error(isTr ? "Lütfen bir bölüm başlığı girin." : "Please enter a section title.");
      return;
    }
    const id = `custom-${Date.now()}`;
    const customSections = [...(resume.customSections || [])];
    customSections.push({
      id,
      title,
      content: "",
      visible: true,
    });
    const order = [...resumeSectionOrder];
    order.push(id);
    updateResume({
      customSections,
      sectionVisibility: {
        ...(resume.sectionVisibility || {}),
        [id]: true
      }
    });
    useCareerStore.setState({ resumeSectionOrder: order });
    setNewCustomSecTitle("");
    toast.success(isTr ? `"${title}" özel bölümü oluşturuldu.` : `"${title}" custom section created.`);
  };

  const handleDeleteCustomSection = (id: string) => {
    const customSections = (resume.customSections || []).filter(c => c.id !== id);
    const order = resumeSectionOrder.filter(secId => secId !== id);
    const visibility = { ...(resume.sectionVisibility || {}) };
    delete visibility[id];

    updateResume({
      customSections,
      sectionVisibility: visibility
    });
    useCareerStore.setState({ resumeSectionOrder: order });
    toast.success(isTr ? "Özel bölüm silindi." : "Custom section deleted.");
  };

  const handleRenameBackup = (id: string) => {
    const backup = forgeBackups.find(b => b.id === id);
    if (!backup) return;
    const label = window.prompt(isTr ? "Yeni sürüm adını girin:" : "Enter new version name:", backup.label);
    if (label && label.trim()) {
      const updatedBackups = forgeBackups.map(b => b.id === id ? { ...b, label: label.trim() } : b);
      useCareerStore.setState({ forgeBackups: updatedBackups });
      toast.success(isTr ? "Sürüm adı güncellendi." : "Version name updated.");
    }
  };

  const handleDuplicateBackup = (id: string) => {
    const backup = forgeBackups.find(b => b.id === id);
    if (!backup) return;
    const duplicated = {
      ...backup,
      id: `backup-${Date.now()}`,
      label: isTr ? `${backup.label} (Kopya)` : `${backup.label} (Copy)`,
      createdAt: new Date().toISOString()
    };
    useCareerStore.setState({ forgeBackups: [duplicated, ...forgeBackups] });
    toast.success(isTr ? "Sürüm çoğaltıldı." : "Version duplicated.");
  };

  const completenessScore = useMemo(() => {
    let score = 0;
    if (resume.fullName) score += 15;
    if (resume.headline) score += 10;
    if (resume.summary) score += 15;
    if (resume.skills.length >= 3) score += 15;
    if (resume.experience.length >= 1) score += 20;
    if (resume.education.length >= 1) score += 15;
    if (resume.projects && resume.projects.length >= 1) score += 10;
    return score;
  }, [resume]);

  const renderContent = () => {
    if (!mounted) {
      return (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(21rem,0.8fr)] xl:items-start animate-pulse mt-8">
          <div className="h-[48rem] rounded bg-surface-2 border border-line" />
          <div className="h-[48rem] rounded bg-surface-2 border border-line" />
        </div>
      );
    }

    const template = resume.customization?.template || "classic";
    const fontStyle = resume.customization?.fontFamily === "serif" ? "font-serif" : resume.customization?.fontFamily === "mono" ? "font-mono" : "font-sans";
    const colorStyle = resume.customization?.primaryColor === "emerald" ? "text-emerald-600 border-emerald-600" : resume.customization?.primaryColor === "indigo" ? "text-indigo-600 border-indigo-600" : resume.customization?.primaryColor === "slate" ? "text-slate-700 border-slate-700" : "text-brand-strong border-brand-strong";

    return (
      <>
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
                <Button variant="primary" size="sm" className="mt-2" disabled={!pasteText.trim()} onClick={() => importText(pasteText, isTr ? "Yapıştırılan metin" : "Pasted text")}>{copy.parse}</Button>
              </div>
            </div>
          </section>
        )}

        {isOverflowing && (
          <div className="mt-6 flex items-start gap-2 border border-caution/20 bg-[var(--caution-wash)] p-3 text-xs leading-5 text-caution rounded-lg" role="alert">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>{isTr ? "İçerik tek sayfayı aşabilir. Yazdırma boyutunu optimize etmek için deneyim açıklamalarını kısaltmayı veya bazı bölümleri gizlemeyi deneyin." : "Content might exceed a single page limit. Try simplifying experience descriptions or hiding optional sections to optimize print format."}</p>
          </div>
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
              <p className="mt-2 text-xs leading-5 text-ink-2">{feedback?.improvements[0] || (isTr ? "Önce temel profil bilgilerini tamamlayın." : "Complete the essential profile details first.")}</p>
            </div>
          </section>
        )}

        <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(21rem,0.8fr)] xl:items-start">
          {/* PAPER PREVIEW */}
          <section className="relative min-h-[52rem] overflow-hidden bg-surface-2 p-3 sm:p-8 rounded-lg border border-line">
            <div
              ref={paperRef}
              className={cn(
                "mx-auto min-h-[48rem] max-w-[46rem] rounded-[var(--radius-control)] border border-[var(--paper-line)] bg-[var(--paper-bg)] px-8 py-9 text-[var(--paper-ink)] shadow-[var(--elevation-2)] sm:px-12 sm:py-12",
                fontStyle
              )}
            >
              {!hasContent ? (
                <div className="grid min-h-[38rem] place-items-center text-center">
                  <div>
                    <FileText className="mx-auto h-8 w-8 text-[var(--paper-muted)]" />
                    <h2 className="mt-4 text-base font-semibold text-[var(--paper-ink)]">{isTr ? "Boş Şablon" : "Empty Canvas"}</h2>
                    <p className="mt-2 text-xs text-[var(--paper-muted)] leading-5 max-w-sm">{isTr ? "Bölüm editörünü doldurmaya başladığınızda dinamik bir A4 önizlemesi burada oluşturulacaktır." : "A dynamic A4 preview will render here once you start filling out the editor sections."}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Template header styling */}
                  <header className={cn("border-b pb-6", template === "modern" ? "border-l-4 pl-4" : "border-[var(--paper-line)]")}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="text-2xl font-bold leading-none text-[var(--paper-ink)]">{resume.fullName || copy.fullName}</h2>
                        <p className={cn("mt-2 text-xs font-semibold uppercase tracking-wide", colorStyle)}>{resume.headline || copy.headline}</p>
                      </div>
                      {resume.photoDataUrl && (
                        <div className="relative h-16 w-16 overflow-hidden rounded-full border border-[var(--paper-line)] bg-surface-2 self-start shrink-0">
                          <Image src={resume.photoDataUrl} alt={resume.fullName} fill className="object-cover" />
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] text-[var(--paper-muted)]">
                      {resume.email && <span>{resume.email}</span>}
                      {resume.phone && <span>{resume.phone}</span>}
                      {resume.location && <span>{resume.location}</span>}
                      {resume.website && <span>{resume.website}</span>}
                      {resume.socialLinks?.map((soc) => (
                        <span key={soc.id} className="font-semibold text-[var(--paper-ink)]">{soc.label}: {soc.url}</span>
                      ))}
                    </div>
                  </header>

                  {/* Render sections in order */}
                  {resumeSectionOrder.map((sectionId) => {
                    if (sectionId === "profile" && resume.summary && resume.sectionVisibility?.profile !== false) {
                      return (
                        <ResumeBlock key="profile" title={isTr ? "Kişisel Özet" : "Summary"}>
                          <p className="text-xs leading-5 text-[var(--paper-ink-light)]">{resume.summary}</p>
                        </ResumeBlock>
                      );
                    }

                    if (sectionId === "skills" && resume.skills.length && resume.sectionVisibility?.skills !== false) {
                      return (
                        <ResumeBlock key="skills" title={copy.skills}>
                          <div className="flex flex-wrap gap-1.5">
                            {resume.skills.map((skill) => (
                              <span key={skill} className="rounded border border-[var(--paper-line)] bg-surface px-2.5 py-0.5 text-xs text-[var(--paper-ink)] font-medium">{skill}</span>
                            ))}
                          </div>
                        </ResumeBlock>
                      );
                    }

                    if (sectionId === "experience" && resume.experience.length && resume.sectionVisibility?.experience !== false) {
                      return (
                        <ResumeBlock key="experience" title={copy.experience}>
                          <div className="space-y-5">
                            {resume.experience.map((item) => (
                              <div key={item.id}>
                                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                                  <h4 className="text-xs font-bold text-[var(--paper-ink)]">{item.role} · <span className="text-[var(--paper-muted)]">{item.company}</span></h4>
                                  <span className="text-[10px] text-[var(--paper-muted)] font-medium">{item.start} - {item.end}</span>
                                </div>
                                <ul className="mt-2 list-disc pl-4 space-y-1">
                                  {item.highlights.map((bullet, bulletIdx) => (
                                    <li key={bulletIdx} className="text-xs leading-5 text-[var(--paper-ink-light)]">{bullet}</li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </ResumeBlock>
                      );
                    }

                    if (sectionId === "education" && resume.education.length && resume.sectionVisibility?.education !== false) {
                      return (
                        <ResumeBlock key="education" title={copy.education}>
                          <div className="space-y-4">
                            {resume.education.map((item) => (
                              <div key={item.id} className="flex flex-wrap justify-between gap-x-4 gap-y-1">
                                <h4 className="text-xs font-bold text-[var(--paper-ink)]">{item.school} · <span className="text-[var(--paper-muted)]">{item.degree}</span></h4>
                                <span className="text-[10px] text-[var(--paper-muted)] font-medium">{item.year}</span>
                              </div>
                            ))}
                          </div>
                        </ResumeBlock>
                      );
                    }

                    if (sectionId === "projects" && resume.projects?.length && resume.sectionVisibility?.projects !== false) {
                      return (
                        <ResumeBlock key="projects" title={isTr ? "Projeler" : "Projects"}>
                          <div className="space-y-4">
                            {resume.projects.map((proj) => (
                              <div key={proj.id}>
                                <h4 className="text-xs font-bold flex items-center justify-between text-[var(--paper-ink)]">
                                  <span>{proj.title}</span>
                                  {proj.url && <span className="text-[10px] text-[var(--paper-muted)] font-normal">{proj.url}</span>}
                                </h4>
                                <p className="mt-1 text-xs text-[var(--paper-ink-light)] leading-relaxed">{proj.description}</p>
                              </div>
                            ))}
                          </div>
                        </ResumeBlock>
                      );
                    }

                    if (sectionId === "certifications" && resume.certifications?.length && resume.sectionVisibility?.certifications !== false) {
                      return (
                        <ResumeBlock key="certifications" title={isTr ? "Sertifikalar" : "Certifications"}>
                          <div className="space-y-2">
                            {resume.certifications.map((cert) => (
                              <div key={cert.id} className="flex justify-between text-xs">
                                <span className="font-semibold text-[var(--paper-ink)]">{cert.name} <span className="text-[var(--paper-muted)]">· {cert.issuer}</span></span>
                                <span className="text-[10px] text-[var(--paper-muted)]">{cert.date}</span>
                              </div>
                            ))}
                          </div>
                        </ResumeBlock>
                      );
                    }

                    if (sectionId === "languages" && resume.languages?.length && resume.sectionVisibility?.languages !== false) {
                      return (
                        <ResumeBlock key="languages" title={isTr ? "Diller" : "Languages"}>
                          <div className="flex flex-wrap gap-x-4 gap-y-1">
                            {resume.languages.map((lang) => (
                              <span key={lang.id} className="text-xs font-medium text-[var(--paper-ink)]">
                                {lang.name} <span className="text-[10px] text-[var(--paper-muted)]">({lang.level})</span>
                              </span>
                            ))}
                          </div>
                        </ResumeBlock>
                      );
                    }

                    if (sectionId === "awards" && resume.awards?.length && resume.sectionVisibility?.awards !== false) {
                      return (
                        <ResumeBlock key="awards" title={isTr ? "Başarılar & Ödüller" : "Awards"}>
                          <div className="space-y-2">
                            {resume.awards.map((award) => (
                              <div key={award.id} className="flex justify-between text-xs">
                                <span className="font-semibold text-[var(--paper-ink)]">{award.title} <span className="text-[var(--paper-muted)]">· {award.issuer}</span></span>
                                <span className="text-[10px] text-[var(--paper-muted)]">{award.date}</span>
                              </div>
                            ))}
                          </div>
                        </ResumeBlock>
                      );
                    }

                    if (sectionId === "publications" && resume.publications?.length && resume.sectionVisibility?.publications !== false) {
                      return (
                        <ResumeBlock key="publications" title={isTr ? "Yayınlar" : "Publications"}>
                          <div className="space-y-3">
                            {resume.publications.map((pub) => (
                              <div key={pub.id}>
                                <div className="flex justify-between text-xs">
                                  <span className="font-semibold text-[var(--paper-ink)]">{pub.title}</span>
                                  <span className="text-[10px] text-[var(--paper-muted)]">{pub.date}</span>
                                </div>
                                <p className="text-[11px] text-[var(--paper-muted)] mt-0.5">{pub.publisher} {pub.url && `· ${pub.url}`}</p>
                              </div>
                            ))}
                          </div>
                        </ResumeBlock>
                      );
                    }

                    if (sectionId.startsWith("custom-")) {
                      const customSec = resume.customSections?.find((c) => c.id === sectionId);
                      if (customSec && customSec.visible !== false && customSec.content) {
                        return (
                          <ResumeBlock key={customSec.id} title={customSec.title}>
                            <p className="text-xs leading-5 text-[var(--paper-ink-light)] whitespace-pre-wrap">{customSec.content}</p>
                          </ResumeBlock>
                        );
                      }
                    }

                    return null;
                  })}
                </div>
              )}
            </div>
          </section>

          {/* EDITOR PANEL */}
          <aside className="surface-panel overflow-hidden border border-line">
            {/* Editor Tabs switcher */}
            <div className="flex overflow-x-auto border-b border-line bg-surface-2 p-1.5 gap-1" role="tablist">
              {[
                { id: "profile", label: isTr ? "Profil" : "Profile" },
                { id: "experience", label: isTr ? "Deneyimler" : "Experience" },
                { id: "skills", label: isTr ? "Yetenekler" : "Skills" },
                { id: "credentials", label: isTr ? "Belgeler" : "Credentials" },
                { id: "sections", label: isTr ? "Bölümler" : "Sections" },
                { id: "styling", label: isTr ? "Tasarım & Sürümler" : "Styles & Versions" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as EditorTab)}
                  className={cn(
                    "min-h-9 whitespace-nowrap rounded-[var(--radius-control)] px-3 text-xs font-semibold transition-colors",
                    activeTab === tab.id ? "bg-surface border border-line text-ink" : "text-ink-3 hover:text-ink-2"
                  )}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {activeTab === "profile" && (
                <div className="space-y-4">
                  <EditorHeading title={copy.profile} note={copy.profileNote} />
                  <div className="flex items-center gap-4">
                    <div className="relative h-14 w-14 overflow-hidden rounded-[var(--radius-control)] border border-line bg-surface-2">
                      {resume.photoDataUrl ? <Image src={resume.photoDataUrl} alt={resume.fullName} fill className="object-cover" /> : <Camera className="mx-auto mt-4 h-5 w-5 text-ink-3" />}
                    </div>
                    <label className="cursor-pointer rounded-[var(--radius-control)] border border-line px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface-2">
                      {copy.photo}
                      <input type="file" accept="image/*" onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => updateResume({ photoDataUrl: String(reader.result) });
                        reader.readAsDataURL(file);
                      }} className="hidden" />
                    </label>
                  </div>
                  <Field label={copy.fullName}><Input value={resume.fullName} onChange={(event) => updateResume({ fullName: event.target.value })} placeholder="Yusuf Demir" /></Field>
                  <Field label={copy.headline}><Input value={resume.headline} onChange={(event) => updateResume({ headline: event.target.value })} placeholder="Senior Frontend Engineer" /></Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label={copy.email}><Input type="email" value={resume.email} onChange={(event) => updateResume({ email: event.target.value })} placeholder="yusuf@example.com" /></Field>
                    <Field label={copy.phone}><Input type="tel" value={resume.phone} onChange={(event) => updateResume({ phone: event.target.value })} placeholder="+90 555 000 00 00" /></Field>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label={copy.location}><Input value={resume.location} onChange={(event) => updateResume({ location: event.target.value })} placeholder="Istanbul, Turkey" /></Field>
                     <Field label={isTr ? "Web Sitesi" : "Website"}><Input value={resume.website} onChange={(event) => updateResume({ website: event.target.value })} placeholder="yusufdemir.dev" /></Field>
                  </div>
                  <Field label={copy.summary}><Textarea value={resume.summary} onChange={(event) => updateResume({ summary: event.target.value })} placeholder={isTr ? "Kariyer hedeflerinizi ve öne çıkan başarılarınızı özetleyin..." : "Summarize your career goals and key achievements..."} className="min-h-24" /></Field>

                  {/* Social Links Sub-Editor */}
                  <div className="border-t border-line pt-4 space-y-3">
                    <h3 className="text-xs font-bold text-ink">{isTr ? "Sosyal Bağlantılar & Portfolyo" : "Social Links & Portfolio"}</h3>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Input value={socialDraft.label} onChange={(e) => setSocialDraft({ ...socialDraft, label: e.target.value })} placeholder={isTr ? "örn: GitHub, LinkedIn" : "e.g. GitHub"} />
                      <div className="flex gap-2">
                        <Input value={socialDraft.url} onChange={(e) => setSocialDraft({ ...socialDraft, url: e.target.value })} placeholder="https://github.com/..." className="flex-1" />
                        <Button type="button" onClick={() => {
                          if (!socialDraft.label || !socialDraft.url) return;
                          updateResume({ socialLinks: [...(resume.socialLinks || []), { id: Math.random().toString(), ...socialDraft }] });
                          setSocialDraft({ label: "", url: "" });
                        }}>{isTr ? "Ekle" : "Add"}</Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {resume.socialLinks?.map((soc) => (
                        <span key={soc.id} className="inline-flex items-center gap-1 border border-line bg-surface-2 px-3 py-1 rounded-full text-xs">
                          {soc.label}
                          <button type="button" onClick={() => updateResume({ socialLinks: resume.socialLinks?.filter((item) => item.id !== soc.id) })} className="text-ink-3 hover:text-negative"><Trash2 className="h-3 w-3" /></button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "experience" && (
                <div className="space-y-4">
                  {/* WORK EXPERIENCE */}
                  <div className="flex items-center justify-between">
                    <EditorHeading title={copy.experienceEvidence} note={copy.experienceNote} />
                    <Button variant="outline" size="sm" onClick={() => updateResume({ experience: [{ id: `exp-${Date.now()}`, role: "", company: "", start: "", end: "", highlights: [""] }, ...resume.experience] })}><Plus className="h-3.5 w-3.5" /> {messages.common.add}</Button>
                  </div>
                  <div className="space-y-6">
                    {resume.experience.map((item, index) => (
                      <div key={item.id} className="border-t border-line pt-5 first:border-t-0 first:pt-0">
                        <div className="flex gap-2">
                          <div className="grid flex-1 gap-2 sm:grid-cols-2">
                            <Input value={item.role} onChange={(event) => { const experience = [...resume.experience]; experience[index] = { ...item, role: event.target.value }; updateResume({ experience }); }} placeholder={copy.role} />
                            <Input value={item.company} onChange={(event) => { const experience = [...resume.experience]; experience[index] = { ...item, company: event.target.value }; updateResume({ experience }); }} placeholder={copy.company} />
                          </div>
                          <button type="button" onClick={() => updateResume({ experience: resume.experience.filter((entry) => entry.id !== item.id) })} className="grid h-11 w-11 shrink-0 place-items-center rounded-[var(--radius-control)] text-ink-3 hover:bg-[var(--negative-wash)] hover:text-negative"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <Input value={item.start} onChange={(event) => { const experience = [...resume.experience]; experience[index] = { ...item, start: event.target.value }; updateResume({ experience }); }} placeholder={copy.start} />
                          <Input value={item.end} onChange={(event) => { const experience = [...resume.experience]; experience[index] = { ...item, end: event.target.value }; updateResume({ experience }); }} placeholder={copy.end} />
                        </div>
                        <Textarea value={item.highlights.join("\n")} onChange={(event) => { const experience = [...resume.experience]; experience[index] = { ...item, highlights: event.target.value.split("\n") }; updateResume({ experience }); }} className="mt-2 min-h-24 text-xs" placeholder={copy.highlights} />
                      </div>
                    ))}
                  </div>

                  {/* PROJECTS SUB-EDITOR */}
                  <div className="border-t border-line pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-ink">{isTr ? "Kişisel Projeler" : "Personal Projects"}</h3>
                      <Button variant="outline" size="sm" onClick={() => updateResume({ projects: [{ id: `proj-${Date.now()}`, title: "", description: "", url: "" }, ...(resume.projects || [])] })}><Plus className="h-3.5 w-3.5" /> {isTr ? "Proje Ekle" : "Add Project"}</Button>
                    </div>
                    <div className="space-y-4">
                      {resume.projects?.map((proj, index) => (
                        <div key={proj.id} className="border-b border-line pb-4 last:border-0 last:pb-0">
                          <div className="flex gap-2">
                            <div className="grid flex-1 gap-2">
                              <Input value={proj.title} onChange={(e) => { const projects = [...(resume.projects || [])]; projects[index] = { ...proj, title: e.target.value }; updateResume({ projects }); }} placeholder={isTr ? "Proje Başlığı" : "Project Title"} />
                              <Input value={proj.url} onChange={(e) => { const projects = [...(resume.projects || [])]; projects[index] = { ...proj, url: e.target.value }; updateResume({ projects }); }} placeholder={isTr ? "Proje Bağlantısı (URL)" : "Project URL"} />
                            </div>
                            <button type="button" onClick={() => updateResume({ projects: resume.projects?.filter((entry) => entry.id !== proj.id) })} className="grid h-11 w-11 place-items-center rounded-lg text-ink-3 hover:bg-[var(--negative-wash)] hover:text-negative"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                          <Textarea value={proj.description} onChange={(e) => { const projects = [...(resume.projects || [])]; projects[index] = { ...proj, description: e.target.value }; updateResume({ projects }); }} placeholder={isTr ? "Proje açıklaması..." : "Project description..."} className="mt-2 min-h-16 text-xs" />
                        </div>
                      ))}
                      {!resume.projects?.length && <EmptyEditor text={isTr ? "Henüz proje eklenmedi." : "No projects added yet."} />}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "skills" && (
                <div className="space-y-4">
                  <EditorHeading title={copy.skillEvidence} note={copy.skillNote} />
                  <div className="flex gap-2">
                    <Input value={skillDraft} onChange={(event) => setSkillDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { addSkills([skillDraft]); setSkillDraft(""); } }} placeholder={copy.newSkill} className="flex-1" />
                    <Button onClick={() => { addSkills([skillDraft]); setSkillDraft(""); }} variant="primary">{messages.common.add}</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {resume.skills.map((skill) => (
                      <span key={skill} className="inline-flex items-center gap-1 border border-line bg-surface-2 px-3 py-1 rounded-full text-xs">
                        {skill}
                        <button type="button" onClick={() => updateResume({ skills: resume.skills.filter((entry) => entry !== skill) })} className="text-ink-3 hover:text-negative"><Trash2 className="h-3 w-3" /></button>
                      </span>
                    ))}
                    {!resume.skills.length && <EmptyEditor text={isTr ? "Henüz yetenek eklenmedi." : "No skills added yet."} />}
                  </div>
                </div>
              )}

              {activeTab === "credentials" && (
                <div className="space-y-6">
                  {/* EDUCATION */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <EditorHeading title={copy.education} note={copy.educationNote} />
                      <Button variant="outline" size="sm" onClick={() => updateResume({ education: [{ id: `edu-${Date.now()}`, school: "", degree: "", year: "" }, ...resume.education] })}><Plus className="h-3.5 w-3.5" /> {messages.common.add}</Button>
                    </div>
                    <div className="space-y-4">
                      {resume.education.map((item, index) => (
                        <div key={item.id} className="flex gap-2 border-b border-line pb-4 last:border-0 last:pb-0">
                          <div className="grid flex-1 gap-2 sm:grid-cols-3">
                            <Input value={item.school} onChange={(event) => { const education = [...resume.education]; education[index] = { ...item, school: event.target.value }; updateResume({ education }); }} placeholder={copy.school} />
                            <Input value={item.degree} onChange={(event) => { const education = [...resume.education]; education[index] = { ...item, degree: event.target.value }; updateResume({ education }); }} placeholder={copy.degree} />
                            <Input value={item.year} onChange={(event) => { const education = [...resume.education]; education[index] = { ...item, year: event.target.value }; updateResume({ education }); }} placeholder="2024" />
                          </div>
                          <button type="button" onClick={() => updateResume({ education: resume.education.filter((entry) => entry.id !== item.id) })} className="grid h-11 w-11 shrink-0 place-items-center rounded-[var(--radius-control)] text-ink-3 hover:bg-[var(--negative-wash)] hover:text-negative"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* LANGUAGES SUB-EDITOR */}
                  <div className="border-t border-line pt-6 space-y-3">
                    <h3 className="text-xs font-bold text-ink">{isTr ? "Diller" : "Languages"}</h3>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <Input value={langDraft.name} onChange={(e) => setLangDraft({ ...langDraft, name: e.target.value })} placeholder={isTr ? "Dil (örn: İngilizce)" : "Language (e.g. English)"} />
                      <div className="flex gap-2 sm:col-span-2">
                        <Input value={langDraft.level} onChange={(e) => setLangDraft({ ...langDraft, level: e.target.value })} placeholder={isTr ? "Seviye (örn: İleri Seviye)" : "Level (e.g. Fluent)"} className="flex-1" />
                        <Button type="button" onClick={() => {
                          if (!langDraft.name || !langDraft.level) return;
                          updateResume({ languages: [...(resume.languages || []), { id: `lang-${Date.now()}`, ...langDraft }] });
                          setLangDraft({ name: "", level: "" });
                        }}>{isTr ? "Ekle" : "Add"}</Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {resume.languages?.map((lang) => (
                        <span key={lang.id} className="inline-flex items-center gap-1 border border-line bg-surface-2 px-3 py-1 rounded-full text-xs">
                          {lang.name} ({lang.level})
                          <button type="button" onClick={() => updateResume({ languages: resume.languages?.filter((item) => item.id !== lang.id) })} className="text-ink-3 hover:text-negative"><Trash2 className="h-3 w-3" /></button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CERTIFICATIONS */}
                  <div className="border-t border-line pt-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-ink">{isTr ? "Sertifikalar" : "Certifications"}</h3>
                      <Button variant="outline" size="sm" onClick={() => updateResume({ certifications: [...(resume.certifications || []), { id: `cert-${Date.now()}`, name: "", issuer: "", date: "" }] })}><Plus className="h-3.5 w-3.5" /> {isTr ? "Ekle" : "Add"}</Button>
                    </div>
                    {resume.certifications?.map((cert, index) => (
                      <div key={cert.id} className="flex gap-2 border-b border-line pb-4 last:border-0 last:pb-0">
                        <div className="grid flex-1 gap-2 sm:grid-cols-3">
                          <Input value={cert.name} onChange={(e) => { const certifications = [...(resume.certifications || [])]; certifications[index] = { ...cert, name: e.target.value }; updateResume({ certifications }); }} placeholder={isTr ? "Sertifika Adı" : "Cert Name"} />
                          <Input value={cert.issuer} onChange={(e) => { const certifications = [...(resume.certifications || [])]; certifications[index] = { ...cert, issuer: e.target.value }; updateResume({ certifications }); }} placeholder={isTr ? "Veren Kurum" : "Issuer"} />
                          <Input value={cert.date} onChange={(e) => { const certifications = [...(resume.certifications || [])]; certifications[index] = { ...cert, date: e.target.value }; updateResume({ certifications }); }} placeholder="2025" />
                        </div>
                        <button type="button" onClick={() => updateResume({ certifications: resume.certifications?.filter((entry) => entry.id !== cert.id) })} className="grid h-11 w-11 place-items-center rounded-lg text-ink-3 hover:bg-[var(--negative-wash)] hover:text-negative"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    ))}
                  </div>

                  {/* AWARDS */}
                  <div className="border-t border-line pt-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-ink">{isTr ? "Başarılar & Ödüller" : "Awards"}</h3>
                      <Button variant="outline" size="sm" onClick={() => updateResume({ awards: [...(resume.awards || []), { id: `aw-${Date.now()}`, title: "", issuer: "", date: "" }] })}><Plus className="h-3.5 w-3.5" /> {isTr ? "Ekle" : "Add"}</Button>
                    </div>
                    {resume.awards?.map((award, index) => (
                      <div key={award.id} className="flex gap-2 border-b border-line pb-4 last:border-0 last:pb-0">
                        <div className="grid flex-1 gap-2 sm:grid-cols-3">
                          <Input value={award.title} onChange={(e) => { const awards = [...(resume.awards || [])]; awards[index] = { ...award, title: e.target.value }; updateResume({ awards }); }} placeholder={isTr ? "Ödül Başlığı" : "Award Title"} />
                          <Input value={award.issuer} onChange={(e) => { const awards = [...(resume.awards || [])]; awards[index] = { ...award, issuer: e.target.value }; updateResume({ awards }); }} placeholder={isTr ? "Veren Kurum" : "Issuer"} />
                          <Input value={award.date} onChange={(e) => { const awards = [...(resume.awards || [])]; awards[index] = { ...award, date: e.target.value }; updateResume({ awards }); }} placeholder="2026" />
                        </div>
                        <button type="button" onClick={() => updateResume({ awards: resume.awards?.filter((entry) => entry.id !== award.id) })} className="grid h-11 w-11 place-items-center rounded-lg text-ink-3 hover:bg-[var(--negative-wash)] hover:text-negative"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "sections" && (
                <div className="space-y-6">
                  {/* Completeness score section */}
                  <div className="bg-surface-2 rounded-lg p-4 border border-line space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ink">{isTr ? "Özgeçmiş Tamamlanma Oranı" : "Resume Completeness"}</span>
                      <span className="text-sm font-extrabold text-brand-strong">{completenessScore}%</span>
                    </div>
                    <div className="h-2 w-full bg-surface-3 rounded-full overflow-hidden">
                      <div className="h-full bg-brand rounded-full transition-all duration-300" style={{ width: `${completenessScore}%` }} />
                    </div>
                    {/* Completeness Checklist */}
                    <div className="space-y-1.5 pt-2 border-t border-line text-[11px] text-ink-2">
                      <div className="flex items-center gap-1.5">
                        <span className={resume.fullName ? "text-positive" : "text-ink-3"}>{resume.fullName ? "✓" : "○"}</span>
                        <span>{isTr ? "Ad ve Başlık Alanı" : "Full name & Title"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={resume.summary ? "text-positive" : "text-ink-3"}>{resume.summary ? "✓" : "○"}</span>
                        <span>{isTr ? "Profil Özeti" : "Summary description"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={resume.skills.length >= 3 ? "text-positive" : "text-ink-3"}>{resume.skills.length >= 3 ? "✓" : "○"}</span>
                        <span>{isTr ? "En az 3 Yetenek" : "At least 3 skills"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={resume.experience.length >= 1 ? "text-positive" : "text-ink-3"}>{resume.experience.length >= 1 ? "✓" : "○"}</span>
                        <span>{isTr ? "En az 1 İş Deneyimi" : "At least 1 work role"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={resume.education.length >= 1 ? "text-positive" : "text-ink-3"}>{resume.education.length >= 1 ? "✓" : "○"}</span>
                        <span>{isTr ? "Eğitim Bilgisi" : "Education details"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Section Management: Ordering and Visibility */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-ink">{isTr ? "Bölüm Düzeni & Görünürlük" : "Section Ordering & Visibility"}</h3>
                    <div className="space-y-2">
                      {resumeSectionOrder.map((secId, index) => {
                        const isCustom = secId.startsWith("custom-");
                        const customSec = isCustom ? resume.customSections?.find(c => c.id === secId) : null;
                        const label = isCustom ? (customSec?.title || "Custom Section") : (
                          secId === "profile" ? (isTr ? "Kişisel Özet" : "Summary") :
                          secId === "experience" ? (isTr ? "Deneyimler" : "Experience") :
                          secId === "skills" ? (isTr ? "Yetenekler" : "Skills") :
                          secId === "education" ? (isTr ? "Eğitim" : "Education") :
                          secId === "projects" ? (isTr ? "Projeler" : "Projects") :
                          secId === "certifications" ? (isTr ? "Sertifikalar" : "Certifications") :
                          secId === "languages" ? (isTr ? "Diller" : "Languages") :
                          secId === "awards" ? (isTr ? "Ödüller" : "Awards") :
                          secId === "publications" ? (isTr ? "Yayınlar" : "Publications") :
                          (isTr ? "Sosyal Bağlantılar" : "Social Links")
                        );
                        
                        const isVisible = resume.sectionVisibility?.[secId] !== false;

                        return (
                          <div key={secId} className="flex items-center justify-between border border-line bg-surface p-2.5 rounded text-xs gap-3">
                            <span className="font-semibold text-ink truncate flex-1">{label}</span>
                            <div className="flex items-center gap-1">
                              {/* Move Up */}
                              <button
                                type="button"
                                disabled={index === 0}
                                onClick={() => moveResumeSection(secId, -1)}
                                className="p-1 rounded text-ink-3 hover:bg-surface-2 disabled:opacity-30"
                                aria-label="Move Up"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                              {/* Move Down */}
                              <button
                                type="button"
                                disabled={index === resumeSectionOrder.length - 1}
                                onClick={() => moveResumeSection(secId, 1)}
                                className="p-1 rounded text-ink-3 hover:bg-surface-2 disabled:opacity-30"
                                aria-label="Move Down"
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>
                              {/* Visibility toggle */}
                              <button
                                type="button"
                                onClick={() => toggleVisibility(secId)}
                                className="p-1 rounded text-ink-3 hover:bg-surface-2"
                                aria-label="Toggle Visibility"
                              >
                                {isVisible ? <EyeIcon className="h-3.5 w-3.5 text-brand" /> : <EyeOff className="h-3.5 w-3.5" />}
                              </button>
                              {/* Delete Custom Section */}
                              {isCustom && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCustomSection(secId)}
                                  className="p-1 rounded text-ink-3 hover:text-negative hover:bg-[var(--negative-wash)]"
                                  aria-label="Delete custom section"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Add Custom Section Form */}
                  <div className="border-t border-line pt-4 space-y-3">
                    <h3 className="text-xs font-bold text-ink">{isTr ? "Yeni Özel Bölüm Ekle" : "Add New Custom Section"}</h3>
                    <div className="flex gap-2">
                      <Input
                        value={newCustomSecTitle}
                        onChange={(e) => setNewCustomSecTitle(e.target.value)}
                        placeholder={isTr ? "örn: Gönüllülük, Referanslar" : "e.g. Volunteer Work, References"}
                        className="flex-1 text-xs"
                      />
                      <Button onClick={handleAddCustomSection} variant="outline" size="sm">
                        <Plus className="h-3.5 w-3.5" /> {isTr ? "Ekle" : "Add"}
                      </Button>
                    </div>
                  </div>

                  {/* Edit Custom Sections Content */}
                  {resume.customSections && resume.customSections.length > 0 && (
                    <div className="border-t border-line pt-4 space-y-4">
                      <h3 className="text-xs font-bold text-ink">{isTr ? "Özel Bölüm İçerikleri" : "Edit Custom Section Contents"}</h3>
                      <div className="space-y-4">
                        {resume.customSections.map((sec, index) => (
                          <div key={sec.id} className="space-y-2 border border-line bg-surface-2 p-3 rounded-lg">
                            <label className="block text-[11px] font-bold text-ink-2">{sec.title}</label>
                            <Textarea
                              value={sec.content}
                              onChange={(e) => {
                                const customSections = [...(resume.customSections || [])];
                                customSections[index] = { ...sec, content: e.target.value };
                                updateResume({ customSections });
                              }}
                              placeholder={isTr ? "Bölüm içeriğini girin..." : "Enter section content..."}
                              rows={4}
                              className="w-full bg-surface text-xs"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "styling" && (
                <div className="space-y-6">
                  {/* STYLE SETTINGS */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-ink flex items-center gap-1.5"><Palette className="h-4 w-4 text-brand-strong" /> {isTr ? "Tasarım Ayarları" : "Design Customization"}</h3>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <label className="block">
                        <span className="text-[10px] font-semibold text-ink-3 uppercase block mb-1.5">{isTr ? "Şablon" : "Template"}</span>
                        <select value={template} onChange={(e) => updateStyle({ template: e.target.value as any })} className="w-full bg-surface border border-line rounded px-2 py-1.5 text-xs">
                          <option value="classic">{isTr ? "Klasik" : "Classic"}</option>
                          <option value="modern">{isTr ? "Modern" : "Modern"}</option>
                          <option value="minimal">{isTr ? "Minimal" : "Minimal"}</option>
                        </select>
                      </label>
                      <label className="block">
                        <span className="text-[10px] font-semibold text-ink-3 uppercase block mb-1.5">{isTr ? "Yazı Tipi" : "Font Family"}</span>
                        <select value={resume.customization?.fontFamily || "sans"} onChange={(e) => updateStyle({ fontFamily: e.target.value })} className="w-full bg-surface border border-line rounded px-2 py-1.5 text-xs">
                          <option value="sans">Sans-Serif</option>
                          <option value="serif">Elegant Serif</option>
                          <option value="mono">Developer Mono</option>
                        </select>
                      </label>
                      <label className="block">
                        <span className="text-[10px] font-semibold text-ink-3 uppercase block mb-1.5">{isTr ? "Tema Rengi" : "Theme Color"}</span>
                        <select value={resume.customization?.primaryColor || "brand"} onChange={(e) => updateStyle({ primaryColor: e.target.value })} className="w-full bg-surface border border-line rounded px-2 py-1.5 text-xs">
                          <option value="brand">{isTr ? "CareerForge Moru" : "Brand Violet"}</option>
                          <option value="indigo">Indigo</option>
                          <option value="emerald">Emerald</option>
                          <option value="slate">Slate</option>
                        </select>
                      </label>
                    </div>
                  </div>

                  {/* VERSIONS / CV SÜRÜMLERİ */}
                  <div className="border-t border-line pt-6 space-y-4">
                    <h3 className="text-xs font-bold text-ink flex items-center gap-1.5"><Clock className="h-4 w-4 text-brand-strong" /> {isTr ? "CV Sürümleri" : "CV Versions & Backups"}</h3>
                    <div className="flex gap-2">
                      <Input value={versionLabel} onChange={(e) => setVersionLabel(e.target.value)} placeholder={isTr ? "örn: Senior Web Dev, İngilizce" : "e.g. Senior Web Dev"} className="flex-1 text-xs" />
                      <Button onClick={handleCreateVersion} variant="primary" className="flex items-center gap-1">
                        <Save className="h-3.5 w-3.5" />
                        {isTr ? "Kaydet" : "Save Version"}
                      </Button>
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {forgeBackups.map((backup) => (
                        <div key={backup.id} className="flex flex-col border border-line bg-surface p-3 rounded-lg text-xs space-y-3">
                          <div className="min-w-0 flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-ink truncate">{backup.label}</p>
                              <p className="text-[10px] text-ink-3 mt-0.5">{new Intl.DateTimeFormat(isTr ? "tr-TR" : "en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(backup.createdAt))}</p>
                            </div>
                            <Button size="icon" variant="ghost" className="hover:text-negative" onClick={() => deleteForgeBackup(backup.id)} aria-label="Delete backup">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            <Button size="sm" variant="ghost" onClick={() => { restoreForgeBackup(backup.id); toast.success(isTr ? "Sürüm geri yüklendi." : "Version restored."); }} className="text-[10px] h-7 px-2 border border-line">
                              {isTr ? "Yükle" : "Restore"}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleRenameBackup(backup.id)} className="text-[10px] h-7 px-2 border border-line">
                              <Edit2 className="h-3 w-3 mr-1" />
                              {isTr ? "Ad Değiştir" : "Rename"}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDuplicateBackup(backup.id)} className="text-[10px] h-7 px-2 border border-line">
                              <Copy className="h-3 w-3 mr-1" />
                              {isTr ? "Çoğalt" : "Duplicate"}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setCompareBackup(backup)} className="text-[10px] h-7 px-2 border border-line text-brand-strong">
                              {isTr ? "Karşılaştır" : "Compare"}
                            </Button>
                          </div>
                        </div>
                      ))}
                      {!forgeBackups.length && <p className="text-xs text-ink-3 text-center py-4">{isTr ? "Kayıtlı sürüm bulunamadı." : "No saved versions found."}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
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

        {/* Comparative Version Viewer Modal */}
        {compareBackup && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-sm px-4 overflow-y-auto py-8" role="dialog">
            <div className="w-full max-w-4xl rounded-xl border border-line bg-surface p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto text-xs">
              <div className="flex justify-between items-center border-b border-line pb-3">
                <h3 className="text-sm font-bold text-ink">
                  {isTr ? `Mevcut Sürüm vs "${compareBackup.label}" Karşılaştırması` : `Current Version vs "${compareBackup.label}"`}
                </h3>
                <Button variant="outline" size="sm" onClick={() => setCompareBackup(null)}>
                  {isTr ? "Kapat" : "Close"}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Left Side: Current */}
                <div className="space-y-4">
                  <h4 className="font-bold text-brand-strong uppercase border-b pb-1.5">{isTr ? "Mevcut Sürüm" : "Current Workspace"}</h4>
                  <div>
                    <strong className="block text-ink-3">{isTr ? "Başlık" : "Headline"}</strong>
                    <p className="text-ink text-sm font-semibold">{resume.fullName || "—"}</p>
                    <p className="text-ink-2 mt-0.5">{resume.headline || "—"}</p>
                  </div>
                  <div>
                    <strong className="block text-ink-3">{isTr ? "Kişisel Özet" : "Summary"}</strong>
                    <p className="text-ink-2 whitespace-pre-wrap leading-relaxed bg-surface-2 p-2 rounded border border-line">{resume.summary || "—"}</p>
                  </div>
                  <div>
                    <strong className="block text-ink-3">{isTr ? "Yetenekler" : "Skills"}</strong>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {resume.skills.map(s => <span key={s} className="px-2 py-0.5 bg-surface-3 rounded text-ink text-[10px]">{s}</span>)}
                    </div>
                  </div>
                </div>

                {/* Right Side: Selected Backup */}
                <div className="space-y-4 border-l border-line pl-6">
                  <h4 className="font-bold text-indigo-600 uppercase border-b pb-1.5">{compareBackup.label}</h4>
                  <div>
                    <strong className="block text-ink-3">{isTr ? "Başlık" : "Headline"}</strong>
                    <p className="text-ink text-sm font-semibold">{compareBackup.parsed?.name || "—"}</p>
                    <p className="text-ink-2 mt-0.5">{compareBackup.parsed?.title || "—"}</p>
                  </div>
                  <div>
                    <strong className="block text-ink-3">{isTr ? "Kişisel Özet" : "Summary"}</strong>
                    <p className="text-ink-2 whitespace-pre-wrap leading-relaxed bg-surface-2 p-2 rounded border border-line">{compareBackup.parsed?.summary || "—"}</p>
                  </div>
                  <div>
                    <strong className="block text-ink-3">{isTr ? "Yetenekler" : "Skills"}</strong>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {compareBackup.parsed?.skills.map(s => <span key={s} className="px-2 py-0.5 bg-surface-3 rounded text-ink text-[10px]">{s}</span>)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-line">
                <Button variant="outline" onClick={() => setCompareBackup(null)}>
                  {isTr ? "Geri" : "Back"}
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    restoreForgeBackup(compareBackup.id);
                    toast.success(isTr ? "Sürüm geri yüklendi." : "Version restored.");
                    setCompareBackup(null);
                  }}
                >
                  {isTr ? "Bu Sürümü Yükle" : "Restore this Version"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <main className="product-page">
      <header className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center border-b border-line pb-6">
        <div>
          <h1 className="page-title">{copy.title}</h1>
          <p className="page-subtitle mt-2">{copy.lede}</p>
        </div>
        {hasContent && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setShowImport((value) => !value)}><Plus className="h-4 w-4" /> {copy.import}</Button>
            <Button
              variant="primary"
              disabled={!hasContent}
              onClick={async () => {
                await exportCvAsPdf(resume);
                toast.success(messages.header.pdfReady);
              }}
            >
              <Download className="h-4 w-4" /> {copy.download}
            </Button>
          </div>
        )}
      </header>

      {renderContent()}
    </main>
  );
}

function ResumeBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mt-7"><h3 className="mb-3 text-[0.6875rem] font-bold text-[var(--paper-muted)] tracking-wider">{title.toUpperCase()}</h3>{children}</section>;
}

function EditorHeading({ title, note }: { title: string; note: string }) {
  return <div><h2 className="text-sm font-semibold text-ink">{title}</h2><p className="mt-1 text-[0.6875rem] leading-5 text-ink-3">{note}</p></div>;
}

function EmptyEditor({ text }: { text: string }) {
  return <p className="text-xs text-ink-3 text-center py-4">{text}</p>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><label className="text-[10px] font-semibold text-ink-3 uppercase">{label}</label>{children}</div>;
}
