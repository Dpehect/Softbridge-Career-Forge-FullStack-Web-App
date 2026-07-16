"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Download, Plus, Trash2, RotateCcw, FileText, Camera, Code2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FilePickButton } from "@/components/FilePickButton";
import { CvFeedbackPanel } from "@/components/CvFeedbackPanel";
import { CvWizard } from "@/components/CvWizard";
import { useCareerStore } from "@/store/useCareerStore";
import {
  parseCV,
  cleanExtractedText,
  looksLikeRawPdf,
  generateCvFeedback,
  exportCvAsPdf,
  type ParsedCV,
} from "@/lib/forge";
import type { ResumeProfile } from "@/types";
import { useTranslation } from "@/lib/forge/i18n";

function parsedToResume(cv: ParsedCV): ResumeProfile {
  return {
    fullName: cv.name === "Candidate" || cv.name === "Aday" ? "" : cv.name,
    headline: cv.title,
    email: cv.email,
    location: cv.location || "",
    summary: cv.summary || "",
    skills: cv.skills,
    photoDataUrl: cv.photoDataUrl || null,
    experience: cv.experience.map((e, i) => ({
      id: `exp-${Date.now()}-${i}`,
      role: e.position,
      company: e.company,
      start: e.duration.split(/[–-]/)[0]?.trim() || "",
      end: e.duration.split(/[–-]/)[1]?.trim() || "",
      highlights: e.description,
    })),
    education: cv.education.map((e, i) => ({
      id: `edu-${Date.now()}-${i}`,
      school: e.school,
      degree: e.degree,
      year: e.year,
    })),
  };
}

function resumeToParsed(resume: ResumeProfile): ParsedCV {
  return {
    name: resume.fullName || "Candidate",
    title: resume.headline || "Professional",
    email: resume.email,
    phone: null,
    location: resume.location || null,
    summary: resume.summary || null,
    skills: resume.skills,
    photoDataUrl: resume.photoDataUrl || null,
    experience: resume.experience.map((e) => ({
      company: e.company,
      position: e.role,
      duration: [e.start, e.end].filter(Boolean).join(" – ") || "—",
      description: e.highlights,
    })),
    education: resume.education.map((e) => ({
      school: e.school,
      degree: e.degree,
      year: e.year,
    })),
    rawLength: 0,
  };
}

