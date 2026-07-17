"use client";

import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Download,
  Plus,
  Trash2,
  RotateCcw,
  FileText,
  Camera,
  Sparkles,
  Check,
  Mail,
  MapPin,
  AlertTriangle,
  ChevronRight,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FilePickButton } from "@/components/FilePickButton";
import { CvFeedbackPanel } from "@/components/CvFeedbackPanel";
import { CvWizard } from "@/components/CvWizard";
import { AtsProgressBar } from "@/components/AtsProgressBar";
import { useCareerStore } from "@/store/useCareerStore";
import {
  parseCV,
  cleanExtractedText,
  looksLikeRawPdf,
  generateCvFeedback,
  exportCvAsPdf,
  buildJourneyInsight,
  type ParsedCV,
} from "@/lib/forge";
import type { ResumeProfile } from "@/types";
import { useTranslation } from "@/lib/forge/i18n";

function parsedToResume(cv: ParsedCV): ResumeProfile {
  return {
    fullName: cv.name === "Candidate" || cv.name === "Aday" ? "" : cv.name,
    headline: cv.title || "",
    email: cv.email || "",
    location: cv.location || "",
    summary: cv.summary || "",
    skills: cv.skills || [],
    photoDataUrl: cv.photoDataUrl || null,
    experience: (cv.experience || []).map((e, i) => ({
      id: `exp-${Date.now()}-${i}`,
      role: e.position,
      company: e.company,
      start: e.duration.split(/[–-]/)[0]?.trim() || "",
      end: e.duration.split(/[–-]/)[1]?.trim() || "",
      highlights: e.description,
    })),
    education: (cv.education || []).map((e, i) => ({
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
  const {
    resume,
    updateResume,
    setResume,
    resetResume,
    pushForgeHistory,
    forgeParsedCv,
    careerGoalId,
    addSkills,
    lastAnalysisMeta,
  } = useCareerStore();
  const { t } = useTranslation();

  const [mounted, setMounted] = useState(false);
  const [skillDraft, setSkillDraft] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [banner, setBanner] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (forgeParsedCv || lastAnalysisMeta) {
      setShowFeedback(true);
      setBanner("Özgeçmiş analiziniz yüklendi. Eksik yetenekleri tek tıkla tamamlayabilirsiniz.");
    }
  }, [forgeParsedCv, lastAnalysisMeta]);

  const hasContent =
    Boolean(resume.fullName || resume.headline || resume.summary || resume.skills.length) ||
    resume.experience.length > 0;

  const feedback = useMemo(() => {
    if (!hasContent || !showFeedback) return null;
    return generateCvFeedback(resumeToParsed(resume));
  }, [resume, hasContent, showFeedback]);

  const journey = useMemo(() => {
    return buildJourneyInsight({
      cv: forgeParsedCv || (hasContent ? resumeToParsed(resume) : null),
      goalId: careerGoalId,
      feedback,
    });
  }, [forgeParsedCv, hasContent, resume, careerGoalId, feedback]);

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin border-purple-600" />
      </div>
    );
  }

  const applyParsed = (cv: ParsedCV, source: string) => {
    setResume(parsedToResume(cv));
    setShowFeedback(true);
    const msg = t("readyMsg");
    setBanner(msg);
    pushForgeHistory({
      action: "parse",
      summary: `Düzenleyici: ${cv.name} (${source})`,
      payload: cv,
    });
    toast.success(msg);
  };

  const onFileText = (text: string, fileName: string) => {
    const cleaned = cleanExtractedText(text);
    if (!cleaned.trim() || looksLikeRawPdf(cleaned) || looksLikeRawPdf(text)) {
      toast.error("Okunabilir metin bulunamadı. Lütfen metin içeren PDF veya TXT yükleyin.");
      return;
    }
    try {
      const cv = parseCV(cleaned);
      applyParsed(cv, fileName);
      setPasteText(cleaned);
    } catch {
      toast.error("CV yapısı çözümlenemedi. Düz metin olarak yapıştırmayı deneyin.");
    }
  };

  const onParsePaste = () => {
    const cleaned = cleanExtractedText(pasteText);
    if (!cleaned.trim()) {
      toast.error("Önce metin yapıştırın.");
      return;
    }
    try {
      applyParsed(parseCV(cleaned), "yapıştırılan metin");
    } catch {
      toast.error("Metin çözümlenemedi.");
    }
  };

  const onClear = () => {
    resetResume();
    setPasteText("");
    setBanner(null);
    setShowFeedback(false);
    setSkillDraft("");
    toast.success("Düzenleyici sıfırlandı.");
  };

  const addSkill = () => {
    const s = skillDraft.trim();
    if (!s || resume.skills.includes(s)) return;
    updateResume({ skills: [...resume.skills, s] });
    setSkillDraft("");
  };

  const refreshFeedback = () => {
    if (!hasContent) {
      toast.error("Önce özgeçmiş yükleyin.");
      return;
    }
    setShowFeedback(true);
    toast.success("Skor ve geri bildirim güncellendi.");
  };

  const applySuggestedSkills = () => {
    const n = addSkills(journey.missingSkills.slice(0, 3));
    if (n === 0) toast.info("Önerilen yetenekler zaten ekli.");
    else toast.success(`${n} yeni yetenek eklendi.`);
    setShowFeedback(true);
  };

  return (
    <div className="px-4 md:px-8 pb-20 pt-6">
      <div className="max-w-7xl mx-auto space-y-6 text-left">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-500/10 dark:text-purple-300">
              <FileText className="w-3.5 h-3.5" />
              {t("navResume")}
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Özgeçmiş Düzenleyici
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-xl leading-relaxed">
              Özgeçmişinizi canlı olarak güncelleyin, eksik yetkinlikleri tek tıkla ekleyin ve A4 standartlarında PDF indirin.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button variant="primary" onClick={refreshFeedback} disabled={!hasContent} className="shadow-md">
              Analizi Yenile
            </Button>
            <Button
              variant="outline"
              className="text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800"
              disabled={!hasContent}
              onClick={async () => {
                await exportCvAsPdf(resumeToParsed(resume));
                toast.success("ATS Uyumlu PDF indirildi!");
              }}
            >
              <Download className="w-4 h-4 mr-1.5" /> PDF İndir
            </Button>
            <Button variant="ghost" onClick={onClear} className="text-rose-500 hover:bg-rose-500/5">
              Sıfırla
            </Button>
          </div>
        </div>

        {/* ATS Real-time Score Alert */}
        {hasContent && (
          <section className="glass-panel rounded-3xl p-5 space-y-4 border border-purple-200/50 dark:border-purple-500/10">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-[#C084FC]">
                  Anlık ATS Uyum Analizi
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Hedef rolünüz olan <strong>{lastAnalysisMeta?.targetTitle || resume.headline || "Seçilen Rol"}</strong> için anlık skorunuz: <strong className="text-purple-600 dark:text-[#C084FC]">%{journey.atsScore}</strong>. 
                  {journey.missingSkills.length > 0 && " Aşağıdaki eksik yetenekleri ekleyerek bu skoru hemen artırabilirsiniz."}
                </p>
              </div>
            </div>
            
            <AtsProgressBar score={journey.atsScore} label="Canlı ATS Skoru" />

            {journey.missingSkills.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t dark:border-white/5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 mr-1">
                  Hızlı Ekle:
                </span>
                {journey.missingSkills.slice(0, 4).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      const n = addSkills([s]);
                      if (n) toast.success(`“${s}” özgeçmiş yeteneklerine eklendi.`);
                    }}
                    className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-white dark:bg-slate-900 px-3 py-1 text-xs font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {s}
                  </button>
                ))}
                <Button
                  variant="primary"
                  size="sm"
                  className="shadow-sm ml-auto"
                  onClick={applySuggestedSkills}
                >
                  Önerilen 3 Yeteneği Ekle
                </Button>
              </div>
            )}
          </section>
        )}

        {/* CV Upload Option Drawer */}
        {showWizard ? (
          <div className="glass-panel rounded-3xl p-5 border border-purple-500/10 relative">
            <div className="absolute top-4 right-4 z-10">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-slate-500 hover:text-slate-900"
                onClick={() => setShowWizard(false)}
              >
                ✕ Sihirbazı Kapat
              </Button>
            </div>
            <CvWizard
              onComplete={(cv) => {
                applyParsed(cv, "Sihirbaz");
                setShowWizard(false);
              }}
            />
          </div>
        ) : (
          <div className="glass-panel rounded-3xl p-5 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <FilePickButton
                label="Özgeçmiş Belgesi Yükle"
                variant="accent"
                size="default"
                silentSuccess
                onText={(text, name) => onFileText(text, name)}
              />
              <Button
                variant="outline"
                className="text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-850"
                onClick={() => setShowWizard(true)}
              >
                Sıfırdan CV Oluştur
              </Button>
              <Button
                variant="outline"
                className="text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-850"
                onClick={onParsePaste}
                disabled={!pasteText.trim()}
              >
                Metni Çözümle
              </Button>
            </div>
            <Textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Özgeçmiş metnini kopyalayıp buraya yapıştırabilirsiniz..."
              className="min-h-[100px] font-mono text-xs text-slate-800 dark:text-slate-200"
            />
          </div>
        )}

        {/* Feedback Panel */}
        {feedback && (
          <section className="glass-panel rounded-3xl p-1">
            <CvFeedbackPanel feedback={feedback} />
          </section>
        )}

        {/* Split Editor / Preview view */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Column: Form Editor */}
          <div className="space-y-6">
            
            {/* Personal Details */}
            <section className="glass-panel rounded-3xl p-6 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-purple-700 dark:text-[#C084FC]">
                Kişisel Bilgiler
              </h3>
              
              <div className="flex items-center gap-4 p-4 bg-slate-100/50 dark:bg-white/[0.01] border dark:border-white/5 rounded-2xl">
                <div className="w-16 h-16 rounded-full border bg-slate-200 overflow-hidden flex items-center justify-center shrink-0 relative group dark:bg-slate-950 dark:border-white/5">
                  {resume.photoDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={resume.photoDataUrl} alt="Profil" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-5 h-5 text-slate-400" />
                  )}
                  <input
                    type="file"
                    id="resume-photo-uploader"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => updateResume({ photoDataUrl: reader.result as string });
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Profil Fotoğrafı</h4>
                  <p className="text-[10px] text-slate-500">Değiştirmek veya eklemek için daireye tıklayın.</p>
                  {resume.photoDataUrl && (
                    <button
                      type="button"
                      onClick={() => updateResume({ photoDataUrl: null })}
                      className="text-[10px] font-bold text-rose-500 hover:underline cursor-pointer"
                    >
                      Fotoğrafı Kaldır
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Input
                  value={resume.fullName}
                  onChange={(e) => updateResume({ fullName: e.target.value })}
                  placeholder="Ad Soyad"
                />
                <Input
                  value={resume.headline}
                  onChange={(e) => updateResume({ headline: e.target.value })}
                  placeholder="Başlık (Örn. Senior Frontend Engineer)"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={resume.email}
                    onChange={(e) => updateResume({ email: e.target.value })}
                    placeholder="E-posta"
                  />
                  <Input
                    value={resume.location}
                    onChange={(e) => updateResume({ location: e.target.value })}
                    placeholder="Lokasyon (Örn. İstanbul, Türkiye)"
                  />
                </div>
                <Textarea
                  value={resume.summary}
                  onChange={(e) => updateResume({ summary: e.target.value })}
                  placeholder="Kariyer Özeti / Ön Yazı..."
                  className="min-h-[100px]"
                />
              </div>
            </section>

            {/* Skills Details */}
            <section className="glass-panel rounded-3xl p-6 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-purple-700 dark:text-[#C084FC]">
                Teknik ve Sosyal Beceriler
              </h3>
              
              <div className="flex flex-wrap gap-1.5">
                {resume.skills.map((s) => (
                  <Badge
                    key={s}
                    variant="soft"
                    className="gap-1 cursor-pointer hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20"
                    onClick={() => updateResume({ skills: resume.skills.filter((x) => x !== s) })}
                  >
                    {s} ✕
                  </Badge>
                ))}
                {resume.skills.length === 0 && (
                  <span className="text-xs text-slate-500">Henüz yetenek eklenmedi.</span>
                )}
              </div>

              <div className="flex gap-2">
                <Input
                  value={skillDraft}
                  onChange={(e) => setSkillDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  placeholder="Yeni yetenek ekle..."
                />
                <Button variant="outline" onClick={addSkill}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </section>

            {/* Experience Details */}
            <section className="glass-panel rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-purple-700 dark:text-[#C084FC]">
                  İş Deneyimleri
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    updateResume({
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
                  <Plus className="w-3.5 h-3.5 mr-1" /> Ekle
                </Button>
              </div>

              {resume.experience.length === 0 && (
                <p className="text-xs text-slate-500">Henüz deneyim eklenmedi.</p>
              )}

              <div className="space-y-4">
                {resume.experience.map((exp, idx) => (
                  <div
                    key={exp.id}
                    className="rounded-2xl border dark:border-white/5 p-4 space-y-3 bg-slate-100/50 dark:bg-white/[0.01]"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 space-y-2">
                        <Input
                          value={exp.role}
                          onChange={(e) => {
                            const experience = [...resume.experience];
                            experience[idx] = { ...exp, role: e.target.value };
                            updateResume({ experience });
                          }}
                          placeholder="Pozisyon / Rol"
                        />
                        <Input
                          value={exp.company}
                          onChange={(e) => {
                            const experience = [...resume.experience];
                            experience[idx] = { ...exp, company: e.target.value };
                            updateResume({ experience });
                          }}
                          placeholder="Şirket"
                        />
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-rose-500 hover:bg-rose-500/5 shrink-0"
                        onClick={() =>
                          updateResume({
                            experience: resume.experience.filter((x) => x.id !== exp.id),
                          })
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={exp.start}
                        onChange={(e) => {
                          const experience = [...resume.experience];
                          experience[idx] = { ...exp, start: e.target.value };
                          updateResume({ experience });
                        }}
                        placeholder="Başlangıç Tarihi (Örn. 2022)"
                      />
                      <Input
                        value={exp.end}
                        onChange={(e) => {
                          const experience = [...resume.experience];
                          experience[idx] = { ...exp, end: e.target.value };
                          updateResume({ experience });
                        }}
                        placeholder="Bitiş Tarihi (Örn. Devam Ediyor)"
                      />
                    </div>

                    <Textarea
                      value={exp.highlights.join("\n")}
                      onChange={(e) => {
                        const experience = [...resume.experience];
                        experience[idx] = {
                          ...exp,
                          highlights: e.target.value.split("\n"),
                        };
                        updateResume({ experience });
                      }}
                      placeholder="Başarılar ve Sorumluluklar (Her satıra bir adet)"
                      className="min-h-[80px] font-mono text-xs"
                    />
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Live High-fidelity Print Preview Sheet */}
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white text-slate-800 shadow-2xl p-6 md:p-8 text-left leading-relaxed max-w-full min-h-[640px] font-sans">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 block mb-6 border-b pb-2">
                A4 Canlı Önizleme
              </span>

              {!hasContent ? (
                <div className="text-center py-20 space-y-3">
                  <FileText className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs text-slate-400">
                    Özgeçmişinizi doldurdukça biçimlendirilmiş A4 önizlemesi burada belirecektir.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* CV Header */}
                  <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                        {resume.fullName || "İsim Soyisim"}
                      </h2>
                      <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
                        {resume.headline || "Profesyonel Başlık"}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-2 text-[10px] text-slate-500">
                        {resume.email && (
                          <span className="flex items-center gap-0.5">✉ {resume.email}</span>
                        )}
                        {resume.location && (
                          <span className="flex items-center gap-0.5">📍 {resume.location}</span>
                        )}
                      </div>
                    </div>
                    {resume.photoDataUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={resume.photoDataUrl}
                        alt="Avatar"
                        className="w-14 h-14 rounded-full object-cover border border-slate-200 shadow-sm"
                      />
                    )}
                  </div>

                  {/* Summary Section */}
                  {resume.summary && (
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        PROFESSIONAL SUMMARY
                      </h4>
                      <p className="text-xs text-slate-600 text-justify leading-relaxed">
                        {resume.summary}
                      </p>
                    </div>
                  )}

                  {/* Skills Section */}
                  {resume.skills.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        CORE COMPETENCIES
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {resume.skills.map((s) => (
                          <span
                            key={s}
                            className="bg-slate-50 text-slate-700 border border-slate-200/60 px-2 py-0.5 rounded text-[10px] font-medium"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience Section */}
                  {resume.experience.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        PROFESSIONAL EXPERIENCE
                      </h4>
                      <div className="space-y-3">
                        {resume.experience.map((exp) => (
                          <div key={exp.id} className="space-y-1">
                            <div className="flex justify-between items-baseline text-xs font-bold text-slate-800">
                              <span>
                                {exp.role || "Pozisyon"}
                                <span className="font-normal text-slate-400">
                                  {exp.company ? ` · ${exp.company}` : ""}
                                </span>
                              </span>
                              <span className="font-normal text-slate-400 text-[10px]">
                                {exp.start} – {exp.end}
                              </span>
                            </div>
                            {exp.highlights.length > 0 && (
                              <ul className="list-disc list-inside text-[11px] text-slate-500 pl-1 space-y-0.5">
                                {exp.highlights.filter(Boolean).map((h, i) => (
                                  <li key={i} className="leading-relaxed">
                                    {h}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education Section */}
                  {resume.education.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        EDUCATION
                      </h4>
                      <div className="space-y-2">
                        {resume.education.map((edu) => (
                          <div
                            key={edu.id}
                            className="flex justify-between items-baseline text-xs font-bold text-slate-800"
                          >
                            <span>
                              {edu.school}
                              <span className="font-normal text-slate-400">
                                {edu.degree ? ` — ${edu.degree}` : ""}
                              </span>
                            </span>
                            <span className="font-normal text-slate-400 text-[10px]">{edu.year}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {hasContent && (
              <Button className="w-full shadow-md" variant="primary" onClick={refreshFeedback}>
                Canlı Analizi Tetikle
              </Button>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