export default function ResumePage() {
  const { resume, updateResume, setResume, resetResume, pushForgeHistory } = useCareerStore();
  const { t, lang } = useTranslation();

  const [skillDraft, setSkillDraft] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [banner, setBanner] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  const hasContent =
    Boolean(resume.fullName || resume.headline || resume.summary || resume.skills.length) ||
    resume.experience.length > 0;

  const feedback = useMemo(() => {
    if (!hasContent || !showFeedback) return null;
    return generateCvFeedback(resumeToParsed(resume));
  }, [resume, hasContent, showFeedback]);

  const applyParsed = (cv: ParsedCV, source: string) => {
    setResume(parsedToResume(cv));
    setShowFeedback(true);
    const msg = t("readyMsg");
    setBanner(msg);
    pushForgeHistory({
      action: "parse",
      summary: `Resume: ${cv.name} (${source})`,
      payload: cv,
    });
    toast.success(msg);
  };

  const onFileText = (text: string, fileName: string) => {
    const cleaned = cleanExtractedText(text);
    if (!cleaned.trim() || looksLikeRawPdf(cleaned) || looksLikeRawPdf(text)) {
      toast.error(
        lang === "tr" 
          ? "Bu PDF taranmış görünüyor. Lütfen aranabilir metin olarak dışa aktarın veya manuel yapıştırın."
          : "This PDF appears to be scanned. Please export as searchable text or paste manually."
      );
      return;
    }
    try {
      const cv = parseCV(cleaned);
      applyParsed(cv, fileName);
      setPasteText(cleaned);
    } catch {
      toast.error(lang === "tr" ? "CV yapısı çözümlenemedi. Düz metin olarak yapıştırmayı deneyin." : "Could not structure this CV. Paste plain text and try again.");
    }
  };

  const onParsePaste = () => {
    const cleaned = cleanExtractedText(pasteText);
    if (!cleaned.trim()) {
      toast.error(lang === "tr" ? "Önce CV metnini yapıştırın veya dosya yükleyin." : "Paste CV text first, or upload a PDF/TXT file.");
      return;
    }
    if (looksLikeRawPdf(cleaned)) {
      toast.error(
        lang === "tr"
          ? "Bu ham PDF kodu gibi görünüyor. Dosya yükleme butonunu kullanın veya düz metin yapıştırın."
          : "This looks like raw PDF code. Upload the file with Choose CV, or paste readable text."
      );
      return;
    }
    try {
      applyParsed(parseCV(cleaned), "paste");
    } catch {
      toast.error(lang === "tr" ? "Metin çözümlenemedi." : "Could not structure this CV text.");
    }
  };

  const onClear = () => {
    resetResume();
    setPasteText("");
    setBanner(null);
    setShowFeedback(false);
    setSkillDraft("");
    toast.message(t("clearSuccess"));
  };

  const addSkill = () => {
    const s = skillDraft.trim();
    if (!s || resume.skills.includes(s)) return;
    updateResume({ skills: [...resume.skills, s] });
    setSkillDraft("");
  };

  const refreshFeedback = () => {
    if (!hasContent) {
      toast.error(lang === "tr" ? "Önce bir CV yükleyin." : "Add or upload a CV first.");
      return;
    }
    setShowFeedback(true);
    toast.success(lang === "tr" ? "Analiz güncellendi." : "Feedback updated from your current CV.");
  };

  return (
    <div className="px-4 md:px-8 pb-20 pt-6">
      <div className="max-w-6xl mx-auto">
        <Badge variant="accent" className="mb-3">
          {t("navResume")}
        </Badge>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-star-white">
              {lang === "tr" ? "Özgeçmiş Düzenleme Alanı" : "Your CV workspace"}
            </h1>
            <p className="text-muted-steel mt-2 max-w-xl leading-relaxed text-sm">
              {lang === "tr" 
                ? "PDF/TXT yükleyin veya metin yapıştırın, şablonu doldurun ve mülakata hazır hale getirin."
                : "Upload PDF/TXT or paste text, edit a clean structure, get a professional review, and export a polished PDF."
              }
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={refreshFeedback} disabled={!hasContent} className="text-star-white">
              <FileText className="w-4 h-4 mr-1.5" /> {lang === "tr" ? "Analiz Et" : "Review CV"}
            </Button>
            <Button
              variant="outline"
              disabled={!hasContent}
              className="text-star-white"
              onClick={async () => {
                await exportCvAsPdf(resumeToParsed(resume));
                toast.success(t("exportSuccess"));
              }}
            >
              <Download className="w-4 h-4 mr-1.5" /> {t("exportPdf")}
            </Button>
            <Button variant="ghost" onClick={onClear} className="text-sunset-coral">
              <RotateCcw className="w-4 h-4 mr-1.5" /> {t("clearCv")}
            </Button>
          </div>
        </div>

        {/* CV Builder options */}
        {showWizard ? (
          <div className="glass-panel rounded-2xl p-5 mb-6 space-y-4 border border-cosmic-teal/20 relative">
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-star-white"
                onClick={() => setShowWizard(false)}
              >
                ✕ {lang === "tr" ? "Sihirbazı Kapat" : "Cancel Wizard"}
              </Button>
            </div>
            <CvWizard
              onComplete={(cv) => {
                applyParsed(cv, "Wizard");
                setShowWizard(false);
              }}
            />
          </div>
        ) : (
          <div className="glass-panel rounded-2xl p-5 mb-6 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <FilePickButton
                label={t("uploadBtn")}
                variant="accent"
                size="default"
                silentSuccess
                onText={(text, name) => onFileText(text, name)}
              />
              <Button variant="outline" onClick={() => setShowWizard(true)} className="text-star-white">
                {t("buildScratch")}
              </Button>
              <Button variant="soft" onClick={onParsePaste} disabled={!pasteText.trim()}>
                {t("analyzePasteBtn")}
              </Button>
              <Button variant="ghost" onClick={onClear} className="text-sunset-coral">
                <RotateCcw className="w-4 h-4 mr-1.5" /> {t("clearCv")}
              </Button>
            </div>
            <p className="text-[11px] text-muted-steel leading-relaxed">
              <strong>{lang === "tr" ? "Özgeçmiş Metni Yapıştırın" : "Paste CV Text"}</strong> {lang === "tr" ? "veya dosya yükleyin. Taranmış PDF'leri lütfen metin olarak aktarıp yapıştırın." : "below, or upload PDF/TXT."}
            </p>
            <Textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={t("pasteTitle") + "..."}
              className="min-h-[110px] font-mono text-xs text-star-white"
            />
            {banner && (
              <div className="rounded-xl border border-cosmic-teal/25 bg-cosmic-teal/10 px-4 py-3 text-star-white">
                <p className="text-sm font-semibold">{banner}</p>
                <p className="text-xs text-muted-steel mt-1">
                  {lang === "tr" ? "Ayrıştırılan alanlar ve yapay zeka geri bildirimleri aşağıdadır." : "Structured fields and deep feedback are below."}
                </p>
              </div>
            )}
          </div>
        )}

        {feedback && (
          <div className="mb-6">
            <CvFeedbackPanel feedback={feedback} />
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-5">
            <section className="glass-panel rounded-2xl p-5 space-y-3">
              <h2 className="font-semibold text-xs uppercase tracking-wider text-cosmic-teal">
                {t("personalInfo")}
              </h2>
              <div className="flex items-center gap-4 p-3 bg-panel-elevated/40 rounded-xl border border-black/5">
                <div className="w-16 h-16 rounded-full border bg-abyss-panel overflow-hidden flex items-center justify-center shrink-0 relative group">
                  {resume.photoDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={resume.photoDataUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-6 h-6 text-muted-steel" />
                  )}
                </div>
                <div className="flex flex-col gap-1.5 w-full">
                  <span className="text-xs font-semibold text-muted-steel uppercase tracking-wider">Profile Photo</span>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      id="profile-photo-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            updateResume({ photoDataUrl: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      type="button"
                      className="text-star-white"
                      onClick={() => document.getElementById("profile-photo-upload")?.click()}
                    >
                      <Camera className="w-3.5 h-3.5 mr-1.5" /> Upload Photo
                    </Button>
                    {resume.photoDataUrl && (
                      <Button
                        size="sm"
                        variant="ghost"
                        type="button"
                        className="text-sunset-coral hover:text-sunset-coral/80"
                        onClick={() => updateResume({ photoDataUrl: null })}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <Input
                value={resume.fullName}
                onChange={(e) => updateResume({ fullName: e.target.value })}
                placeholder="Full name"
                className="text-star-white"
              />
              <Input
                value={resume.headline}
                onChange={(e) => updateResume({ headline: e.target.value })}
                placeholder="Headline / target title"
                className="text-star-white"
              />
              <div className="grid sm:grid-cols-2 gap-3">
                <Input
                  value={resume.email}
                  onChange={(e) => updateResume({ email: e.target.value })}
                  placeholder="Email"
                  className="text-star-white"
                />
                <Input
                  value={resume.location}
                  onChange={(e) => updateResume({ location: e.target.value })}
                  placeholder="Location"
                  className="text-star-white"
                />
              </div>
              <Textarea
                value={resume.summary}
                onChange={(e) => updateResume({ summary: e.target.value })}
                placeholder="Professional summary"
                className="min-h-[110px] text-star-white"
              />
            </section>

            <section className="glass-panel rounded-2xl p-5 space-y-3">
              <h2 className="font-semibold text-xs uppercase tracking-wider text-cosmic-teal">
                {t("skills")}
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {resume.skills.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() =>
                      updateResume({ skills: resume.skills.filter((x) => x !== s) })
                    }
                    className="group"
                  >
                    <Badge
                      variant="soft"
                      className="cursor-pointer group-hover:border-sunset-coral/30"
                    >
                      {s} ×
                    </Badge>
                  </button>
                ))}
                {!resume.skills.length && (
                  <span className="text-sm text-muted-steel">No skills yet</span>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={skillDraft}
                  onChange={(e) => setSkillDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  placeholder="Add a skill"
                  className="text-star-white"
                />
                <Button variant="soft" onClick={addSkill}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </section>

            <section className="glass-panel rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-xs uppercase tracking-wider text-cosmic-teal">
                  {t("experience")}
                </h2>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-star-white"
                  onClick={() =>
                    setResume({
                      ...resume,
                      experience: [
                        {
                          id: `exp-${Date.now()}`,
                          role: "",
                          company: "",
                          start: "",
                          end: "",
                          highlights: [],
                        },
                        ...resume.experience,
                      ],
                    })
                  }
                >
                  <Plus className="w-4 h-4 mr-1" /> {lang === "tr" ? "Ekle" : "Add"}
                </Button>
              </div>
              {!resume.experience.length && (
                <p className="text-sm text-muted-steel">
                  No roles yet — upload a CV or add experience manually.
                </p>
              )}
              {resume.experience.map((exp, idx) => (
                <div
                  key={exp.id}
                  className="rounded-xl border border-black/5 p-3 space-y-2 bg-panel-elevated/50"
                >
                  <div className="flex justify-between gap-2">
                    <Input
                      value={exp.role}
                      onChange={(e) => {
                        const experience = [...resume.experience];
                        experience[idx] = { ...exp, role: e.target.value };
                        setResume({ ...resume, experience });
                      }}
                      placeholder="Role"
                      className="text-star-white"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-sunset-coral"
                      onClick={() =>
                        setResume({
                          ...resume,
                          experience: resume.experience.filter((x) => x.id !== exp.id),
                        })
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <Input
                    value={exp.company}
                    onChange={(e) => {
                      const experience = [...resume.experience];
                      experience[idx] = { ...exp, company: e.target.value };
                      setResume({ ...resume, experience });
                    }}
                    placeholder="Company"
                    className="text-star-white"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={exp.start}
                      onChange={(e) => {
                        const experience = [...resume.experience];
                        experience[idx] = { ...exp, start: e.target.value };
                        setResume({ ...resume, experience });
                      }}
                      placeholder="Start"
                      className="text-star-white"
                    />
                    <Input
                      value={exp.end}
                      onChange={(e) => {
                        const experience = [...resume.experience];
                        experience[idx] = { ...exp, end: e.target.value };
                        setResume({ ...resume, experience });
                      }}
                      placeholder="End"
                      className="text-star-white"
                    />
                  </div>
                  <Textarea
                    value={exp.highlights.join("\n")}
                    onChange={(e) => {
                      const experience = [...resume.experience];
                      experience[idx] = {
                        ...exp,
                        highlights: e.target.value.split("\n").filter(Boolean),
                      };
                      setResume({ ...resume, experience });
                    }}
                    placeholder="One highlight per line"
                    className="min-h-[90px] text-star-white"
                  />
                </div>
              ))}
            </section>
          </div>

          {/* Preview */}
          <div className="lg:sticky lg:top-24 h-fit space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-sm p-6 md:p-8 text-left leading-relaxed">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cosmic-teal mb-4">
                {lang === "tr" ? "Önizleme" : "Preview"}
              </p>
              {!hasContent ? (
                <p className="text-sm text-muted-steel leading-relaxed">
                  {lang === "tr" ? "Şablonu doldurdukça özgeçmişinizin canlı önizlemesi burada görünecektir." : "Your structured CV will appear here after you fill the form or upload a file."}
                </p>
              ) : (
                <>
                  <div className="flex justify-between items-center border-b pb-4 mb-4">
                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                        {resume.fullName || "Your name"}
                      </h2>
                      <p className="text-sm text-sky-600 font-medium mt-1">{resume.headline}</p>
                      <p className="text-xs text-slate-500 mt-2">
                        {[resume.email, resume.location].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    {resume.photoDataUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={resume.photoDataUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover border" />
                    )}
                  </div>
                  {resume.summary && (
                    <div className="mb-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white border-l-4 border-sky-500 pl-2 mb-2">Summary</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 text-justify">{resume.summary}</p>
                    </div>
                  )}
                  {resume.skills.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white border-l-4 border-sky-500 pl-2 mb-2">
                        Skills
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        {resume.skills.map((s) => (
                          <span key={s} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[10px] font-medium border dark:border-slate-700">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {resume.experience.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white border-l-4 border-sky-500 pl-2 mb-3">
                        Experience
                      </h3>
                      <div className="space-y-4">
                        {resume.experience.map((exp) => (
                          <div key={exp.id} className="text-xs">
                            <div className="flex justify-between gap-3 font-semibold text-slate-800 dark:text-slate-200">
                              <span>
                                {exp.role}
                                <span className="font-normal text-slate-500"> · {exp.company}</span>
                              </span>
                              <span className="font-normal text-slate-400 shrink-0">
                                {exp.start} – {exp.end}
                              </span>
                            </div>
                            <ul className="mt-1.5 space-y-0.5 list-disc list-inside pl-2 text-slate-500 dark:text-slate-400">
                              {exp.highlights.map((h) => (
                                <li key={h}>{h}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {resume.education.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white border-l-4 border-sky-500 pl-2 mb-2">
                        Education
                      </h3>
                      <div className="space-y-2">
                        {resume.education.map((edu) => (
                          <div key={edu.id} className="text-xs flex justify-between font-semibold text-slate-800 dark:text-slate-200">
                            <span>
                              {edu.school}
                              <span className="font-normal text-slate-500"> — {edu.degree}</span>
                            </span>
                            <span className="font-normal text-slate-400">{edu.year}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            {hasContent && (
              <Button className="w-full" variant="soft" onClick={refreshFeedback}>
                {lang === "tr" ? "Analizi Yenile" : "Refresh professional feedback"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
